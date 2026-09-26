import asyncio
import logging
from typing import Optional

from app.db.session import AsyncSessionLocal
from app.services.integrity_service import get_integrity_service
from app.services.rebalance_service import get_rebalance_service
from app.services.reconciliation_service import get_reconciliation_service

logger = logging.getLogger("vault.workers.rebalance")


class MaintenanceWorker:
    """Background worker for cluster scrub, rebalance, and reconciliation."""

    def __init__(self, scrub_interval_seconds: int = 3600):
        self.scrub_interval = scrub_interval_seconds
        self._running = False
        self._task: Optional[asyncio.Task] = None

    async def start(self) -> None:
        self._running = True
        self._task = asyncio.create_task(self._run_loop())
        logger.info("MaintenanceWorker started.")

    async def stop(self) -> None:
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        logger.info("MaintenanceWorker stopped.")

    async def _run_loop(self) -> None:
        integrity_service = get_integrity_service()
        rebalance_service = get_rebalance_service()
        reconciliation_service = get_reconciliation_service()

        while self._running:
            try:
                async with AsyncSessionLocal() as session:
                    # 1. Run integrity scrub
                    logger.info("Running periodic integrity scrub...")
                    scrub_res = await integrity_service.run_integrity_scrub(session, limit=20)
                    logger.info(f"Integrity scrub completed: {scrub_res}")

                    # 2. Check and balance cluster load
                    logger.info("Checking cluster load balance...")
                    rebal_res = await rebalance_service.check_and_rebalance(session, max_shards_to_move=3)
                    logger.info(f"Rebalance check completed: {rebal_res}")

                    # 3. Reconcile metadata with storage nodes
                    logger.info("Reconciling disk metadata...")
                    recon_res = await reconciliation_service.reconcile_cluster(session)
                    logger.info(f"Reconciliation completed: {recon_res}")

            except Exception as e:
                logger.error(f"Maintenance cycle failed: {e}")

            await asyncio.sleep(self.scrub_interval)
