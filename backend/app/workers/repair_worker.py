import asyncio
import logging
from typing import Optional
from sqlalchemy import select

from app.db.session import AsyncSessionLocal
from app.services.repair_service import get_repair_service
from app.workers.tasks import get_task_queue

logger = logging.getLogger("vault.workers.repair")


class RepairWorker:
    """Background worker continuously pulling and processing queued shard repairs."""

    def __init__(self, poll_interval: float = 2.0):
        self.poll_interval = poll_interval
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        """Start worker processing loop."""
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("RepairWorker started.")

    async def stop(self) -> None:
        """Gracefully stop worker loop."""
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("RepairWorker stopped.")

    async def _run_loop(self) -> None:
        queue = get_task_queue()
        repair_service = get_repair_service()

        while self._running:
            try:
                repair_id = await queue.dequeue_repair(timeout=self.poll_interval)
                if repair_id:
                    logger.info(f"RepairWorker processing task: {repair_id}")
                    async with AsyncSessionLocal() as session:
                        try:
                            await repair_service.execute_repair(session, repair_id)
                        except Exception as e:
                            logger.error(f"Repair execution failed for {repair_id}: {e}")
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in RepairWorker loop: {e}")
                await asyncio.sleep(self.poll_interval)
