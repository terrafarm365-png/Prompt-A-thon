from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.auth import UserProfileResponse
from app.schemas.common import ApiResponse
from app.services.auth_service import get_auth_service

router = APIRouter(prefix="/users", tags=["Users"])


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    avatarUrl: Optional[str] = None
    workspaceName: Optional[str] = None


@router.get("/me", response_model=ApiResponse[UserProfileResponse])
async def get_current_profile(
    current_user: User = Depends(get_current_user),
):
    """Retrieve authenticated user's profile."""
    auth_service = get_auth_service()
    return ApiResponse.ok(auth_service.get_profile(current_user))


@router.patch("/me", response_model=ApiResponse[UserProfileResponse])
async def update_current_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Update profile attributes."""
    if request.name is not None:
        current_user.name = request.name
    if request.avatarUrl is not None:
        current_user.avatar_url = request.avatarUrl
    if request.workspaceName is not None:
        current_user.workspace_name = request.workspaceName

    await session.commit()
    await session.refresh(current_user)

    auth_service = get_auth_service()
    return ApiResponse.ok(auth_service.get_profile(current_user))
