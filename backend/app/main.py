import asyncio
from contextlib import asynccontextmanager
import time
import uuid
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_v1_router
from app.core.config import get_settings
from app.core.exceptions import VaultException
from app.core.logging import get_logger, request_id_ctx, setup_logging
from app.db.session import init_db
from app.schemas.common import ApiResponse
from app.workers.health_worker import HealthWorker
from app.workers.rebalance_worker import MaintenanceWorker
from app.workers.repair_worker import RepairWorker
from app.workers.tasks import get_task_queue

settings = get_settings()
setup_logging(settings.LOG_LEVEL)
logger = get_logger("vault.main")

# Background worker instances
health_worker: HealthWorker = HealthWorker()
repair_worker: RepairWorker = RepairWorker()
maintenance_worker: MaintenanceWorker = MaintenanceWorker()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager: starts services, runs checks, and cleanly shuts down."""
    logger.info("Initializing Vault Control Plane...")

    # 1. Validate cluster durability configuration (Requirement 58)
    try:
        settings.validate_durability_configuration()
        logger.info(
            f"Durability configuration validated: RS({settings.DATA_SHARDS}+{settings.PARITY_SHARDS}) "
            f"across {len(settings.get_configured_nodes())} configured storage nodes."
        )
    except Exception as e:
        logger.critical(f"FATAL: Durability configuration error: {e}")
        raise

    # 2. Initialize database schema & default nodes
    await init_db()

    # 3. Connect task queue (Redis / in-memory fallback)
    await get_task_queue().connect()

    # 4. Start background workers (skip in serverless runtimes where loops are frozen)
    is_serverless = os.environ.get("VERCEL") == "1" or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None
    if not is_serverless:
        await health_worker.start()
        await repair_worker.start()
        await maintenance_worker.start()
    else:
        logger.info("Serverless runtime detected (Vercel); continuous background worker loops bypassed.")

    logger.info(f"Vault Control Plane online. Listening on {settings.API_HOST}:{settings.API_PORT}")
    yield

    # Shutdown
    if not is_serverless:
        logger.info("Shutting down background workers...")
        await health_worker.stop()
        await repair_worker.stop()
        await maintenance_worker.stop()
    logger.info("Vault Control Plane shutdown complete.")


app = FastAPI(
    title=f"{settings.APP_NAME} Control Plane API",
    description=(
        "Distributed Object Storage Control Plane featuring Reed-Solomon RS(4+2) erasure coding, "
        "cryptographic SHA-256 integrity verification, autonomous node self-healing, and real-time telemetry."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware (supports configured origins plus any *.vercel.app deployment preview)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_db_initialized = False


@app.middleware("http")
async def request_tracing_middleware(request: Request, call_next):
    """Assigns unique X-Request-ID and measures request latency for observability."""
    global _db_initialized
    if not _db_initialized:
        try:
            await init_db()
            _db_initialized = True
        except Exception as e:
            logger.warning(f"Lazy DB initialization check: {e}")
            _db_initialized = True

    req_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    token = request_id_ctx.set(req_id)
    start_time = time.perf_counter()

    try:
        response: Response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        # Suppress log noise on health polling
        if not request.url.path.endswith("/health"):
            logger.info(
                f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                },
            )
        return response
    finally:
        request_id_ctx.reset(token)


# Exception Handlers (Requirement 31: unified JSON envelopes, no exposed stack traces)
@app.exception_handler(VaultException)
async def vault_exception_handler(request: Request, exc: VaultException):
    logger.warning(f"Vault error [{exc.code}] on {request.url.path}: {exc.message}")
    content = ApiResponse.fail(code=exc.code, message=exc.message, details=exc.details).model_dump()
    return JSONResponse(status_code=exc.status_code, content=content)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.warning(f"HTTP error {exc.status_code} on {request.url.path}: {exc.detail}")
    content = ApiResponse.fail(code="HTTP_ERROR", message=str(exc.detail)).model_dump()
    return JSONResponse(status_code=exc.status_code, content=content)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled server error on {request.url.path}: {exc}")
    content = ApiResponse.fail(
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected internal cluster error occurred. Please consult system logs.",
    ).model_dump()
    return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=content)


# Include API v1 Router
app.include_router(api_v1_router)


@app.get("/", tags=["Root"])
async def root():
    """Root metadata endpoint."""
    return {
        "service": settings.APP_NAME,
        "role": "control-plane",
        "version": "1.0.0",
        "durability": f"RS({settings.DATA_SHARDS}+{settings.PARITY_SHARDS})",
        "docs": "/docs",
        "api_v1": "/api/v1",
        "health": "/api/v1/health/system",
    }


@app.get("/health", tags=["Health"])
async def health_probe():
    """Root liveness probe."""
    return {"status": "ok", "service": settings.APP_NAME, "role": "control-plane"}

