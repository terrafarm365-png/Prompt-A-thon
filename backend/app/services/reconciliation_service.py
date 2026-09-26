import json
import logging
from typing import Any, Dict, List, Optional, Set
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.activity import ActivityEvent, SystemEvent
from app.db.models.node import StorageNode
from app.db.models.shard import Shard
from app.storage.node_registry import get_node_registry

logger = logging.getLogger("vault.services.reconciliation")


class ReconciliationService:
    """Reconciles database metadata against physical storage node disk state."""

    async def reconcile_cluster(self, session: AsyncSession) -> Dict[str, Any]:
        """
        Compare DB shards vs physical shards on nodes.
        Detects missing physical shards and orphaned shards on nodes.
        """
        registry = get_node_registry()
        
        # Get online nodes
        stmt = select(StorageNode).where(StorageNode.enabled == True, StorageNode.status == "online")
        res = await session.execute(stmt)
        nodes = list(res.scalars().all())

        results = {
            "total_nodes_checked": len(nodes),
            "missing_physical_shards": 0,
            "orphaned_physical_shards": 0,
            "discrepancies": [],
        }

        for node in nodes:
            client = registry.get_client(node.id)
            try:
                # Query physical shards from node
                list_resp = await client.list_shards()
                physical_shard_ids: Set[str] = set(list_resp.shards)

                # Query expected shards from DB
                db_shard_stmt = select(Shard).where(Shard.node_id == node.id)
                db_shard_res = await session.execute(db_shard_stmt)
                db_shards = list(db_shard_res.scalars().all())
                db_shard_ids: Set[str] = {s.id for s in db_shards}

                # 1. Shards in DB but missing on physical node
                missing_on_disk = db_shard_ids - physical_shard_ids
                for m_id in missing_on_disk:
                    results["missing_physical_shards"] += 1
                    target_shard = next((s for s in db_shards if s.id == m_id), None)
                    if target_shard and target_shard.status == "healthy":
                        target_shard.status = "missing"
                        logger.warning(f"Reconciliation detected missing shard {m_id} on node {node.id}")
                        results["discrepancies"].append({
                            "type": "MISSING_ON_DISK",
                            "node_id": node.id,
                            "shard_id": m_id,
                        })

                # 2. Shards on physical node but unknown in DB (orphaned)
                orphaned_on_disk = physical_shard_ids - db_shard_ids
                for o_id in orphaned_on_disk:
                    results["orphaned_physical_shards"] += 1
                    logger.warning(f"Reconciliation detected orphan shard {o_id} on node {node.id}")
                    results["discrepancies"].append({
                        "type": "ORPHANED_ON_DISK",
                        "node_id": node.id,
                        "shard_id": o_id,
                    })

                if missing_on_disk or orphaned_on_disk:
                    sys_event = SystemEvent(
                        category="reconciliation",
                        name="DISK_METADATA_DISCREPANCY",
                        payload_json=json.dumps({
                            "node_id": node.id,
                            "missing_count": len(missing_on_disk),
                            "orphan_count": len(orphaned_on_disk),
                        }),
                    )
                    session.add(sys_event)

            except Exception as e:
                logger.error(f"Reconciliation failed for node {node.id}: {e}")

        await session.commit()
        return results


_default_reconciliation_service: Optional[ReconciliationService] = None


def get_reconciliation_service() -> ReconciliationService:
    global _default_reconciliation_service
    if _default_reconciliation_service is None:
        _default_reconciliation_service = ReconciliationService()
    return _default_reconciliation_service
