from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ShardResponse(BaseModel):
    """Shard details matching frontend Shard type."""
    id: str
    objectId: str
    type: str  # "data" | "parity"
    index: int
    label: str  # "D1", "D2", "P1", "P2"
    nodeId: str
    nodeName: str
    checksum: str
    status: str  # "healthy" | "rebuilding" | "corrupted" | "missing"
    size: int

    model_config = ConfigDict(populate_by_name=True)


class ErasureCodingResponse(BaseModel):
    """Erasure coding metadata matching frontend scheme."""
    scheme: str  # "RS(4+2)"
    dataShards: int
    parityShards: int
    shards: List[ShardResponse]

    model_config = ConfigDict(populate_by_name=True)


class VaultObjectResponse(BaseModel):
    """Complete object response matching frontend VaultObject interface."""
    id: str
    name: str
    size: int
    physicalSize: int
    type: str
    mimeType: str
    status: str  # "healthy" | "degraded" | "repairing" | "corrupted"
    createdAt: str
    updatedAt: str
    version: int
    bucket: str
    checksum: str
    erasureCoding: ErasureCodingResponse

    model_config = ConfigDict(populate_by_name=True)


class InitiateUploadRequest(BaseModel):
    """Payload to initiate a multipart or chunked upload session."""
    name: str = Field(..., min_length=1)
    size: int = Field(..., gt=0)
    content_type: Optional[str] = "application/octet-stream"
    bucket: Optional[str] = "vault-prod-east1"
    idempotency_key: Optional[str] = None


class InitiateUploadResponse(BaseModel):
    """Upload session initialization response."""
    upload_id: str
    chunk_size: int
    data_shards: int
    parity_shards: int
    total_shards: int
    expires_at: str


class CompleteUploadRequest(BaseModel):
    """Request to finalize an upload session."""
    checksum: Optional[str] = None
