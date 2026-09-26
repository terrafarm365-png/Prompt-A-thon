import logging
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import text
from app.core.config import get_settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.models.user import User
from app.db.models.node import StorageNode

logger = logging.getLogger("vault.db")

settings = get_settings()

# Engine creation configuration
engine_kwargs = {
    "echo": False,
    "future": True,
}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_size"] = 20
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_pre_ping"] = True

engine = create_async_engine(settings.DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding an async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def check_database_health() -> bool:
    """Execute a simple SELECT 1 to verify database connectivity."""
    try:
        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            return result.scalar() == 1
    except Exception as e:
        logger.warning(f"Database health check failed: {e}")
        return False


async def init_db() -> None:
    """
    Initialize database schema and populate default admin user and configured nodes.
    Used for local dev and automated test setups.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Check/create default user
        admin_email = "admin@vault.distributed"
        result = await session.execute(text("SELECT id FROM users WHERE email = :email"), {"email": admin_email})
        existing_user = result.scalar_one_or_none()
        if not existing_user:
            admin_user = User(
                email=admin_email,
                password_hash=get_password_hash("VaultAdmin2026!"),
                name="Vault Cluster Administrator",
                role="admin",
                is_active=True,
                is_verified=True,
                workspace_name="Vault Production East",
                cluster_name="vault-cluster-primary",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
            )
            session.add(admin_user)
            logger.info("Initialized default cluster administrator account.")

        # Sync configured storage nodes from settings into storage_nodes table
        configured_nodes = settings.get_configured_nodes()
        for node_cfg in configured_nodes:
            res = await session.execute(text("SELECT id FROM storage_nodes WHERE id = :id"), {"id": node_cfg.id})
            existing_node = res.scalar_one_or_none()
            if not existing_node:
                db_node = StorageNode(
                    id=node_cfg.id,
                    name=node_cfg.name,
                    endpoint=node_cfg.url,
                    status="online",
                    enabled=node_cfg.enabled,
                    capacity_bytes=node_cfg.capacity,
                    free_bytes=node_cfg.capacity,
                    used_bytes=0,
                    load=0.0,
                    object_count=0,
                    rack=node_cfg.rack,
                    region=node_cfg.region,
                    ip="127.0.0.1",
                    cpu_usage=12.5,
                    memory_usage=24.0,
                    disk_usage=1.0,
                    network_ingress_mbps=45.2,
                    network_egress_mbps=32.1,
                    integrity_errors=0,
                    active_repairs=0,
                )
                session.add(db_node)
                logger.info(f"Registered configured storage node: {node_cfg.name} ({node_cfg.url})")

        await session.commit()
