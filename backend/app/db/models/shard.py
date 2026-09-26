from typing import Optional
from sqlalchemy import BigInteger, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.utils.ids import generate_id


class Shard(Base, TimestampMixin):
    """A physical chunk (data or parity) belonging to an object and assigned to a storage node."""
    __tablename__ = "shards"

    id: Mapped[str] = mapped_column(String(64), primary_key=True, default=lambda: generate_id("sh"))
    object_id: Mapped[str] = mapped_column(String(64), ForeignKey("objects.id", ondelete="CASCADE"), index=True, nullable=False)
    node_id: Mapped[str] = mapped_column(String(64), ForeignKey("storage_nodes.id", ondelete="RESTRICT"), index=True, nullable=False)
    shard_index: Mapped[int] = mapped_column(Integer, nullable=False)
    shard_type: Mapped[str] = mapped_column(String(20), nullable=False)  # "data" or "parity"
    label: Mapped[str] = mapped_column(String(20), nullable=False)        # "D1", "D2", ..., "P1", "P2"
    size: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    checksum: Mapped[str] = mapped_column(String(64), nullable=False)
    
    # Status: healthy, missing, corrupted, repairing
    status: Mapped[str] = mapped_column(String(50), default="healthy", index=True, nullable=False)

    # Relationships
    object: Mapped["Object"] = relationship("Object", back_populates="shards")
    node: Mapped["StorageNode"] = relationship("StorageNode", back_populates="shards", lazy="selectin")

    __table_args__ = (
        # An object cannot have duplicate shard indices
        UniqueConstraint("object_id", "shard_index", name="uq_object_shard_index"),
    )
