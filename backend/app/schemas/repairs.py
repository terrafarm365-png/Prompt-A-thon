from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class RepairTaskResponse(BaseModel):
    """Repair task matching frontend RepairTask interface."""
    id: str
    objectId: str
    objectName: str
    shardIndex: int
    shardLabel: str
    shardType: str  # "data" | "parity"
    sourceNodeId: str
    sourceNodeName: str
    destinationNodeId: str
    destinationNodeName: str
    progress: float
    status: str  # "in-progress" | "queued" | "completed" | "failed"
    reason: str
    detectedAt: str
    startedAt: Optional[str] = None
    completedAt: Optional[str] = None
    bytesTotal: int
    bytesTransferred: int

    model_config = ConfigDict(populate_by_name=True)


class RepairsListResponse(BaseModel):
    """Categorized repair tasks response."""
    active: List[RepairTaskResponse]
    queued: List[RepairTaskResponse]
    completed: List[RepairTaskResponse]
    failed: List[RepairTaskResponse]
    totalActive: int
    totalCompleted: int


class RepairRetryRequest(BaseModel):
    """Request to re-queue a failed repair task."""
    target_destination_node_id: Optional[str] = None
