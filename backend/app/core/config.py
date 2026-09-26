import os
from functools import lru_cache
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class StorageNodeConfig(BaseModel):
    """Storage node configuration model loaded from environment."""
    id: str
    name: str
    url: str
    capacity: int = 1_000_000_000_000  # Default 1 TB
    enabled: bool = True
    rack: str = "rack-01"
    region: str = "us-east-1"


class Settings(BaseSettings):
    """Application settings using Pydantic Settings."""

    # Application
    APP_NAME: str = "Vault"
    APP_ENV: str = "development"
    DEBUG: bool = True

    # Server Network
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000

    # PostgreSQL Metadata Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/vault"

    # Redis URL for job queue & caching
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT Authentication
    JWT_SECRET_KEY: str = "vault_secret_key_change_me_in_production_32_bytes_min"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS Allowed Origins
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Explicit Storage Node Endpoints (Nodes A-F)
    STORAGE_NODE_A_URL: Optional[str] = "http://localhost:9101"
    STORAGE_NODE_B_URL: Optional[str] = "http://localhost:9102"
    STORAGE_NODE_C_URL: Optional[str] = "http://localhost:9103"
    STORAGE_NODE_D_URL: Optional[str] = "http://localhost:9104"
    STORAGE_NODE_E_URL: Optional[str] = "http://localhost:9105"
    STORAGE_NODE_F_URL: Optional[str] = "http://localhost:9106"

    # Storage Node Protocol & Secret
    STORAGE_NODE_SHARED_SECRET: str = "vault-storage-node-internal-secret-token"
    STORAGE_NODE_TIMEOUT_SECONDS: float = 10.0

    # Erasure Coding RS(4+2)
    DATA_SHARDS: int = 4
    PARITY_SHARDS: int = 2

    # Chunking & Limits
    CHUNK_SIZE_MB: int = 64
    MAX_UPLOAD_SIZE_MB: int = 10240
    HASH_ALGORITHM: str = "sha256"

    # Background Workers
    HEALTH_CHECK_INTERVAL_SECONDS: int = 15
    REPAIR_RETRY_LIMIT: int = 3
    SCRUB_INTERVAL_HOURS: int = 24

    # Logging
    LOG_LEVEL: str = "INFO"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def resolve_serverless_db_url(cls, v: Optional[str]) -> str:
        url = v or "sqlite+aiosqlite:///./vault_dev.db"
        if (os.environ.get("VERCEL") == "1" or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")) and url.startswith("sqlite+aiosqlite:///."):
            return "sqlite+aiosqlite:////tmp/vault_dev.db"
        return url

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).resolve().parent.parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> List[str]:
        """Return parsed list of CORS origins."""
        if not self.CORS_ORIGINS:
            origins = ["http://localhost:3000"]
        else:
            origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        vercel_url = os.environ.get("VERCEL_URL")
        if vercel_url:
            origins.append(f"https://{vercel_url}")
        return origins

    @property
    def total_shards(self) -> int:
        """Total number of shards per block."""
        return self.DATA_SHARDS + self.PARITY_SHARDS

    @property
    def chunk_size_bytes(self) -> int:
        """Chunk size in bytes."""
        return self.CHUNK_SIZE_MB * 1024 * 1024

    @property
    def max_upload_size_bytes(self) -> int:
        """Max upload size in bytes."""
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    def get_configured_nodes(self) -> List[StorageNodeConfig]:
        """Extract and structure all configured storage nodes from environment."""
        configured_nodes: List[StorageNodeConfig] = []
        node_letters = ["A", "B", "C", "D", "E", "F"]
        
        for i, letter in enumerate(node_letters):
            attr_name = f"STORAGE_NODE_{letter}_URL"
            url = getattr(self, attr_name, None)
            if url:
                configured_nodes.append(
                    StorageNodeConfig(
                        id=f"node-{letter.lower()}",
                        name=f"Node-{letter}",
                        url=url.rstrip("/"),
                        capacity=1_000_000_000_000,
                        enabled=True,
                        rack=f"rack-0{1 + (i % 2)}",
                        region="us-east-1",
                    )
                )

        # Also check for any custom additional STORAGE_NODE_*_URL in env
        for key, val in os.environ.items():
            if key.startswith("STORAGE_NODE_") and key.endswith("_URL") and val:
                letter_or_id = key.replace("STORAGE_NODE_", "").replace("_URL", "").lower()
                existing_ids = {n.id for n in configured_nodes}
                target_id = f"node-{letter_or_id}"
                if target_id not in existing_ids:
                    configured_nodes.append(
                        StorageNodeConfig(
                            id=target_id,
                            name=f"Node-{letter_or_id.upper()}",
                            url=val.rstrip("/"),
                            capacity=1_000_000_000_000,
                            enabled=True,
                            rack="rack-01",
                            region="us-east-1",
                        )
                    )

        return configured_nodes

    def validate_durability_configuration(self) -> None:
        """
        Validate erasure coding durability requirements at startup.
        Requirement 58: Fail fast with clear error if configuration is invalid.
        """
        if self.DATA_SHARDS < 1:
            raise ValueError(f"DATA_SHARDS must be at least 1, got {self.DATA_SHARDS}")
        
        if self.PARITY_SHARDS < 1:
            raise ValueError(f"PARITY_SHARDS must be at least 1, got {self.PARITY_SHARDS}")
        
        nodes = self.get_configured_nodes()
        total_required = self.DATA_SHARDS + self.PARITY_SHARDS
        if len(nodes) < total_required:
            raise ValueError(
                f"Durability scheme RS({self.DATA_SHARDS}+{self.PARITY_SHARDS}) requires at least "
                f"{total_required} distinct storage nodes, but only {len(nodes)} are configured."
            )
        
        if self.DATA_SHARDS == 4 and self.PARITY_SHARDS == 2 and len(nodes) < 6:
            raise ValueError(
                f"Default RS(4+2) scheme requires at least 6 configured storage nodes, found {len(nodes)}."
            )


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton settings instance."""
    settings = Settings()
    return settings
