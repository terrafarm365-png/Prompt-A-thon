import uuid
import time


def generate_uuid() -> str:
    """Generate a clean UUID4 string."""
    return str(uuid.uuid4())


def generate_id(prefix: str = "id") -> str:
    """Generate a prefixed unique identifier, e.g. obj-1727289192-ab12cd34."""
    random_hex = uuid.uuid4().hex[:8]
    timestamp = int(time.time() * 1000)
    return f"{prefix}-{timestamp}-{random_hex}"
