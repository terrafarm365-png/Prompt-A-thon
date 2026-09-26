import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import StorageNodeConfig, get_settings
from app.core.security import get_password_hash
from app.db.base import Base
from app.db.models.node import StorageNode
from app.db.models.user import User
from app.db.session import get_db
from app.main import app

# Create in-memory SQLite engine for tests
test_engine = create_async_engine(
    "sqlite+aiosqlite:///:memory:",
    connect_args={"check_same_thread": False},
    future=True,
)

TestingSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)





@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides isolated transaction rollback session for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestingSessionLocal() as session:
        # Seed test admin user
        admin = User(
            id="test-admin-id",
            email="admin@vault.test",
            password_hash=get_password_hash("TestPassword123!"),
            name="Test Administrator",
            role="admin",
            is_active=True,
            is_verified=True,
        )
        session.add(admin)

        # Seed 6 test storage nodes
        nodes = [
            StorageNode(
                id=f"node-{letter.lower()}",
                name=f"Node-{letter}",
                endpoint=f"http://localhost:910{i+1}",
                status="online",
                enabled=True,
                capacity_bytes=1_000_000_000_000,
                used_bytes=100_000_000,
                free_bytes=900_000_000_000,
                load=0.1 * i,
                rack=f"rack-0{1 + (i % 2)}",
                region="us-east-1",
            )
            for i, letter in enumerate(["A", "B", "C", "D", "E", "F"])
        ]
        session.add_all(nodes)
        await session.commit()

        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Test HTTP client with DB dependency override."""
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
