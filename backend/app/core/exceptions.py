from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class VaultException(Exception):
    """Base exception for all Vault control plane errors."""

    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details or {}


class StorageNodeError(VaultException):
    """Base exception for storage node communication failures."""

    def __init__(
        self,
        node_id: str,
        message: str,
        code: str = "STORAGE_NODE_ERROR",
        status_code: int = status.HTTP_502_BAD_GATEWAY,
        details: Optional[Dict[str, Any]] = None,
    ):
        details = details or {}
        details["node_id"] = node_id
        super().__init__(message, code=code, status_code=status_code, details=details)
        self.node_id = node_id


class NodeUnavailableError(StorageNodeError):
    """Raised when a storage node cannot be reached or times out."""

    def __init__(self, node_id: str, message: Optional[str] = None, details: Optional[Dict[str, Any]] = None):
        msg = message or f"Storage node '{node_id}' is unavailable or timed out"
        super().__init__(node_id, msg, code="NODE_UNAVAILABLE", status_code=status.HTTP_503_SERVICE_UNAVAILABLE, details=details)


class InsufficientShardsError(VaultException):
    """Raised when fewer than DATA_SHARDS are available to reconstruct an object."""

    def __init__(
        self,
        object_id: str,
        available: int,
        required: int,
        details: Optional[Dict[str, Any]] = None,
    ):
        msg = (
            f"Object '{object_id}' cannot be reconstructed. "
            f"Only {available} surviving shards available, minimum {required} required."
        )
        details = details or {}
        details.update({"object_id": object_id, "available_shards": available, "required_shards": required})
        super().__init__(
            msg,
            code="INSUFFICIENT_SHARDS",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details,
        )


class CorruptedShardError(VaultException):
    """Raised when a shard's payload checksum does not match its recorded metadata."""

    def __init__(
        self,
        shard_id: str,
        expected_checksum: str,
        actual_checksum: str,
        node_id: Optional[str] = None,
    ):
        msg = f"Shard '{shard_id}' checksum mismatch. Expected {expected_checksum[:12]}..., got {actual_checksum[:12]}..."
        details = {
            "shard_id": shard_id,
            "expected_checksum": expected_checksum,
            "actual_checksum": actual_checksum,
            "node_id": node_id,
        }
        super().__init__(msg, code="CORRUPTED_SHARD", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, details=details)


class ObjectNotFoundError(VaultException):
    """Raised when requested object ID does not exist or user lacks access."""

    def __init__(self, object_id: str):
        super().__init__(
            f"Object '{object_id}' not found",
            code="OBJECT_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND,
            details={"object_id": object_id},
        )


class AuthenticationError(VaultException):
    """Raised on invalid credentials or expired/invalid JWT token."""

    def __init__(self, message: str = "Invalid authentication credentials"):
        super().__init__(
            message,
            code="UNAUTHORIZED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class PermissionDeniedError(VaultException):
    """Raised when authenticated user is not authorized to access an object."""

    def __init__(self, message: str = "Access to requested resource is forbidden"):
        super().__init__(
            message,
            code="FORBIDDEN",
            status_code=status.HTTP_403_FORBIDDEN,
        )


class UploadSessionError(VaultException):
    """Raised on invalid upload session operations or expired sessions."""

    def __init__(self, upload_id: str, message: str):
        super().__init__(
            f"Upload session '{upload_id}': {message}",
            code="UPLOAD_SESSION_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"upload_id": upload_id},
        )


class ConfigurationError(VaultException):
    """Raised when cluster durability or node configuration is invalid."""

    def __init__(self, message: str):
        super().__init__(
            message,
            code="CONFIGURATION_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


class RepairFailedError(VaultException):
    """Raised when a shard repair cannot be completed."""

    def __init__(self, repair_id: str, message: str):
        super().__init__(
            f"Repair '{repair_id}' failed: {message}",
            code="REPAIR_FAILED",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"repair_id": repair_id},
        )
