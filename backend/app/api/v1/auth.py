from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.auth import (
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)
from app.schemas.common import ApiResponse
from app.services.auth_service import get_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=ApiResponse[UserProfileResponse], status_code=status.HTTP_201_CREATED)
async def register(
    request: UserRegisterRequest,
    session: AsyncSession = Depends(get_db),
):
    """Register a new user account in Vault."""
    auth_service = get_auth_service()
    user = await auth_service.register_user(session, request)
    profile = auth_service.get_profile(user)
    return ApiResponse.ok(profile)


@router.post("/login", response_model=ApiResponse[TokenResponse])
async def login(
    request: UserLoginRequest,
    session: AsyncSession = Depends(get_db),
):
    """Authenticate with email and password to receive JWT tokens."""
    auth_service = get_auth_service()
    token = await auth_service.authenticate_user(session, request.email, request.password)
    return ApiResponse.ok(token)


@router.post("/refresh", response_model=ApiResponse[TokenResponse])
async def refresh_token(
    request: RefreshTokenRequest,
    session: AsyncSession = Depends(get_db),
):
    """Renew access token using a valid refresh token."""
    auth_service = get_auth_service()
    tokens = await auth_service.refresh_tokens(session, request.refresh_token)
    return ApiResponse.ok(tokens)


@router.post("/logout", response_model=ApiResponse[dict])
async def logout(
    current_user: User = Depends(get_current_user),
):
    """Invalidate current session."""
    return ApiResponse.ok({"message": "Successfully logged out"})


@router.get("/me", response_model=ApiResponse[UserProfileResponse])
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Get the profile of currently authenticated user."""
    auth_service = get_auth_service()
    profile = auth_service.get_profile(current_user)
    return ApiResponse.ok(profile)
