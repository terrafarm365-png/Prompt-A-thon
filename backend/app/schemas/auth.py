from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegisterRequest(BaseModel):
    """Registration request payload."""
    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=2, max_length=100)
    workspace_name: Optional[str] = "Vault Production"


class UserLoginRequest(BaseModel):
    """Login credentials payload."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Refresh token payload."""
    refresh_token: str


class TokenResponse(BaseModel):
    """JWT Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserProfileResponse(BaseModel):
    """User profile response matching frontend UserProfile interface."""
    id: str
    name: str
    email: str
    avatarUrl: Optional[str] = None
    role: str = "admin"
    workspaceName: str = "Vault Production"
    clusterName: str = "vault-cluster-primary"
