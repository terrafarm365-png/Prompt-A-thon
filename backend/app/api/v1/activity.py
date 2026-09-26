from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.activity import ActivityEventResponse
from app.schemas.common import ApiResponse
from app.services.activity_service import get_activity_service

router = APIRouter(prefix="/activity", tags=["Activity Log"])


@router.get("", response_model=ApiResponse[List[ActivityEventResponse]])
async def list_activity_events(
    limit: int = Query(50, ge=1, le=200),
    type: Optional[str] = Query(None, description="Filter by event type"),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve cluster audit activity log events matching frontend ActivityEvent schema."""
    activity_service = get_activity_service()
    events = await activity_service.get_recent_activities(session, limit=limit, event_type=type)
    return ApiResponse.ok(events)
