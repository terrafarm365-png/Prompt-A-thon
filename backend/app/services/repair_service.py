import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    InsufficientShardsError,
    RepairFailedError,
    StorageNodeError,
    VaultException,
)
from app.db.models.activity import ActivityEvent
from app.db.models.node import StorageNode
from app.db.models.object import Object
from app.db.models.repair import RepairTask
from app.db.models.shard import Shard
from app.services.activity_service import get_activity_service
from app.services.erasure_service import get_erasure_service
from app.services.placement_service import get_placement_service
from app.storage.node_registry import get_node_registry
from app.utils.hashing import compute_sha256
from app.utils.ids import generate_id
from app.utils.time import utc_now

logger = logging.getLogger("vault.services.repair")


class RepairService:
    """Distributed shard self-healing and recovery engine."""

    async def queue_repair_task(
        self,
        session: AsyncSession,
        object_id: str,
        missing_shard_id: str,
        reason: str = "Node failure or corruption detected",
    ) -> RepairTask:
        """Create and queue a RepairTask for background processing."""
        shard_stmt = select(Shard).where(Shard.id == missing_shard_id)
        res = await session.execute(shard_stmt)
        shard = res.scalar_one_or_none()
        if not shard:
            raise VaultException(f"Shard {missing_shard_id} not found", code="SHARD_NOT_FOUND", status_code=404)

        obj_stmt = select(Object).options(selectinload(Object.shards)).where(Object.id == object_id)
        obj_res = await session.execute(obj_stmt)
        obj = obj_res.scalar_one_or_none()
        if not obj:
            raise VaultException(f"Object {object_id} not found", code="OBJECT_NOT_FOUND", status_code=404)

        # Find existing node IDs holding other shards for this object
        existing_nodes = {s.node_id for s in obj.shards if s.id != missing_shard_id}
        
        # Select destination node
        placement = get_placement_service()
        dest_node = await placement.select_repair_destination(session, existing_shard_node_ids=existing_nodes)

        # Source nodes
        surviving_nodes = [s.node_id for s in obj.shards if s.id != missing_shard_id and s.status == "healthy"]

        repair = RepairTask(
            id=generate_id("rep"),
            object_id=object_id,
            object_name=obj.name,
            missing_shard_id=missing_shard_id,
            shard_index=shard.shard_index,
            shard_label=shard.label,
            shard_type=shard.shard_type,
            source_nodes=json.dumps(surviving_nodes),
            destination_node_id=dest_node.id,
            destination_node_name=dest_node.name,
            status="queued",
            progress=0.0,
            reason=reason,
            bytes_total=shard.size,
            bytes_transferred=0,
            retry_count=0,
        )
        session.add(repair)

        # Mark object status as repairing
        obj.status = "repairing"
        shard.status = "repairing"

        # Log activity
        activity = get_activity_service()
        await activity.log_event(
            session=session,
            event_type="repair",
            title=f"Repair Queued: Shard {shard.label}",
            description=f"Repair queued for shard {shard.label} of '{obj.name}' to destination {dest_node.name}.",
            severity="warning",
            target_id=repair.id,
            metadata={"repair_id": repair.id, "object_id": object_id, "shard_id": missing_shard_id},
        )

        await session.commit()
        await session.refresh(repair)
        return repair

    async def execute_repair(
        self,
        session: AsyncSession,
        repair_id: str,
    ) -> RepairTask:
        """
        Executes shard reconstruction:
        1. Fetch surviving shards from healthy nodes.
        2. Reconstruct missing shard using Reed-Solomon algorithm.
        3. Write reconstructed shard to destination node.
        4. Verify checksum.
        5. Update shard metadata.
        6. Update object status to healthy if all shards healthy.
        7. Mark repair completed.
        """
        stmt = (
            select(RepairTask)
            .options(
                selectinload(RepairTask.object).selectinload(Object.shards)
            )
            .where(RepairTask.id == repair_id)
        )
        res = await session.execute(stmt)
        task = res.scalar_one_or_none()
        if not task:
            raise VaultException(f"RepairTask {repair_id} not found", code="TASK_NOT_FOUND", status_code=404)

        obj = task.object
        target_shard = next((s for s in obj.shards if s.id == task.missing_shard_id), None)
        if not target_shard:
            raise VaultException(f"Target shard {task.missing_shard_id} not found on object", code="SHARD_NOT_FOUND", status_code=404)

        task.status = "in-progress"
        task.started_at = utc_now()
        task.progress = 10.0
        await session.commit()

        registry = get_node_registry()
        erasure = get_erasure_service()

        # Step 1: Read surviving shards
        surviving_shards: List[bytes] = []
        surviving_indices: List[int] = []

        for shard in obj.shards:
            if shard.id == target_shard.id:
                continue
            client = registry.get_client(shard.node_id)
            try:
                payload = await client.read_shard(shard.id, expected_checksum=shard.checksum)
                surviving_shards.append(payload)
                surviving_indices.append(shard.shard_index - 1)
            except Exception as e:
                logger.warning(f"Could not read shard {shard.id} during repair: {e}")

        task.progress = 40.0
        await session.commit()

        if len(surviving_shards) < obj.data_shards:
            task.status = "failed"
            task.error_message = f"Insufficient surviving shards: {len(surviving_shards)}/{obj.data_shards} available."
            await session.commit()
            raise InsufficientShardsError(
                object_id=obj.id,
                available=len(surviving_shards),
                required=obj.data_shards,
            )

        # Step 2: Reconstruct target shard
        target_0_index = target_shard.shard_index - 1
        reconstructed_shard_bytes = erasure.reconstruct_shard(
            surviving_shards=surviving_shards,
            surviving_indices=surviving_indices,
            target_shard_index=target_0_index,
            original_size=obj.logical_size,
        )

        reconstructed_checksum = compute_sha256(reconstructed_shard_bytes)
        task.progress = 70.0
        task.bytes_transferred = len(reconstructed_shard_bytes)
        await session.commit()

        # Step 3: Write to destination node
        dest_client = registry.get_client(task.destination_node_id)
        store_resp = await dest_client.store_shard(
            shard_id=target_shard.id,
            data=reconstructed_shard_bytes,
            checksum=reconstructed_checksum,
            object_id=obj.id,
            shard_index=target_shard.shard_index,
            shard_type=target_shard.shard_type,
        )

        # Step 4: Verify destination node write
        verify_resp = await dest_client.verify_shard(
            shard_id=target_shard.id,
            expected_checksum=reconstructed_checksum,
        )
        if not verify_resp.valid:
            task.status = "failed"
            task.error_message = f"Destination node verification failed: {verify_resp.actual_checksum}"
            await session.commit()
            raise RepairFailedError(repair_id, "Destination node checksum verification failed")

        task.progress = 90.0
        await session.commit()

        # Step 5: Update metadata
        target_shard.node_id = task.destination_node_id
        target_shard.checksum = reconstructed_checksum
        target_shard.status = "healthy"
        target_shard.size = len(reconstructed_shard_bytes)

        # Check if all shards on the object are now healthy
        all_healthy = all(s.status == "healthy" for s in obj.shards)
        if all_healthy:
            obj.status = "healthy"
        else:
            obj.status = "degraded"

        task.status = "completed"
        task.progress = 100.0
        task.completed_at = utc_now()

        # Audit log event
        activity = get_activity_service()
        await activity.log_event(
            session=session,
            event_type="repair",
            title=f"Repair Completed: Shard {target_shard.label}",
            description=(
                f"Successfully reconstructed shard {target_shard.label} of '{obj.name}' "
                f"and stored on {task.destination_node_name}."
            ),
            severity="success",
            target_id=task.id,
            metadata={
                "repair_id": task.id,
                "object_id": obj.id,
                "shard_id": target_shard.id,
                "destination_node": task.destination_node_id,
            },
        )

        await session.commit()
        await session.refresh(task)
        logger.info(f"RepairTask {task.id} completed successfully for shard {target_shard.id}")
        return task


_default_repair_service: Optional[RepairService] = None


def get_repair_service() -> RepairService:
    global _default_repair_service
    if _default_repair_service is None:
        _default_repair_service = RepairService()
    return _default_repair_service
