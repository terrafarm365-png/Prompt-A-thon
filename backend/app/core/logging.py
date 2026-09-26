import json
import logging
import sys
import time
from contextvars import ContextVar
from datetime import datetime, timezone
from typing import Any, Dict, Optional

# Context variables for distributed tracing across requests/tasks
request_id_ctx: ContextVar[Optional[str]] = ContextVar("request_id", default=None)
user_id_ctx: ContextVar[Optional[str]] = ContextVar("user_id", default=None)


class StructuredJsonFormatter(logging.Formatter):
    """Formats log records as structured JSON without exposing secrets or raw file payloads."""

    SENSITIVE_KEYS = {"password", "password_hash", "token", "jwt", "secret", "authorization", "payload"}

    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        # Include tracing context
        req_id = request_id_ctx.get()
        if req_id:
            log_entry["request_id"] = req_id

        usr_id = user_id_ctx.get()
        if usr_id:
            log_entry["user_id"] = usr_id

        # Merge custom structured extra fields passed to logger
        for key, val in record.__dict__.items():
            if key not in {
                "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
                "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
                "created", "msecs", "relativeCreated", "thread", "threadName",
                "processName", "process", "message"
            }:
                # Sanitize sensitive fields
                if any(sens in key.lower() for sens in self.SENSITIVE_KEYS):
                    log_entry[key] = "[REDACTED]"
                else:
                    log_entry[key] = val

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging(log_level: str = "INFO") -> None:
    """Configures application-wide structured logging."""
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Remove existing handlers to avoid duplicates
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(numeric_level)
    handler.setFormatter(StructuredJsonFormatter())
    root_logger.addHandler(handler)

    # Silence verbose 3rd party loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("asyncpg").setLevel(logging.WARNING)


def get_logger(name: str = "vault") -> logging.Logger:
    """Returns a named logger."""
    return logging.getLogger(name)


class OperationTimer:
    """Context manager to measure and log operation duration and status."""

    def __init__(self, logger: logging.Logger, operation: str, **extra: Any):
        self.logger = logger
        self.operation = operation
        self.extra = extra
        self.start_time: float = 0.0

    def __enter__(self) -> "OperationTimer":
        self.start_time = time.perf_counter()
        return self

    def __exit__(self, exc_type: Any, exc_val: Any, exc_tb: Any) -> None:
        duration_ms = round((time.perf_counter() - self.start_time) * 1000, 2)
        status = "failed" if exc_type else "success"
        self.logger.info(
            f"Operation '{self.operation}' finished with status '{status}' in {duration_ms}ms",
            extra={
                "operation": self.operation,
                "status": status,
                "duration_ms": duration_ms,
                **self.extra,
            },
        )
