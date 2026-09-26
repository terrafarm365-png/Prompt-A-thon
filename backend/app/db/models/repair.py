from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import BigInteger, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.utils.ids import generate_id


class RepairTask(Base, TimestampMixin):
    """Repair execution task for recovering lost or corrupted shards."""
    __tablename__ = "repair_tasks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("rep"))
    object_id: Mapped[str] = mapped_column(String(64), ForeignKey("objects.id", ondelete="CASCADE"), index=True, nullable=False)
    object_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    missing_shard_id: Mapped[str] = mapped_column(String(64), nullable=False)
    shard_index: Mapped[int] = mapped_column(Integer, nullable=False)
    shard_label: Mapped[str] = mapped_column(String(20), default="", nullable=False)
    shard_type: Mapped[str] = mapped_column(String(20), default="data", nullable=False)
    
    # Comma-separated or JSON list of healthy node IDs used for reconstruction
    source_nodes: Mapped[str] = mapped_column(Text, default="[]", nullable=False)
    destination_node_id: Mapped[str] = mapped_column(String(64), nullable=False)
    destination_node_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    
    # Status: queued, running, completed, failed, cancelled
    status: Mapped[str] = mapped_column(String(50), default="queued", index=True, nullable=False)
    progress: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    reason: Mapped[str] = mapped_column(String(255), default="Node failure or corruption detected", nullable=False)
    
    bytes_total: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    bytes_transferred: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    retry_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    object: Mapped["Object"] = relationship("Object", back_populates="repairs", lazy="selectin")
