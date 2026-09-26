import hashlib
from typing import AsyncIterable, Union


def compute_sha256(data: Union[bytes, bytearray, memoryview]) -> str:
    """Compute standard SHA-256 hexadecimal digest for raw bytes."""
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()


async def compute_stream_sha256(stream: AsyncIterable[bytes]) -> str:
    """Compute standard SHA-256 digest over an async byte stream."""
    hasher = hashlib.sha256()
    async for chunk in stream:
        if chunk:
            hasher.update(chunk)
    return hasher.hexdigest()
