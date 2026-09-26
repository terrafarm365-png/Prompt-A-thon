from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

# Internal Storage Node Communication Protocol Constants
HEADER_NODE_SECRET = "X-Vault-Node-Secret"
HEADER_SHARD_CHECKSUM = "X-Vault-Shard-Checksum"
HEADER_OBJECT_ID = "X-Vault-Object-ID"
HEADER_SHARD_INDEX = "X-Vault-Shard-Index"
HEADER_SHARD_TYPE = "X-Vault-Shard-Type"


class NodeHealthResponse(BaseModel):
    """Protocol response for GET /health on storage node."""
    status: str  # "healthy" | "degraded" | "offline"
    node_id: str
    uptime_seconds: float = 0.0
    version: str = "1.0.0"


class NodeDiskStats(BaseModel):
    total_bytes: int
    used_bytes: int
    free_bytes: int


class NodeStatsResponse(BaseModel):
    """Protocol response for GET /stats on storage node."""
    node_id: str
    status: str
    disk: NodeDiskStats
    shard_count: int
    load_average: float
    cpu_percent: float = 0.0
    memory_percent: float = 0.0
    uptime_seconds: float = 0.0


class StoreShardResponse(BaseModel):
    """Protocol response for PUT /v1/shards/{shard_id}."""
    shard_id: str
    size_bytes: int
    checksum: str
    stored_at: str


class VerifyShardResponse(BaseModel):
    """Protocol response for POST /v1/shards/{shard_id}/verify."""
    shard_id: str
    valid: bool
    expected_checksum: str
    actual_checksum: str
    checked_at: str


class ListShardsResponse(BaseModel):
    """Protocol response for GET /v1/shards."""
    node_id: str
    shards: List[str]
    total_count: int
