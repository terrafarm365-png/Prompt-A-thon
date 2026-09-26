from typing import Any, Dict, Generic, List, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class ApiError(BaseModel):
    """Standard error payload."""
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ApiResponse(BaseModel, Generic[T]):
    """Standard unified API response envelope."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[ApiError] = None

    model_config = ConfigDict(arbitrary_types_allowed=True)

    @classmethod
    def ok(cls, data: T) -> "ApiResponse[T]":
        return cls(success=True, data=data, error=None)

    @classmethod
    def fail(cls, code: str, message: str, details: Optional[Dict[str, Any]] = None) -> "ApiResponse[None]":
        return cls(success=False, data=None, error=ApiError(code=code, message=message, details=details))


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated collection payload."""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int
