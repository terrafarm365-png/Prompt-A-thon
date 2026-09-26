import logging
from typing import List, Optional, Set
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import StorageNodeError
from app.db.models.node import StorageNode

logger = logging.getLogger("vault.services.placement")


class PlacementService:
    """Intelligent shard placement engine balancing health, capacity, load, and rack topology."""

    async def select_nodes_for_object(
        self,
        session: AsyncSession,
        total_shards: int = 6,
        exclude_node_ids: Optional[Set[str]] = None,
    ) -> List[StorageNode]:
        """
        Dynamically select `total_shards` distinct healthy storage nodes.
        Filters out offline or disabled nodes.
        Orders candidates by:
          1. Status (online > degraded)
          2. Free capacity descending
          3. Current load ascending
          4. Rack distribution diversity
        """
        exclude = exclude_node_ids or set()
        
        stmt = (
            select(StorageNode)
            .where(
                StorageNode.enabled == True,
                StorageNode.status.in_(["online", "degraded"]),
                ~StorageNode.id.in_(exclude),
            )
            .order_by(
                # Prefer online over degraded
                StorageNode.status.desc(),
                # Prefer nodes with more free capacity
                StorageNode.free_bytes.desc(),
                # Prefer lower load
                StorageNode.load.asc(),
            )
        )
        result = await session.execute(stmt)
        candidates = list(result.scalars().all())

        if len(candidates) < total_shards:
            raise StorageNodeError(
                node_id="cluster",
                message=(
                    f"Insufficient healthy storage nodes for placement. "
                    f"Required: {total_shards}, Available: {len(candidates)}"
                ),
            )

        # Rack-diverse selection algorithm
        selected: List[StorageNode] = []
        racks_used: Set[str] = set()

        # First pass: try to pick nodes from different racks
        remaining: List[StorageNode] = []
        for node in candidates:
            if node.rack not in racks_used and len(selected) < total_shards:
                selected.append(node)
                racks_used.add(node.rack)
            else:
                remaining.append(node)

        # Second pass: fill up to total_shards with best remaining candidates
        for node in remaining:
            if len(selected) >= total_shards:
                break
            selected.append(node)

        logger.info(
            f"Selected {len(selected)} placement nodes: {[n.name for n in selected]} "
            f"across racks: {[n.rack for n in selected]}"
        )
        return selected

    async def select_repair_destination(
        self,
        session: AsyncSession,
        existing_shard_node_ids: Set[str],
    ) -> StorageNode:
        """
        Select a healthy destination node for a reconstructed shard.
        Must NOT be one of the nodes that already holds a shard for this object!
        """
        stmt = (
            select(StorageNode)
            .where(
                StorageNode.enabled == True,
                StorageNode.status == "online",
                ~StorageNode.id.in_(existing_shard_node_ids),
            )
            .order_by(
                StorageNode.free_bytes.desc(),
                StorageNode.load.asc(),
            )
        )
        result = await session.execute(stmt)
        candidate = result.scalars().first()

        if not candidate:
            raise StorageNodeError(
                node_id="cluster",
                message="No healthy alternate storage node available to host the repaired shard",
            )
        return candidate


_default_placement_service: Optional[PlacementService] = None


def get_placement_service() -> PlacementService:
    """Get singleton PlacementService instance."""
    global _default_placement_service
    if _default_placement_service is None:
        _default_placement_service = PlacementService()
    return _default_placement_service
