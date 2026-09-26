import asyncio
import json
import logging
from typing import Any, Dict, Optional
import redis.asyncio as aioredis
from app.core.config import get_settings

logger = logging.getLogger("vault.workers.queue")
settings = get_settings()


class TaskQueue:
    """Task queue with Redis backend and in-process asyncio fallback."""

    def __init__(self) -> None:
        self.redis_client: Optional[aioredis.Redis] = None
        self._memory_queue: asyncio.Queue = asyncio.Queue()
        self._use_memory: bool = False

    async def connect(self) -> None:
        """Attempt connection to Redis; fallback to in-memory queue if unavailable."""
        try:
            client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            await client.ping()
            self.redis_client = client
            self._use_memory = False
            logger.info("Connected to Redis task queue successfully.")
        except Exception as e:
            logger.warning(f"Could not connect to Redis at {settings.REDIS_URL} ({e}). Using in-memory task queue.")
            self._use_memory = True

    async def enqueue_repair(self, repair_id: str) -> None:
        """Enqueue a repair task ID."""
        if not self._use_memory and self.redis_client:
            try:
                await self.redis_client.rpush("vault:queue:repairs", repair_id)
                return
            except Exception as e:
                logger.warning(f"Redis enqueue failed ({e}), using in-memory queue.")
                self._use_memory = True

        await self._memory_queue.put(repair_id)

    async def dequeue_repair(self, timeout: float = 1.0) -> Optional[str]:
        """Dequeue a repair task ID with timeout."""
        if not self._use_memory and self.redis_client:
            try:
                res = await self.redis_client.blpop("vault:queue:repairs", timeout=int(timeout))
                if res:
                    return res[1]
                return None
            except Exception as e:
                logger.warning(f"Redis dequeue failed ({e}), falling back to in-memory queue.")
                self._use_memory = True

        try:
            return await asyncio.wait_for(self._memory_queue.get(), timeout=timeout)
        except asyncio.TimeoutError:
            return None


_queue_instance: Optional[TaskQueue] = None


def get_task_queue() -> TaskQueue:
    global _queue_instance
    if _queue_instance is None:
        _queue_instance = TaskQueue()
    return _queue_instance
