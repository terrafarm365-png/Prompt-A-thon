from typing import List
from pydantic import BaseModel, ConfigDict


class StorageHistoryPoint(BaseModel):
    date: str
    logical: int
    physical: int


class StorageMetricsResponse(BaseModel):
    """Storage metrics matching frontend StorageMetrics interface."""
    logicalUsed: int
    physicalUsed: int
    totalCapacity: int
    availableCapacity: int
    parityReserved: int
    overheadRatio: float
    efficiencyPercent: float
    history: List[StorageHistoryPoint]

    model_config = ConfigDict(populate_by_name=True)


class StorageOverviewResponse(BaseModel):
    """Storage overview analytics per Requirement 34."""
    logical_storage: int
    physical_storage: int
    parity_storage: int
    available_storage: int
    storage_efficiency: float
    data_shards: int
    parity_shards: int
    node_count: int
