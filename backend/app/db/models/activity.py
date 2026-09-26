from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base
from app.utils.ids import generate_id


class ActivityEvent(Base):
    """Cluster activity audit log matching frontend ActivityEvent schema."""
    __tablename__ = "activity_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("act"))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    
    # Event Types: upload, delete, repair, integrity_check, node_offline, node_joined, rebalance
    type: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )
    
    # Severity: info, success, warning, error
    severity: Mapped[str] = mapped_column(String(20), default="info", nullable=False)
    target_id: Mapped[Optional[str]] = mapped_column(String(64), index=True, nullable=True)
    metadata_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)

    # Relationships
    user: Mapped[Optional["User"]] = relationship("User", back_populates="activities")


class SystemEvent(Base):
    """Low-level internal cluster events for telemetry and reconciliation."""
    __tablename__ = "system_events"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("sys"))
    category: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    payload_json: Mapped[str] = mapped_column(Text, default="{}", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )
