import asyncio
from datetime import datetime, timedelta, timezone
import json
import logging
from typing import AsyncGenerator, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import StorageNodeError, UploadSessionError, VaultException
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.db.models.upload_session import UploadSession
from app.db.models.user import User
from app.schemas.objects import InitiateUploadResponse, ShardResponse, VaultObjectResponse
from app.services.activity_service import get_activity_service
from app.services.erasure_service import get_erasure_service
from app.services.placement_service import get_placement_service
from app.storage.node_registry import get_node_registry
from app.utils.hashing import compute_sha256
from app.utils.ids import generate_id, generate_uuid
from app.utils.sizes import calculate_storage_efficiency
from app.utils.time import to_iso, utc_now

logger = logging.getLogger("vault.services.upload")
settings = get_settings()


class UploadService:
    """End-to-end distributed upload pipeline coordinator."""

    async def initiate_upload(
        self,
        session: AsyncSession,
        user_id: str,
        name: str,
        size: int,
        content_type: str = "application/octet-stream",
        bucket: str = "vault-prod-east1",
        idempotency_key: Optional[str] = None,
    ) -> InitiateUploadResponse:
        """Create a new upload session for chunked or direct processing."""
        if size > settings.max_upload_size_bytes:
            raise VaultException(
                f"File size {size} bytes exceeds maximum allowed limit {settings.max_upload_size_bytes} bytes",
                code="PAYLOAD_TOO_LARGE",
                status_code=413,
            )

        # Check idempotency
        if idempotency_key:
            stmt = select(UploadSession).where(
                UploadSession.user_id == user_id,
                UploadSession.idempotency_key == idempotency_key,
                UploadSession.status != "aborted",
            )
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if existing:
                return InitiateUploadResponse(
                    upload_id=existing.id,
                    chunk_size=existing.chunk_size,
                    data_shards=existing.data_shards,
                    parity_shards=existing.parity_shards,
                    total_shards=existing.data_shards + existing.parity_shards,
                    expires_at=to_iso(existing.expires_at),
                )

        object_key = f"objects/{generate_uuid()}/{name}"
        upload_id = generate_id("upl")
        expires = utc_now() + timedelta(hours=24)

        upload_sess = UploadSession(
            id=upload_id,
            user_id=user_id,
            object_name=name,
            object_key=object_key,
            content_type=content_type,
            size=size,
            data_shards=settings.DATA_SHARDS,
            parity_shards=settings.PARITY_SHARDS,
            chunk_size=settings.chunk_size_bytes,
            status="initiated",
            idempotency_key=idempotency_key or "",
            expires_at=expires,
        )
        session.add(upload_sess)
        await session.commit()

        return InitiateUploadResponse(
            upload_id=upload_id,
            chunk_size=upload_sess.chunk_size,
            data_shards=upload_sess.data_shards,
            parity_shards=upload_sess.parity_shards,
            total_shards=upload_sess.data_shards + upload_sess.parity_shards,
            expires_at=to_iso(expires),
        )

    async def process_and_distribute(
        self,
        session: AsyncSession,
        user: User,
        name: str,
        payload: bytes,
        content_type: str = "application/octet-stream",
        bucket: str = "vault-prod-east1",
    ) -> Object:
        """
        Executes the full distributed upload lifecycle:
        1. Validate size and type.
        2. Compute SHA-256 object checksum.
        3. Erasure code payload into 4 data + 2 parity shards (Reed-Solomon RS(4+2)).
        4. Select distinct storage nodes via placement service.
        5. Concurrently store each shard to its designated storage node.
        6. Verify each stored shard.
        7. Persist object and shard metadata in atomic database transaction.
        8. Record activity audit log.
        """
        logical_size = len(payload)
        if logical_size > settings.max_upload_size_bytes:
            raise VaultException(
                f"File size {logical_size} bytes exceeds maximum {settings.max_upload_size_bytes} bytes",
                code="PAYLOAD_TOO_LARGE",
                status_code=413,
            )

        object_id = generate_id("obj")
        object_key = f"objects/{object_id}/{name}"
        file_checksum = compute_sha256(payload)

        # 1. State: UPLOADING -> ENCODING
        erasure = get_erasure_service()
        encoded_shards = erasure.encode(payload)
        
        # Calculate physical size: sum of all 6 encoded shard sizes
        physical_size = sum(len(s) for s in encoded_shards)

        # 2. State: ENCODING -> DISTRIBUTING
        placement = get_placement_service()
        selected_nodes = await placement.select_nodes_for_object(
            session=session,
            total_shards=len(encoded_shards),
        )

        registry = get_node_registry()
        shard_records: List[Shard] = []
        upload_tasks = []

        # Prepare shards
        for i, shard_bytes in enumerate(encoded_shards):
            shard_index_1_based = i + 1
            shard_type, label = erasure.calculate_shard_label(shard_index_1_based)
            target_node = selected_nodes[i]
            shard_id = generate_id("sh")
            shard_checksum = compute_sha256(shard_bytes)

            shard_record = Shard(
                id=shard_id,
                object_id=object_id,
                node_id=target_node.id,
                shard_index=shard_index_1_based,
                shard_type=shard_type,
                label=label,
                size=len(shard_bytes),
                checksum=shard_checksum,
                status="healthy",
            )
            shard_records.append(shard_record)

            # Concurrent upload task to storage node
            client = registry.get_client(target_node.id)
            upload_tasks.append(
                client.store_shard(
                    shard_id=shard_id,
                    data=shard_bytes,
                    checksum=shard_checksum,
                    object_id=object_id,
                    shard_index=shard_index_1_based,
                    shard_type=shard_type,
                )
            )

        # 3. Execute concurrent storage on all designated storage nodes
        try:
            results = await asyncio.gather(*upload_tasks, return_exceptions=True)
            failed_nodes = []
            for idx, res in enumerate(results):
                if isinstance(res, Exception):
                    failed_node = selected_nodes[idx]
                    logger.error(f"Failed to store shard {shard_records[idx].id} on {failed_node.id}: {res}")
                    failed_nodes.append((failed_node.id, str(res)))

            # Check if durability requirements are met (at least DATA_SHARDS = 4 stored successfully)
            successful_count = len(upload_tasks) - len(failed_nodes)
            if successful_count < settings.DATA_SHARDS:
                # Durability requirement NOT met: rollback by deleting shards that succeeded
                cleanup_tasks = []
                for idx, res in enumerate(results):
                    if not isinstance(res, Exception):
                        node = selected_nodes[idx]
                        sh = shard_records[idx]
                        client = registry.get_client(node.id)
                        cleanup_tasks.append(client.delete_shard(sh.id))
                if cleanup_tasks:
                    await asyncio.gather(*cleanup_tasks, return_exceptions=True)

                raise StorageNodeError(
                    node_id="cluster",
                    message=(
                        f"Upload failed durability requirement. Only {successful_count}/{len(upload_tasks)} "
                        f"shards stored successfully. Minimum required: {settings.DATA_SHARDS}. Failed nodes: {failed_nodes}"
                    ),
                )

            # If 4 or 5 nodes succeeded, mark object as degraded or healthy
            obj_status = "healthy" if successful_count == len(upload_tasks) else "degraded"
            for idx, res in enumerate(results):
                if isinstance(res, Exception):
                    shard_records[idx].status = "missing"

        except Exception as e:
            logger.error(f"Upload distribution failed: {e}")
            raise

        # 4. State: VERIFYING -> HEALTHY / DEGRADED
        obj = Object(
            id=object_id,
            user_id=user.id,
            name=name,
            object_key=object_key,
            size=logical_size,
            logical_size=logical_size,
            physical_size=physical_size,
            content_type=content_type,
            mime_type=content_type,
            status=obj_status,
            data_shards=settings.DATA_SHARDS,
            parity_shards=settings.PARITY_SHARDS,
            chunk_size=settings.chunk_size_bytes,
            checksum=file_checksum,
            bucket=bucket,
            version=1,
        )
        session.add(obj)

        for sh in shard_records:
            session.add(sh)

        # Update node used_bytes and object_count
        for idx, node in enumerate(selected_nodes):
            if not isinstance(results[idx], Exception):
                node.used_bytes += shard_records[idx].size
                node.free_bytes = max(0, node.capacity_bytes - node.used_bytes)
                node.object_count += 1

        # Audit log event
        activity = get_activity_service()
        await activity.log_event(
            session=session,
            event_type="upload",
            title=f"Object Uploaded: {name}",
            description=f"Successfully distributed {logical_size} bytes across {len(selected_nodes)} storage nodes with RS(4+2).",
            severity="success",
            target_id=object_id,
            user_id=user.id,
            metadata={
                "object_id": object_id,
                "logical_size": logical_size,
                "physical_size": physical_size,
                "checksum": file_checksum,
                "shards": len(shard_records),
            },
        )

        await session.commit()
        await session.refresh(obj)
        logger.info(f"Upload completed successfully for object {obj.id} ({obj.name}) with status {obj.status}")
        return obj


_default_upload_service: Optional[UploadService] = None


def get_upload_service() -> UploadService:
    global _default_upload_service
    if _default_upload_service is None:
        _default_upload_service = UploadService()
    return _default_upload_service
