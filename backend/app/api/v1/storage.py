from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.storage import StorageMetricsResponse, StorageOverviewResponse
from app.services.storage_service import get_storage_service

router = APIRouter(prefix="/storage", tags=["Storage Analytics"])


@router.get("/overview", response_model=ApiResponse[StorageOverviewResponse])
async def get_storage_overview(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve storage capacity and efficiency overview per Requirement 34."""
    storage_service = get_storage_service()
    overview = await storage_service.get_storage_overview(session)
    return ApiResponse.ok(overview)


@router.get("/metrics", response_model=ApiResponse[StorageMetricsResponse])
async def get_storage_metrics(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve detailed storage metrics matching frontend StorageMetrics format."""
    storage_service = get_storage_service()
    metrics = await storage_service.get_storage_metrics(session)
    return ApiResponse.ok(metrics)
