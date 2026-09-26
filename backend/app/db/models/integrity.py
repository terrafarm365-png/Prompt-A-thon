from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.utils.ids import generate_id


class IntegrityCheck(Base):
    """Integrity scrub verification record."""
    __tablename__ = "integrity_checks"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("chk"))
    object_id: Mapped[str] = mapped_column(String(64), ForeignKey("objects.id", ondelete="CASCADE"), index=True, nullable=False)
    shard_id: Mapped[str] = mapped_column(String(64), ForeignKey("shards.id", ondelete="CASCADE"), index=True, nullable=False)
    node_id: Mapped[str] = mapped_column(String(64), ForeignKey("storage_nodes.id", ondelete="CASCADE"), index=True, nullable=False)
    
    # Status: verified, corrupted, missing
    status: Mapped[str] = mapped_column(String(50), nullable=False)
    checksum_expected: Mapped[str] = mapped_column(String(64), nullable=False)
    checksum_actual: Mapped[str] = mapped_column(String(64), nullable=False)
    checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        index=True,
        nullable=False,
    )
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
