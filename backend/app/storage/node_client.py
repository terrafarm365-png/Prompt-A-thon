import logging
from typing import Any, Dict, List, Optional
import httpx
from app.core.exceptions import CorruptedShardError, NodeUnavailableError, StorageNodeError
from app.storage.node_protocol import (
    HEADER_NODE_SECRET,
    HEADER_OBJECT_ID,
    HEADER_SHARD_CHECKSUM,
    HEADER_SHARD_INDEX,
    HEADER_SHARD_TYPE,
    ListShardsResponse,
    NodeHealthResponse,
    NodeStatsResponse,
    StoreShardResponse,
    VerifyShardResponse,
)
from app.utils.hashing import compute_sha256

logger = logging.getLogger("vault.storage.client")


class StorageNodeClient:
    """Async HTTP client for interacting with a specific Storage Node daemon."""

    def __init__(
        self,
        node_id: str,
        base_url: str,
        shared_secret: str,
        timeout: float = 10.0,
        max_retries: int = 2,
    ):
        self.node_id = node_id
        self.base_url = base_url.rstrip("/")
        self.shared_secret = shared_secret
        self.timeout = timeout
        self.max_retries = max_retries

    def _headers(self, extra: Optional[Dict[str, str]] = None) -> Dict[str, str]:
        headers = {
            HEADER_NODE_SECRET: self.shared_secret,
            "User-Agent": "Vault-Control-Plane/1.0",
        }
        if extra:
            headers.update(extra)
        return headers

    async def _request(
        self,
        method: str,
        path: str,
        headers: Optional[Dict[str, str]] = None,
        content: Optional[bytes] = None,
        json_data: Optional[Dict[str, Any]] = None,
        params: Optional[Dict[str, Any]] = None,
    ) -> httpx.Response:
        url = f"{self.base_url}{path}"
        req_headers = self._headers(headers)
        
        last_exception: Optional[Exception] = None
        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.request(
                        method=method,
                        url=url,
                        headers=req_headers,
                        content=content,
                        json=json_data,
                        params=params,
                    )
                    return response
            except (httpx.ConnectError, httpx.ConnectTimeout) as e:
                last_exception = e
                logger.warning(
                    f"Connection failed to node '{self.node_id}' at {url} (attempt {attempt + 1}/{self.max_retries + 1}): {e}"
                )
            except httpx.TimeoutException as e:
                last_exception = e
                logger.warning(
                    f"Timeout communicating with node '{self.node_id}' at {url} (attempt {attempt + 1}/{self.max_retries + 1}): {e}"
                )
            except httpx.RequestError as e:
                last_exception = e
                logger.warning(
                    f"Request error to node '{self.node_id}' at {url} (attempt {attempt + 1}/{self.max_retries + 1}): {e}"
                )

        raise NodeUnavailableError(
            node_id=self.node_id,
            message=f"Storage node '{self.node_id}' ({self.base_url}) is unreachable after {self.max_retries + 1} attempts: {last_exception}",
            details={"base_url": self.base_url, "error": str(last_exception)},
        )

    async def health_check(self) -> NodeHealthResponse:
        """Query node health status."""
        try:
            resp = await self._request("GET", "/health")
            if resp.status_code == 200:
                data = resp.json()
                return NodeHealthResponse(
                    status=data.get("status", "healthy"),
                    node_id=data.get("node_id", self.node_id),
                    uptime_seconds=float(data.get("uptime_seconds", 0.0)),
                    version=data.get("version", "1.0.0"),
                )
            return NodeHealthResponse(status="degraded", node_id=self.node_id)
        except NodeUnavailableError:
            return NodeHealthResponse(status="offline", node_id=self.node_id)

    async def get_node_stats(self) -> NodeStatsResponse:
        """Query storage node disk, memory, CPU, and shard count metrics."""
        resp = await self._request("GET", "/stats")
        if resp.status_code != 200:
            raise StorageNodeError(
                node_id=self.node_id,
                message=f"Node stats query returned status {resp.status_code}",
                status_code=resp.status_code,
            )
        data = resp.json()
        return NodeStatsResponse(**data)

    async def store_shard(
        self,
        shard_id: str,
        data: bytes,
        checksum: str,
        object_id: str,
        shard_index: int = 0,
        shard_type: str = "data",
    ) -> StoreShardResponse:
        """Write shard payload to physical storage node."""
        headers = {
            "Content-Type": "application/octet-stream",
            HEADER_SHARD_CHECKSUM: checksum,
            HEADER_OBJECT_ID: object_id,
            HEADER_SHARD_INDEX: str(shard_index),
            HEADER_SHARD_TYPE: shard_type,
        }
        resp = await self._request("PUT", f"/v1/shards/{shard_id}", headers=headers, content=data)
        if resp.status_code not in (200, 201):
            raise StorageNodeError(
                node_id=self.node_id,
                message=f"Failed to store shard '{shard_id}' on node '{self.node_id}': HTTP {resp.status_code} - {resp.text}",
                status_code=resp.status_code,
                details={"shard_id": shard_id, "object_id": object_id},
            )
        res_json = resp.json()
        return StoreShardResponse(**res_json)

    async def read_shard(self, shard_id: str, expected_checksum: Optional[str] = None) -> bytes:
        """Read shard payload from physical storage node with mandatory checksum verification."""
        resp = await self._request("GET", f"/v1/shards/{shard_id}")
        if resp.status_code == 404:
            raise StorageNodeError(
                node_id=self.node_id,
                message=f"Shard '{shard_id}' not found on node '{self.node_id}'",
                code="SHARD_NOT_FOUND",
                status_code=404,
                details={"shard_id": shard_id},
            )
        if resp.status_code != 200:
            raise StorageNodeError(
                node_id=self.node_id,
                message=f"Failed to read shard '{shard_id}' from node '{self.node_id}': HTTP {resp.status_code}",
                status_code=resp.status_code,
            )

        payload = resp.content
        if expected_checksum:
            actual_checksum = compute_sha256(payload)
            if actual_checksum != expected_checksum:
                raise CorruptedShardError(
                    shard_id=shard_id,
                    expected_checksum=expected_checksum,
                    actual_checksum=actual_checksum,
                    node_id=self.node_id,
                )
        return payload

    async def delete_shard(self, shard_id: str) -> bool:
        """Physically delete a shard from storage node disk."""
        resp = await self._request("DELETE", f"/v1/shards/{shard_id}")
        if resp.status_code in (200, 204, 404):
            return True
        raise StorageNodeError(
            node_id=self.node_id,
            message=f"Failed to delete shard '{shard_id}' on node '{self.node_id}': HTTP {resp.status_code}",
            status_code=resp.status_code,
        )

    async def verify_shard(self, shard_id: str, expected_checksum: str) -> VerifyShardResponse:
        """Request the node to verify its local disk copy of a shard against expected checksum."""
        resp = await self._request(
            "POST",
            f"/v1/shards/{shard_id}/verify",
            json_data={"expected_checksum": expected_checksum},
        )
        if resp.status_code != 200:
            raise StorageNodeError(
                node_id=self.node_id,
                message=f"Failed to verify shard '{shard_id}' on node '{self.node_id}': HTTP {resp.status_code}",
                status_code=resp.status_code,
            )
        return VerifyShardResponse(**resp.json())

    async def list_shards(self) -> ListShardsResponse:
        """List all shard IDs currently stored on this storage node."""
        resp = await self._request("GET", "/v1/shards")
        if resp.status_code != 200:
            raise StorageNodeError(
                node_id=self.node_id,
                message=f"Failed to list shards on node '{self.node_id}': HTTP {resp.status_code}",
                status_code=resp.status_code,
            )
        return ListShardsResponse(**resp.json())

    async def delete_object_shards(self, object_id: str) -> int:
        """Delete all shards belonging to an object from this node."""
        resp = await self._request("DELETE", f"/v1/shards", params={"object_id": object_id})
        if resp.status_code in (200, 204):
            try:
                return resp.json().get("deleted_count", 0)
            except Exception:
                return 0
        return 0
