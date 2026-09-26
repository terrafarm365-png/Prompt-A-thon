import asyncio
import logging
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.node import StorageNode
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.db.session import AsyncSessionLocal
from app.services.activity_service import get_activity_service
from app.services.repair_service import get_repair_service
from app.storage.node_registry import get_node_registry
from app.utils.time import utc_now
from app.workers.tasks import get_task_queue

logger = logging.getLogger("vault.workers.health")
settings = get_settings()


class HealthWorker:
    """Background worker monitoring storage node heartbeats and health status."""

    def __init__(self, interval_seconds: int = settings.HEALTH_CHECK_INTERVAL_SECONDS):
        self.interval = interval_seconds
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        """Start periodic health loop."""
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info(f"HealthWorker started (interval: {self.interval}s)")

    async def stop(self) -> None:
        """Gracefully stop health loop."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("HealthWorker stopped.")

    async def _run_loop(self) -> None:
        while self._running:
            try:
                await self.check_all_nodes()
            except Exception as e:
                logger.error(f"Error during node health check cycle: {e}")
            await asyncio.sleep(self.interval)

    async def check_all_nodes(self) -> None:
        """Execute one health check round for all configured nodes."""
        registry = get_node_registry()
        activity = get_activity_service()
        repair_service = get_repair_service()
        task_queue = get_task_queue()

        async with AsyncSessionLocal() as session:
            stmt = select(StorageNode).where(StorageNode.enabled == True)
            res = await session.execute(stmt)
            nodes = list(res.scalars().all())

            for node in nodes:
                client = registry.get_client(node.id)
                previous_status = node.status

                try:
                    health_resp = await client.health_check()
                    current_status = "online" if health_resp.status == "healthy" else health_resp.status
                    node.last_heartbeat = utc_now()
                except Exception:
                    current_status = "offline"

                node.status = current_status

                # If status changed
                if previous_status != current_status:
                    logger.warning(f"Storage node {node.id} status changed from {previous_status} to {current_status}")
                    
                    if current_status == "offline":
                        await activity.log_event(
                            session=session,
                            event_type="node_offline",
                            title=f"Node Offline Alert: {node.name}",
                            description=f"Storage node {node.name} ({node.id}) is unreachable.",
                            severity="error",
                            target_id=node.id,
                            metadata={"node_id": node.id, "previous_status": previous_status},
                        )

                        # Find affected shards on this offline node
                        shard_stmt = select(Shard).where(Shard.node_id == node.id, Shard.status == "healthy")
                        shard_res = await session.execute(shard_stmt)
                        affected_shards = list(shard_res.scalars().all())

                        for shard in affected_shards:
                            shard.status = "missing"
                            try:
                                # Queue repair task
                                rep_task = await repair_service.queue_repair_task(
                                    session=session,
                                    object_id=shard.object_id,
                                    missing_shard_id=shard.id,
                                    reason=f"Storage node {node.name} went offline",
                                )
                                await task_queue.enqueue_repair(rep_task.id)
                            except Exception as rep_err:
                                logger.error(f"Failed to queue repair for shard {shard.id}: {rep_err}")

                    elif current_status == "online":
                        await activity.log_event(
                            session=session,
                            event_type="node_joined",
                            title=f"Node Online: {node.name}",
                            description=f"Storage node {node.name} ({node.id}) is now online and reachable.",
                            severity="info",
                            target_id=node.id,
                            metadata={"node_id": node.id},
                        )

                # Update disk and hardware stats if online
                if current_status == "online":
                    try:
                        stats = await client.get_node_stats()
                        node.used_bytes = stats.disk.used_bytes
                        node.free_bytes = stats.disk.free_bytes
                        node.capacity_bytes = stats.disk.total_bytes
                        node.load = stats.load_average
                        node.cpu_usage = stats.cpu_percent
                        node.memory_usage = stats.memory_percent
                    except Exception as e:
                        logger.debug(f"Failed to fetch stats for online node {node.id}: {e}")

            await session.commit()
