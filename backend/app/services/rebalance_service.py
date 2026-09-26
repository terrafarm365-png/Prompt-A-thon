import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import StorageNodeError, VaultException
from app.db.models.node import StorageNode
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.services.activity_service import get_activity_service
from app.storage.node_registry import get_node_registry

logger = logging.getLogger("vault.services.rebalance")


class RebalanceService:
    """Cluster load-balancing and shard re-distribution service."""

    async def check_and_rebalance(
        self,
        session: AsyncSession,
        max_shards_to_move: int = 5,
    ) -> Dict[str, Any]:
        """
        Detects capacity and shard skew across nodes.
        Safely copies movable shards to underutilized nodes.
        Deletes source copy ONLY after destination verification succeeds.
        """
        # Fetch all online nodes
        stmt = select(StorageNode).where(StorageNode.enabled == True, StorageNode.status == "online")
        res = await session.execute(stmt)
        nodes = list(res.scalars().all())

        if len(nodes) < 2:
            return {"status": "skipped", "reason": "Fewer than 2 online nodes available"}

        # Calculate shard counts per node
        shard_counts: Dict[str, int] = {}
        for n in nodes:
            count_stmt = select(func.count(Shard.id)).where(Shard.node_id == n.id, Shard.status == "healthy")
            cnt_res = await session.execute(count_stmt)
            shard_counts[n.id] = cnt_res.scalar() or 0

        avg_shards = sum(shard_counts.values()) / len(nodes)
        
        # Identify overloaded node (highest shard count) and underutilized node (lowest shard count)
        sorted_nodes = sorted(nodes, key=lambda n: shard_counts.get(n.id, 0), reverse=True)
        overloaded = sorted_nodes[0]
        underutilized = sorted_nodes[-1]

        diff = shard_counts[overloaded.id] - shard_counts[underutilized.id]
        if diff <= 1:
            return {"status": "balanced", "moved_count": 0}

        # Find movable shards from overloaded node whose object does NOT already have a shard on underutilized node
        # Find shards on overloaded node
        shard_stmt = (
            select(Shard)
            .options(selectinload(Shard.object).selectinload(Object.shards))
            .where(Shard.node_id == overloaded.id, Shard.status == "healthy")
            .limit(max_shards_to_move)
        )
        shard_res = await session.execute(shard_stmt)
        candidate_shards = list(shard_res.scalars().all())

        registry = get_node_registry()
        activity = get_activity_service()
        moved_count = 0

        for candidate in candidate_shards:
            # Verify underutilized node doesn't already host a shard for this object
            existing_node_ids = {s.node_id for s in candidate.object.shards}
            if underutilized.id in existing_node_ids:
                continue

            # Step 1: Read shard from source node
            source_client = registry.get_client(overloaded.id)
            dest_client = registry.get_client(underutilized.id)

            try:
                payload = await source_client.read_shard(candidate.id, expected_checksum=candidate.checksum)
                
                # Step 2: Store on destination node
                await dest_client.store_shard(
                    shard_id=candidate.id,
                    data=payload,
                    checksum=candidate.checksum,
                    object_id=candidate.object_id,
                    shard_index=candidate.shard_index,
                    shard_type=candidate.shard_type,
                )

                # Step 3: Verify destination node write
                ver = await dest_client.verify_shard(candidate.id, expected_checksum=candidate.checksum)
                if not ver.valid:
                    logger.error(f"Rebalance verification failed for shard {candidate.id} on {underutilized.id}")
                    await dest_client.delete_shard(candidate.id)
                    continue

                # Step 4: Update metadata FIRST
                candidate.node_id = underutilized.id
                overloaded.used_bytes = max(0, overloaded.used_bytes - candidate.size)
                overloaded.free_bytes = overloaded.capacity_bytes - overloaded.used_bytes
                underutilized.used_bytes += candidate.size
                underutilized.free_bytes = max(0, underutilized.capacity_bytes - underutilized.used_bytes)
                await session.commit()

                # Step 5: Safe delete from source node ONLY after destination verified and DB committed
                await source_client.delete_shard(candidate.id)

                # Step 6: Log activity
                await activity.log_event(
                    session=session,
                    event_type="rebalance",
                    title=f"Shard Rebalanced: {candidate.label}",
                    description=f"Moved shard {candidate.id} from {overloaded.name} to {underutilized.name} to balance load.",
                    severity="info",
                    target_id=candidate.id,
                    metadata={
                        "shard_id": candidate.id,
                        "source_node": overloaded.id,
                        "destination_node": underutilized.id,
                    },
                )
                moved_count += 1
                if moved_count >= max_shards_to_move:
                    break

            except Exception as e:
                logger.warning(f"Rebalance failed for shard {candidate.id}: {e}")

        return {
            "status": "completed",
            "moved_count": moved_count,
            "source_node": overloaded.id,
            "destination_node": underutilized.id,
        }


_default_rebalance_service: Optional[RebalanceService] = None


def get_rebalance_service() -> RebalanceService:
    global _default_rebalance_service
    if _default_rebalance_service is None:
        _default_rebalance_service = RebalanceService()
    return _default_rebalance_service
