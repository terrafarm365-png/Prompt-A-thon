from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db
from app.schemas.common import ApiResponse
from app.schemas.health import (
    HealthMetricsResponse,
    IntegrityReportResponse,
    SystemHealthResponse,
)
from app.schemas.nodes import StorageNodeResponse
from app.services.health_service import get_health_service
from app.services.integrity_service import get_integrity_service
from app.services.node_service import get_node_service
from app.utils.time import utc_now_iso

router = APIRouter(prefix="/health", tags=["Health & Monitoring"])


@router.get("", response_model=ApiResponse[HealthMetricsResponse])
@router.get("/metrics", response_model=ApiResponse[HealthMetricsResponse])
async def get_health_metrics(
    session: AsyncSession = Depends(get_db),
):
    """Retrieve cluster health metrics matching frontend HealthMetrics format."""
    health_service = get_health_service()
    metrics = await health_service.get_health_metrics(session)
    return ApiResponse.ok(metrics)


@router.get("/system", response_model=ApiResponse[SystemHealthResponse])
async def get_system_health(
    session: AsyncSession = Depends(get_db),
):
    """System-level component health per Requirement 53."""
    health_service = get_health_service()
    sys_health = await health_service.get_system_health(session)
    return ApiResponse.ok(sys_health)


@router.get("/nodes", response_model=ApiResponse[List[StorageNodeResponse]])
async def get_health_nodes(
    session: AsyncSession = Depends(get_db),
):
    """Retrieve health and telemetry states of all storage nodes."""
    node_service = get_node_service()
    nodes = await node_service.get_all_nodes(session)
    return ApiResponse.ok(nodes)


@router.get("/integrity", response_model=ApiResponse[IntegrityReportResponse])
async def get_integrity_report(
    session: AsyncSession = Depends(get_db),
):
    """Run an on-demand integrity verification audit."""
    integrity_service = get_integrity_service()
    scrub_result = await integrity_service.run_integrity_scrub(session, limit=20)
    report = IntegrityReportResponse(
        totalChecked=scrub_result["total"],
        healthyShards=scrub_result["healthy"],
        corruptedShards=scrub_result["corrupted"],
        missingShards=scrub_result["missing"],
        lastScrubCompletedAt=utc_now_iso(),
        status="healthy" if scrub_result["corrupted"] == 0 and scrub_result["missing"] == 0 else "degraded",
    )
    return ApiResponse.ok(report)
