import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AuthenticationError, VaultException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.db.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserProfileResponse,
    UserRegisterRequest,
)

logger = logging.getLogger("vault.services.auth")


class AuthService:
    """User authentication and credential verification service."""

    async def register_user(
        self,
        session: AsyncSession,
        request: UserRegisterRequest,
    ) -> User:
        """Register a new user account."""
        stmt = select(User).where(User.email == request.email)
        res = await session.execute(stmt)
        existing = res.scalar_one_or_none()
        if existing:
            raise VaultException(
                f"An account with email '{request.email}' already exists",
                code="USER_ALREADY_EXISTS",
                status_code=400,
            )

        user = User(
            email=request.email,
            password_hash=get_password_hash(request.password),
            name=request.name,
            workspace_name=request.workspace_name or "Vault Production",
            role="user",
            is_active=True,
            is_verified=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    async def authenticate_user(
        self,
        session: AsyncSession,
        email: str,
        password: str,
    ) -> TokenResponse:
        """Validate user credentials and generate JWT tokens."""
        stmt = select(User).where(User.email == email)
        res = await session.execute(stmt)
        user = res.scalar_one_or_none()

        if not user or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")

        if not user.is_active:
            raise AuthenticationError("User account is disabled")

        access_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        refresh_tok = create_refresh_token({"sub": user.id, "email": user.email})

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_tok,
            token_type="bearer",
            expires_in=3600,
        )

    async def refresh_tokens(
        self,
        session: AsyncSession,
        refresh_token_str: str,
    ) -> TokenResponse:
        """Issue new tokens given a valid refresh token."""
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise AuthenticationError("Invalid token type")

        user_id = payload.get("sub")
        stmt = select(User).where(User.id == user_id)
        res = await session.execute(stmt)
        user = res.scalar_one_or_none()

        if not user or not user.is_active:
            raise AuthenticationError("User no longer exists or is inactive")

        access_token = create_access_token({"sub": user.id, "email": user.email, "role": user.role})
        new_refresh = create_refresh_token({"sub": user.id, "email": user.email})

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=3600,
        )

    def get_profile(self, user: User) -> UserProfileResponse:
        """Convert User model to frontend UserProfile format."""
        return UserProfileResponse(
            id=user.id,
            name=user.name,
            email=user.email,
            avatarUrl=user.avatar_url,
            role=user.role,
            workspaceName=user.workspace_name,
            clusterName=user.cluster_name,
        )


_default_auth_service: Optional[AuthService] = None


def get_auth_service() -> AuthService:
    global _default_auth_service
    if _default_auth_service is None:
        _default_auth_service = AuthService()
    return _default_auth_service
