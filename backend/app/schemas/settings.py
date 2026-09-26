from typing import Optional
from pydantic import BaseModel, ConfigDict


class DurabilitySettingsResponse(BaseModel):
    """Cluster durability and storage settings matching frontend DurabilitySettings."""
    dataShards: int
    parityShards: int
    autoRepair: bool
    scrubFrequencyDays: int
    compressionEnabled: bool
    encryptionAlgorithm: str
    replicationQuorum: int

    model_config = ConfigDict(populate_by_name=True)


class DurabilitySettingsUpdate(BaseModel):
    """Payload to update cluster settings."""
    dataShards: Optional[int] = None
    parityShards: Optional[int] = None
    autoRepair: Optional[bool] = None
    scrubFrequencyDays: Optional[int] = None
    compressionEnabled: Optional[bool] = None
    encryptionAlgorithm: Optional[str] = None
    replicationQuorum: Optional[int] = None
