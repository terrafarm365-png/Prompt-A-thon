from datetime import datetime, timezone
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.utils.ids import generate_id


class UploadSession(Base, TimestampMixin):
    """Multipart or chunked upload session tracker."""
    __tablename__ = "upload_sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("upl"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    object_name: Mapped[str] = mapped_column(String(255), nullable=False)
    object_key: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), default="application/octet-stream", nullable=False)
    size: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    
    data_shards: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    parity_shards: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    chunk_size: Mapped[int] = mapped_column(Integer, default=67108864, nullable=False)
    
    # Status: initiated, parts_received, completing, completed, aborted
    status: Mapped[str] = mapped_column(String(50), default="initiated", index=True, nullable=False)
    parts_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    idempotency_key: Mapped[str] = mapped_column(String(128), default="", index=True, nullable=False)
    temp_storage_path: Mapped[str] = mapped_column(Text, default="", nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="upload_sessions")
