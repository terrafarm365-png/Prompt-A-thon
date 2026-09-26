import json
import logging
from typing import Any, Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.activity import ActivityEvent
from app.schemas.activity import ActivityEventResponse
from app.utils.time import to_iso

logger = logging.getLogger("vault.services.activity")


class ActivityService:
    """Audit activity logging service."""

    async def log_event(
        self,
        session: AsyncSession,
        event_type: str,
        title: str,
        description: str,
        severity: str = "info",
        target_id: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> ActivityEvent:
        """Create and persist an activity log event."""
        event = ActivityEvent(
            type=event_type,
            title=title,
            description=description,
            severity=severity,
            target_id=target_id,
            user_id=user_id,
            metadata_json=json.dumps(metadata or {}),
        )
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event

    async def get_recent_activities(
        self,
        session: AsyncSession,
        limit: int = 50,
        event_type: Optional[str] = None,
    ) -> List[ActivityEventResponse]:
        """Fetch list of recent activity events matching frontend ActivityEvent format."""
        stmt = select(ActivityEvent).order_by(ActivityEvent.timestamp.desc()).limit(limit)
        if event_type:
            stmt = stmt.where(ActivityEvent.type == event_type)
            
        res = await session.execute(stmt)
        events = res.scalars().all()
        
        response: List[ActivityEventResponse] = []
        for ev in events:
            try:
                meta = json.loads(ev.metadata_json)
            except Exception:
                meta = {}

            response.append(
                ActivityEventResponse(
                    id=ev.id,
                    type=ev.type,
                    title=ev.title,
                    description=ev.description,
                    timestamp=to_iso(ev.timestamp),
                    severity=ev.severity,
                    targetId=ev.target_id,
                    metadata=meta,
                )
            )
        return response


_default_activity_service: Optional[ActivityService] = None


def get_activity_service() -> ActivityService:
    global _default_activity_service
    if _default_activity_service is None:
        _default_activity_service = ActivityService()
    return _default_activity_service
