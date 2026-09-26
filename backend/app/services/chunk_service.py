import asyncio
import os
from typing import AsyncGenerator, BinaryIO, List
from app.core.config import get_settings

settings = get_settings()


class ChunkService:
    """Manages chunked streaming and temporary buffers for large file uploads."""

    def __init__(self, chunk_size_bytes: int = settings.chunk_size_bytes):
        self.chunk_size = chunk_size_bytes

    async def stream_file_chunks(self, file_path: str) -> AsyncGenerator[bytes, None]:
        """Stream file in memory-safe chunks asynchronously."""
        loop = asyncio.get_event_loop()
        with open(file_path, "rb") as f:
            while True:
                chunk = await loop.run_in_executor(None, f.read, self.chunk_size)
                if not chunk:
                    break
                yield chunk

    async def save_upload_stream_to_temp(
        self,
        stream: AsyncGenerator[bytes, None],
        temp_dir: str = "temp/uploads",
    ) -> str:
        """Stream uploaded payload into a temporary file on disk."""
        os.makedirs(temp_dir, exist_ok=True)
        import uuid
        temp_file = os.path.join(temp_dir, f"upload_{uuid.uuid4().hex}.tmp")
        
        with open(temp_file, "wb") as f:
            async for chunk in stream:
                if chunk:
                    f.write(chunk)
        return temp_file
