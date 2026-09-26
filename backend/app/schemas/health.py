from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict


class HealthMetricsResponse(BaseModel):
    """Cluster health metrics matching frontend HealthMetrics interface."""
    clusterHealth: str  # "healthy" | "degraded" | "critical"
    storageHealth: str  # "healthy" | "degraded" | "critical"
    dataIntegrity: str  # "healthy" | "verifying" | "error"
    repairHealth: str   # "optimal" | "active" | "congested"
    networkHealth: str  # "healthy" | "degraded" | "critical"
    totalNodes: int
    onlineNodes: int
    totalCapacity: int
    usedCapacity: int
    lastScrubTime: str
    avgLatencyMs: float
    p95LatencyMs: float
    ingressMbps: float
    egressMbps: float

    model_config = ConfigDict(populate_by_name=True)


class StorageNodesSummary(BaseModel):
    total: int
    online: int
    degraded: int
    offline: int


class SystemHealthResponse(BaseModel):
    """System overall health check response for /health/system."""
    api: str
    database: str
    redis: str
    storage_nodes: StorageNodesSummary


class IntegrityReportResponse(BaseModel):
    """Integrity scrub report."""
    totalChecked: int
    healthyShards: int
    corruptedShards: int
    missingShards: int
    lastScrubCompletedAt: str
    status: str
