from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict


class ActivityEventResponse(BaseModel):
    """Activity event matching frontend ActivityEvent interface."""
    id: str
    type: str  # "upload" | "delete" | "repair" | "integrity_check" | "node_offline" | "node_joined" | "rebalance"
    title: str
    description: str
    timestamp: str
    severity: str  # "info" | "success" | "warning" | "error"
    targetId: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    model_config = ConfigDict(populate_by_name=True)
