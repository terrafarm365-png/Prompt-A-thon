from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class NodeNetworkMetrics(BaseModel):
    ingressMbps: float
    egressMbps: float


class StorageNodeResponse(BaseModel):
    """Storage node representation matching frontend StorageNode interface."""
    id: str
    name: str
    status: str  # "online" | "degraded" | "offline"
    rack: str
    ip: str
    region: str
    capacity: int
    used: int
    free: int
    load: float
    objects: int
    lastHeartbeat: str
    cpu: float
    memory: float
    disk: float
    network: NodeNetworkMetrics
    shardsCount: int
    parityShardsCount: int
    integrityErrors: int
    activeRepairs: int

    model_config = ConfigDict(populate_by_name=True)


class TopologyConnection(BaseModel):
    """Connection between object, shard, and storage node for visualization."""
    objectId: str
    objectName: str
    shardId: str
    shardLabel: str
    shardType: str
    nodeId: str
    status: str


class NodeTopologyResponse(BaseModel):
    """Cluster topology representation."""
    nodes: List[StorageNodeResponse]
    connections: List[TopologyConnection]
    totalNodes: int
    onlineNodes: int
    degradedNodes: int
    offlineNodes: int
