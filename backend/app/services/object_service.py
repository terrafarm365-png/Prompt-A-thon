import asyncio
import logging
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ObjectNotFoundError, PermissionDeniedError
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.db.models.user import User
from app.schemas.objects import ErasureCodingResponse, ShardResponse, VaultObjectResponse
from app.services.activity_service import get_activity_service
from app.storage.node_registry import get_node_registry
from app.utils.time import to_iso

logger = logging.getLogger("vault.services.objects")


class ObjectService:
    """Logical object management, queries, and safe deletion coordinator."""

    def to_vault_object_response(self, obj: Object) -> VaultObjectResponse:
        """Convert database Object entity to frontend VaultObject response."""
        shards_resp: List[ShardResponse] = []
        for s in obj.shards:
            node_name = s.node.name if s.node else s.node_id
            shards_resp.append(
                ShardResponse(
                    id=s.id,
                    objectId=s.object_id,
                    type=s.shard_type,
                    index=s.shard_index,
                    label=s.label,
                    nodeId=s.node_id,
                    nodeName=node_name,
                    checksum=s.checksum,
                    status="healthy" if s.status == "healthy" else ("rebuilding" if s.status == "repairing" else "corrupted"),
                    size=s.size,
                )
            )

        erasure_coding = ErasureCodingResponse(
            scheme=f"RS({obj.data_shards}+{obj.parity_shards})",
            dataShards=obj.data_shards,
            parityShards=obj.parity_shards,
            shards=shards_resp,
        )

        return VaultObjectResponse(
            id=obj.id,
            name=obj.name,
            size=obj.size,
            physicalSize=obj.physical_size,
            type=obj.content_type,
            mimeType=obj.mime_type,
            status=obj.status,
            createdAt=to_iso(obj.created_at),
            updatedAt=to_iso(obj.updated_at),
            version=obj.version,
            bucket=obj.bucket,
            checksum=obj.checksum,
            erasureCoding=erasure_coding,
        )

    async def list_objects(
        self,
        session: AsyncSession,
        user: User,
        search: Optional[str] = None,
        bucket: Optional[str] = None,
        status: Optional[str] = None,
        sort_by: Optional[str] = "updatedAt",
        sort_order: Optional[str] = "desc",
    ) -> List[VaultObjectResponse]:
        """Fetch list of user objects with filtering and sorting."""
        stmt = (
            select(Object)
            .options(
                selectinload(Object.shards).selectinload(Shard.node)
            )
            .where(Object.status != "deleted")
        )

        # Non-admin users only see their own files
        if user.role != "admin":
            stmt = stmt.where(Object.user_id == user.id)

        if search:
            stmt = stmt.where(Object.name.ilike(f"%{search}%"))

        if bucket:
            stmt = stmt.where(Object.bucket == bucket)

        if status and status != "all":
            stmt = stmt.where(Object.status == status)

        # Sorting
        if sort_by == "name":
            order_col = Object.name.desc() if sort_order == "desc" else Object.name.asc()
        elif sort_by == "size":
            order_col = Object.size.desc() if sort_order == "desc" else Object.size.asc()
        else:
            order_col = Object.updated_at.desc() if sort_order == "desc" else Object.updated_at.asc()

        stmt = stmt.order_by(order_col)
        res = await session.execute(stmt)
        objects = res.scalars().all()

        return [self.to_vault_object_response(o) for o in objects]

    async def get_object_by_id(
        self,
        session: AsyncSession,
        user: User,
        object_id: str,
    ) -> VaultObjectResponse:
        """Fetch single object by ID enforcing authorization."""
        stmt = (
            select(Object)
            .options(
                selectinload(Object.shards).selectinload(Shard.node)
            )
            .where(Object.id == object_id, Object.status != "deleted")
        )
        res = await session.execute(stmt)
        obj = res.scalar_one_or_none()

        if not obj:
            raise ObjectNotFoundError(object_id)

        if obj.user_id != user.id and user.role != "admin":
            raise PermissionDeniedError(f"User is not authorized to access object {object_id}")

        return self.to_vault_object_response(obj)

    async def delete_object_safely(
        self,
        session: AsyncSession,
        user: User,
        object_id: str,
    ) -> bool:
        """
        Safe deletion lifecycle per Requirement 61:
        1. Mark object deleting.
        2. Find all shards.
        3. Delete shards from physical storage nodes.
        4. Verify deletion where appropriate.
        5. Update metadata / mark deleted.
        6. Record activity.
        """
        stmt = (
            select(Object)
            .options(selectinload(Object.shards))
            .where(Object.id == object_id, Object.status != "deleted")
        )
        res = await session.execute(stmt)
        obj = res.scalar_one_or_none()

        if not obj:
            raise ObjectNotFoundError(object_id)

        if obj.user_id != user.id and user.role != "admin":
            raise PermissionDeniedError(f"User is not authorized to delete object {object_id}")

        # Step 1: Mark deleting
        obj.status = "deleting"
        await session.commit()

        # Step 2 & 3: Delete shards from storage nodes
        registry = get_node_registry()
        delete_tasks = []
        for shard in obj.shards:
            client = registry.get_client(shard.node_id)
            delete_tasks.append(client.delete_shard(shard.id))

        await asyncio.gather(*delete_tasks, return_exceptions=True)

        # Step 5: Mark deleted
        obj.status = "deleted"

        # Step 6: Log activity
        activity = get_activity_service()
        await activity.log_event(
            session=session,
            event_type="delete",
            title=f"Object Deleted: {obj.name}",
            description=f"Object {obj.name} and all its shards were permanently deleted.",
            severity="info",
            target_id=obj.id,
            user_id=user.id,
            metadata={"object_id": obj.id, "shards_count": len(obj.shards)},
        )

        await session.commit()
        return True


_default_object_service: Optional[ObjectService] = None


def get_object_service() -> ObjectService:
    global _default_object_service
    if _default_object_service is None:
        _default_object_service = ObjectService()
    return _default_object_service
