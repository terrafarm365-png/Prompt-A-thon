from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.dashboard import DashboardOverviewResponse
from app.services.storage_service import get_storage_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=ApiResponse[DashboardOverviewResponse])
async def get_dashboard_overview(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve complete cluster metrics for the frontend Dashboard overview per Requirement 33."""
    storage_service = get_storage_service()
    overview = await storage_service.get_dashboard_overview(session)
    return ApiResponse.ok(overview)
