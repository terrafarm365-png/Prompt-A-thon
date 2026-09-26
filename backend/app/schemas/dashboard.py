from pydantic import BaseModel, ConfigDict


class DashboardOverviewResponse(BaseModel):
    """Dashboard analytics overview payload per Requirement 33."""
    storage_used: int
    storage_capacity: int
    object_count: int
    cluster_health: str  # "healthy" | "degraded" | "critical"
    active_repairs: int
    completed_repairs: int
    node_count: int
    healthy_nodes: int
    logical_storage: int
    physical_storage: int
    parity_storage: int
    storage_efficiency: float

    model_config = ConfigDict(populate_by_name=True)
