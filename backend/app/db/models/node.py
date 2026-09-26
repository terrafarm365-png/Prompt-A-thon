from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import BigInteger, Boolean, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


class StorageNode(Base, TimestampMixin):
    """Storage Node registration, telemetry, and health state."""
    __tablename__ = "storage_nodes"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    endpoint: Mapped[str] = mapped_column(String(255), nullable=False)
    
    # Status: online, degraded, offline, draining
    status: Mapped[str] = mapped_column(String(50), default="online", index=True, nullable=False)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    
    # Capacity in bytes
    capacity_bytes: Mapped[int] = mapped_column(BigInteger, default=1_000_000_000_000, nullable=False)
    used_bytes: Mapped[int] = mapped_column(BigInteger, default=0, nullable=False)
    free_bytes: Mapped[int] = mapped_column(BigInteger, default=1_000_000_000_000, nullable=False)
    
    # Telemetry
    load: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    object_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_heartbeat: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    
    # Hardware & Network Metrics (Frontend alignment)
    rack: Mapped[str] = mapped_column(String(50), default="rack-01", nullable=False)
    region: Mapped[str] = mapped_column(String(50), default="us-east-1", nullable=False)
    ip: Mapped[str] = mapped_column(String(50), default="127.0.0.1", nullable=False)
    cpu_usage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    memory_usage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    disk_usage: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    network_ingress_mbps: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    network_egress_mbps: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    integrity_errors: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active_repairs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    shards: Mapped[List["Shard"]] = relationship("Shard", back_populates="node")
