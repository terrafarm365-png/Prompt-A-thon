import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import AuthenticationError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.schemas.auth import UserRegisterRequest
from app.services.auth_service import AuthService


def test_password_hashing():
    pwd = "SuperSecretPassword2026!"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_tokens():
    payload = {"sub": "user-12345", "email": "test@vault.io", "role": "admin"}
    token = create_access_token(payload)
    decoded = decode_token(token)
    assert decoded["sub"] == "user-12345"
    assert decoded["email"] == "test@vault.io"
    assert decoded["type"] == "access"

    refresh = create_refresh_token(payload)
    decoded_refresh = decode_token(refresh)
    assert decoded_refresh["sub"] == "user-12345"
    assert decoded_refresh["type"] == "refresh"


@pytest.mark.asyncio
async def test_auth_service_register_and_login(db_session: AsyncSession):
    auth_service = AuthService()

    # 1. Register new user
    req = UserRegisterRequest(
        email="newuser@vault.io",
        password="MySecretPassword123!",
        name="New Vault User",
        workspace_name="Engineering",
    )
    user = await auth_service.register_user(db_session, req)
    assert user.id is not None
    assert user.email == "newuser@vault.io"

    # 2. Authenticate
    tokens = await auth_service.authenticate_user(db_session, "newuser@vault.io", "MySecretPassword123!")
    assert tokens.access_token is not None
    assert tokens.refresh_token is not None

    # 3. Wrong password
    with pytest.raises(AuthenticationError):
        await auth_service.authenticate_user(db_session, "newuser@vault.io", "WrongPassword!")
