import logging
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import StorageNodeError
from app.db.models.node import StorageNode
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.schemas.nodes import NodeNetworkMetrics, NodeTopologyResponse, StorageNodeResponse, TopologyConnection
from app.storage.node_registry import get_node_registry
from app.utils.time import to_iso, utc_now

logger = logging.getLogger("vault.services.nodes")


class NodeService:
    """Storage node state aggregation and topology service."""

    def _to_response(self, node: StorageNode, shards_count: int = 0, parity_shards_count: int = 0) -> StorageNodeResponse:
        return StorageNodeResponse(
            id=node.id,
            name=node.name,
            status=node.status,
            rack=node.rack,
            ip=node.ip,
            region=node.region,
            capacity=node.capacity_bytes,
            used=node.used_bytes,
            free=node.free_bytes,
            load=node.load,
            objects=node.object_count,
            lastHeartbeat=to_iso(node.last_heartbeat),
            cpu=node.cpu_usage,
            memory=node.memory_usage,
            disk=node.disk_usage,
            network=NodeNetworkMetrics(
                ingressMbps=node.network_ingress_mbps,
                egressMbps=node.network_egress_mbps,
            ),
            shardsCount=shards_count,
            parityShardsCount=parity_shards_count,
            integrityErrors=node.integrity_errors,
            activeRepairs=node.active_repairs,
        )

    async def get_all_nodes(self, session: AsyncSession) -> List[StorageNodeResponse]:
        """Fetch all storage nodes with aggregated shard counts."""
        stmt = select(StorageNode).order_by(StorageNode.id.asc())
        res = await session.execute(stmt)
        nodes = list(res.scalars().all())

        responses = []
        for node in nodes:
            # Count data and parity shards
            total_cnt_res = await session.execute(
                select(func.count(Shard.id)).where(Shard.node_id == node.id)
            )
            total_cnt = total_cnt_res.scalar() or 0

            parity_cnt_res = await session.execute(
                select(func.count(Shard.id)).where(Shard.node_id == node.id, Shard.shard_type == "parity")
            )
            parity_cnt = parity_cnt_res.scalar() or 0

            responses.append(self._to_response(node, shards_count=total_cnt, parity_shards_count=parity_cnt))
        return responses

    async def get_node_by_id(self, session: AsyncSession, node_id: str) -> Optional[StorageNodeResponse]:
        """Fetch single storage node by ID."""
        stmt = select(StorageNode).where(StorageNode.id == node_id)
        res = await session.execute(stmt)
        node = res.scalar_one_or_none()
        if not node:
            return None

        total_cnt_res = await session.execute(
            select(func.count(Shard.id)).where(Shard.node_id == node.id)
        )
        total_cnt = total_cnt_res.scalar() or 0

        parity_cnt_res = await session.execute(
            select(func.count(Shard.id)).where(Shard.node_id == node.id, Shard.shard_type == "parity")
        )
        parity_cnt = parity_cnt_res.scalar() or 0

        return self._to_response(node, shards_count=total_cnt, parity_shards_count=parity_cnt)

    async def check_single_node(self, session: AsyncSession, node_id: str) -> StorageNodeResponse:
        """Trigger immediate ping/health query to node."""
        stmt = select(StorageNode).where(StorageNode.id == node_id)
        res = await session.execute(stmt)
        node = res.scalar_one_or_none()
        if not node:
            raise StorageNodeError(node_id, f"Node {node_id} not found in database", status_code=404)

        registry = get_node_registry()
        client = registry.get_client(node_id)
        health_resp = await client.health_check()
        
        node.status = "online" if health_resp.status == "healthy" else health_resp.status
        node.last_heartbeat = utc_now()
        
        if node.status == "online":
            try:
                stats = await client.get_node_stats()
                node.used_bytes = stats.disk.used_bytes
                node.free_bytes = stats.disk.free_bytes
                node.capacity_bytes = stats.disk.total_bytes
                node.cpu_usage = stats.cpu_percent
                node.memory_usage = stats.memory_percent
                node.load = stats.load_average
            except Exception as e:
                logger.warning(f"Could not fetch stats from node {node_id}: {e}")

        await session.commit()
        return await self.get_node_by_id(session, node_id)

    async def get_topology(self, session: AsyncSession) -> NodeTopologyResponse:
        """Fetch nodes and object-shard-node connections for frontend visualization."""
        node_responses = await self.get_all_nodes(session)

        # Query active shards and their parent objects
        shard_stmt = (
            select(Shard)
            .options(selectinload(Shard.object))
            .join(Object)
            .where(Object.status.in_(["healthy", "degraded", "repairing", "corrupted"]))
            .limit(100)
        )
        shard_res = await session.execute(shard_stmt)
        active_shards = list(shard_res.scalars().all())

        connections: List[TopologyConnection] = []
        for s in active_shards:
            connections.append(
                TopologyConnection(
                    objectId=s.object_id,
                    objectName=s.object.name,
                    shardId=s.id,
                    shardLabel=s.label,
                    shardType=s.shard_type,
                    nodeId=s.node_id,
                    status=s.status,
                )
            )

        online_cnt = sum(1 for n in node_responses if n.status == "online")
        degraded_cnt = sum(1 for n in node_responses if n.status == "degraded")
        offline_cnt = sum(1 for n in node_responses if n.status == "offline")

        return NodeTopologyResponse(
            nodes=node_responses,
            connections=connections,
            totalNodes=len(node_responses),
            onlineNodes=online_cnt,
            degradedNodes=degraded_cnt,
            offlineNodes=offline_cnt,
        )


_default_node_service: Optional[NodeService] = None


def get_node_service() -> NodeService:
    global _default_node_service
    if _default_node_service is None:
        _default_node_service = NodeService()
    return _default_node_service
