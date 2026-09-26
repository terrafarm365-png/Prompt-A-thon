from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.utils.ids import generate_id


class Object(Base, TimestampMixin):
    """Logical user object stored in the distributed cluster."""
    __tablename__ = "objects"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("obj"))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    object_key: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    size: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    logical_size: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    physical_size: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), default="application/octet-stream", nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), default="application/octet-stream", nullable=False)
    
    # Lifecycle Status: uploading, encoding, distributing, verifying, healthy, degraded, repairing, corrupted, deleting, deleted, failed
    status: Mapped[str] = mapped_column(String(50), default="uploading", index=True, nullable=False)
    
    # Erasure Coding Durability Parameters
    data_shards: Mapped[int] = mapped_column(Integer, default=4, nullable=False)
    parity_shards: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    chunk_size: Mapped[int] = mapped_column(Integer, default=67108864, nullable=False)  # 64 MB
    
    # Integrity Checksum (SHA-256)
    checksum: Mapped[str] = mapped_column(String(64), default="", nullable=False)
    bucket: Mapped[str] = mapped_column(String(100), default="vault-prod-east1", nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Relationships
    owner: Mapped["User"] = relationship("User", back_populates="objects")
    shards: Mapped[List["Shard"]] = relationship("Shard", back_populates="object", cascade="all, delete-orphan", order_by="Shard.shard_index", lazy="selectin")
    versions: Mapped[List["ObjectVersion"]] = relationship("ObjectVersion", back_populates="object", cascade="all, delete-orphan", lazy="selectin")
    repairs: Mapped[List["RepairTask"]] = relationship("RepairTask", back_populates="object", cascade="all, delete-orphan", lazy="selectin")


class ObjectVersion(Base):
    """Historical version record for an object."""
    __tablename__ = "object_versions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("ver"))
    object_id: Mapped[str] = mapped_column(String(64), ForeignKey("objects.id", ondelete="CASCADE"), index=True, nullable=False)
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    physical_size: Mapped[int] = mapped_column(BigInteger, nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    object: Mapped["Object"] = relationship("Object", back_populates="versions")
