import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.activity import ActivityEvent
from app.db.models.integrity import IntegrityCheck
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.storage.node_registry import get_node_registry
from app.utils.hashing import compute_sha256

logger = logging.getLogger("vault.services.integrity")


class IntegrityService:
    """Continuous background integrity verification and cryptographic scrub."""

    async def verify_shard_integrity(
        self,
        session: AsyncSession,
        shard: Shard,
    ) -> IntegrityCheck:
        """
        Query storage node to read and verify SHA-256 checksum of stored shard.
        If checksum mismatch occurs, mark shard corrupted and log integrity event.
        """
        registry = get_node_registry()
        client = registry.get_client(shard.node_id)
        
        status = "verified"
        actual_checksum = ""
        details = None

        try:
            payload = await client.read_shard(shard.id)
            actual_checksum = compute_sha256(payload)
            if actual_checksum != shard.checksum:
                status = "corrupted"
                details = f"Checksum mismatch. Expected: {shard.checksum}, got: {actual_checksum}"
                logger.error(f"CORRUPTION DETECTED on shard {shard.id} at node {shard.node_id}: {details}")
                shard.status = "corrupted"
            else:
                shard.status = "healthy"
        except Exception as e:
            status = "missing"
            actual_checksum = "UNAVAILABLE"
            details = f"Failed to read shard: {str(e)}"
            shard.status = "missing"
            logger.warning(f"Shard {shard.id} missing on node {shard.node_id}: {e}")

        check = IntegrityCheck(
            object_id=shard.object_id,
            shard_id=shard.id,
            node_id=shard.node_id,
            status=status,
            checksum_expected=shard.checksum,
            checksum_actual=actual_checksum,
            details=details,
        )
        session.add(check)

        if status != "verified":
            # Record activity event
            event = ActivityEvent(
                type="integrity_check",
                title=f"Integrity Check Alert: Shard {shard.label}",
                description=f"Shard {shard.id} on node {shard.node_id} is {status}. {details or ''}",
                severity="error",
                target_id=shard.id,
                metadata_json=json.dumps({
                    "shard_id": shard.id,
                    "object_id": shard.object_id,
                    "node_id": shard.node_id,
                    "status": status,
                }),
            )
            session.add(event)

            # Update parent object status to degraded or corrupted
            obj_stmt = select(Object).where(Object.id == shard.object_id)
            res = await session.execute(obj_stmt)
            obj = res.scalar_one_or_none()
            if obj and obj.status == "healthy":
                obj.status = "degraded" if status == "missing" else "corrupted"

        await session.commit()
        return check

    async def run_integrity_scrub(self, session: AsyncSession, limit: int = 50) -> Dict[str, int]:
        """Scrub a batch of shards across the cluster."""
        stmt = select(Shard).order_by(Shard.updated_at.asc()).limit(limit)
        res = await session.execute(stmt)
        shards = list(res.scalars().all())

        results = {"total": len(shards), "healthy": 0, "corrupted": 0, "missing": 0}
        for shard in shards:
            check = await self.verify_shard_integrity(session, shard)
            if check.status == "verified":
                results["healthy"] += 1
            elif check.status == "corrupted":
                results["corrupted"] += 1
            else:
                results["missing"] += 1

        return results


_default_integrity_service: Optional[IntegrityService] = None


def get_integrity_service() -> IntegrityService:
    global _default_integrity_service
    if _default_integrity_service is None:
        _default_integrity_service = IntegrityService()
    return _default_integrity_service
