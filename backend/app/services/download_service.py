import asyncio
import logging
from typing import AsyncGenerator, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import (
    CorruptedShardError,
    InsufficientShardsError,
    NodeUnavailableError,
    ObjectNotFoundError,
    PermissionDeniedError,
)
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.db.models.user import User
from app.services.activity_service import get_activity_service
from app.services.erasure_service import get_erasure_service
from app.storage.node_registry import get_node_registry
from app.utils.hashing import compute_sha256

logger = logging.getLogger("vault.services.download")


class DownloadService:
    """Orchestrates distributed shard retrieval, checksum verification, and Reed-Solomon reconstruction."""

    async def reconstruct_and_stream(
        self,
        session: AsyncSession,
        user: User,
        object_id: str,
    ) -> Tuple[Object, bytes]:
        """
        Retrieves object shards from distributed storage nodes.
        Tolerates up to 2 missing or corrupted nodes by reconstructing via surviving RS(4+2) shards.
        Enforces user ownership.
        """
        # Load object with shards
        stmt = (
            select(Object)
            .options(selectinload(Object.shards))
            .where(Object.id == object_id)
        )
        res = await session.execute(stmt)
        obj = res.scalar_one_or_none()

        if not obj or obj.status in ("deleted", "deleting"):
            raise ObjectNotFoundError(object_id)

        # Security check: User must own the object or be admin
        if obj.user_id != user.id and user.role != "admin":
            raise PermissionDeniedError(f"User is not authorized to access object {object_id}")

        registry = get_node_registry()
        erasure = get_erasure_service()

        # Concurrently fetch all shards from their respective nodes
        fetch_tasks = []
        for shard in obj.shards:
            client = registry.get_client(shard.node_id)
            fetch_tasks.append(client.read_shard(shard.id, expected_checksum=shard.checksum))

        results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

        surviving_shards: List[bytes] = []
        surviving_indices: List[int] = []  # 0-indexed for zfec

        for idx, result in enumerate(results):
            shard = obj.shards[idx]
            shard_0_index = shard.shard_index - 1

            if isinstance(result, Exception):
                logger.warning(
                    f"Shard {shard.label} ({shard.id}) on node {shard.node_id} unavailable or failed: {result}"
                )
                continue

            surviving_shards.append(result)
            surviving_indices.append(shard_0_index)

        # Verify quorum
        if len(surviving_shards) < obj.data_shards:
            raise InsufficientShardsError(
                object_id=object_id,
                available=len(surviving_shards),
                required=obj.data_shards,
                details={
                    "total_shards": len(obj.shards),
                    "surviving_count": len(surviving_shards),
                },
            )

        # Reconstruct logical object
        reconstructed_data = erasure.decode(
            shards=surviving_shards,
            shard_indices=surviving_indices,
            original_size=obj.logical_size,
        )

        # Verify overall reconstructed checksum
        if obj.checksum:
            actual_checksum = compute_sha256(reconstructed_data)
            if actual_checksum != obj.checksum:
                logger.critical(
                    f"Object {object_id} reconstruction failed overall SHA-256 check! "
                    f"Expected: {obj.checksum}, Got: {actual_checksum}"
                )
                raise CorruptedShardError(
                    shard_id=f"object-{object_id}",
                    expected_checksum=obj.checksum,
                    actual_checksum=actual_checksum,
                )

        # Log download activity
        activity = get_activity_service()
        await activity.log_event(
            session=session,
            event_type="upload",  # Matches frontend type
            title=f"Object Downloaded: {obj.name}",
            description=f"Downloaded {len(reconstructed_data)} bytes using {len(surviving_shards)} surviving shards.",
            severity="info",
            target_id=obj.id,
            user_id=user.id,
            metadata={
                "object_id": obj.id,
                "surviving_shards": len(surviving_shards),
                "checksum_verified": True,
            },
        )

        return obj, reconstructed_data


_default_download_service: Optional[DownloadService] = None


def get_download_service() -> DownloadService:
    global _default_download_service
    if _default_download_service is None:
        _default_download_service = DownloadService()
    return _default_download_service
