import logging
from typing import List, Optional
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.db.models.node import StorageNode
from app.db.models.object import Object
from app.db.models.repair import RepairTask
from app.db.models.shard import Shard
from app.schemas.dashboard import DashboardOverviewResponse
from app.schemas.storage import StorageHistoryPoint, StorageMetricsResponse, StorageOverviewResponse
from app.utils.sizes import calculate_overhead_ratio, calculate_storage_efficiency

logger = logging.getLogger("vault.services.storage")
settings = get_settings()


class StorageService:
    """Storage analytics, capacity planning, and dashboard data aggregator."""

    async def get_storage_overview(self, session: AsyncSession) -> StorageOverviewResponse:
        """Overview analytics per Requirement 34."""
        # Query total capacity across all enabled storage nodes
        cap_res = await session.execute(
            select(func.sum(StorageNode.capacity_bytes), func.count(StorageNode.id))
            .where(StorageNode.enabled == True)
        )
        total_capacity, node_count = cap_res.one()
        total_capacity = total_capacity or (6 * 1_000_000_000_000)
        node_count = node_count or 6

        # Query logical and physical object storage
        obj_res = await session.execute(
            select(
                func.sum(Object.logical_size),
                func.sum(Object.physical_size),
            ).where(Object.status != "deleted")
        )
        logical_size, physical_size = obj_res.one()
        logical_size = logical_size or 0
        physical_size = physical_size or 0

        # Query parity shards storage
        parity_res = await session.execute(
            select(func.sum(Shard.size)).where(Shard.shard_type == "parity")
        )
        parity_size = parity_res.scalar() or 0

        available_storage = max(0, total_capacity - physical_size)
        efficiency = calculate_storage_efficiency(logical_size, physical_size)

        return StorageOverviewResponse(
            logical_storage=logical_size,
            physical_storage=physical_size,
            parity_storage=parity_size,
            available_storage=available_storage,
            storage_efficiency=efficiency,
            data_shards=settings.DATA_SHARDS,
            parity_shards=settings.PARITY_SHARDS,
            node_count=node_count,
        )

    async def get_storage_metrics(self, session: AsyncSession) -> StorageMetricsResponse:
        """Storage metrics matching frontend StorageMetrics interface."""
        overview = await self.get_storage_overview(session)
        overhead = calculate_overhead_ratio(settings.DATA_SHARDS, settings.PARITY_SHARDS)

        # Mock / historical data for frontend charts
        history = [
            StorageHistoryPoint(date="Day 1", logical=round(overview.logical_storage * 0.4), physical=round(overview.physical_storage * 0.4)),
            StorageHistoryPoint(date="Day 2", logical=round(overview.logical_storage * 0.6), physical=round(overview.physical_storage * 0.6)),
            StorageHistoryPoint(date="Day 3", logical=round(overview.logical_storage * 0.8), physical=round(overview.physical_storage * 0.8)),
            StorageHistoryPoint(date="Today", logical=overview.logical_storage, physical=overview.physical_storage),
        ]

        return StorageMetricsResponse(
            logicalUsed=overview.logical_storage,
            physicalUsed=overview.physical_storage,
            totalCapacity=overview.available_storage + overview.physical_storage,
            availableCapacity=overview.available_storage,
            parityReserved=overview.parity_storage,
            overheadRatio=overhead,
            efficiencyPercent=overview.storage_efficiency,
            history=history,
        )

    async def get_dashboard_overview(self, session: AsyncSession) -> DashboardOverviewResponse:
        """Dashboard overview aggregation per Requirement 33."""
        overview = await self.get_storage_overview(session)

        # Object count
        obj_cnt_res = await session.execute(select(func.count(Object.id)).where(Object.status != "deleted"))
        object_count = obj_cnt_res.scalar() or 0

        # Node counts
        node_res = await session.execute(
            select(
                func.count(StorageNode.id),
                func.count(StorageNode.id).filter(StorageNode.status == "online"),
            )
        )
        total_nodes, online_nodes = node_res.one()
        total_nodes = total_nodes or 0
        online_nodes = online_nodes or 0

        # Cluster health
        if online_nodes == total_nodes and total_nodes >= 6:
            cluster_health = "healthy"
        elif online_nodes >= 4:
            cluster_health = "degraded"
        else:
            cluster_health = "critical"

        # Active & completed repairs
        rep_res = await session.execute(
            select(
                func.count(RepairTask.id).filter(RepairTask.status.in_(["in-progress", "running", "queued"])),
                func.count(RepairTask.id).filter(RepairTask.status == "completed"),
            )
        )
        active_repairs, completed_repairs = rep_res.one()

        return DashboardOverviewResponse(
            storage_used=overview.physical_storage,
            storage_capacity=overview.available_storage + overview.physical_storage,
            object_count=object_count,
            cluster_health=cluster_health,
            active_repairs=active_repairs or 0,
            completed_repairs=completed_repairs or 0,
            node_count=total_nodes,
            healthy_nodes=online_nodes,
            logical_storage=overview.logical_storage,
            physical_storage=overview.physical_storage,
            parity_storage=overview.parity_storage,
            storage_efficiency=overview.storage_efficiency,
        )


_default_storage_service: Optional[StorageService] = None


def get_storage_service() -> StorageService:
    global _default_storage_service
    if _default_storage_service is None:
        _default_storage_service = StorageService()
    return _default_storage_service
