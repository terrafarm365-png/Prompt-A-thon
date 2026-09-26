from typing import List, Optional
from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin
from app.utils.ids import generate_uuid


class User(Base, TimestampMixin):
    """User account entity."""
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    role: Mapped[str] = mapped_column(String(50), default="admin", nullable=False)
    workspace_name: Mapped[str] = mapped_column(String(100), default="Vault Production", nullable=False)
    cluster_name: Mapped[str] = mapped_column(String(100), default="vault-cluster-primary", nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    objects: Mapped[List["Object"]] = relationship("Object", back_populates="owner", cascade="all, delete-orphan")
    upload_sessions: Mapped[List["UploadSession"]] = relationship("UploadSession", back_populates="user", cascade="all, delete-orphan")
    activities: Mapped[List["ActivityEvent"]] = relationship("ActivityEvent", back_populates="user")
