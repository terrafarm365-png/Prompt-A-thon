import httpx
import pytest
from app.core.exceptions import CorruptedShardError, NodeUnavailableError
from app.storage.node_client import StorageNodeClient
from app.utils.hashing import compute_sha256


@pytest.mark.asyncio
async def test_node_client_with_mock_transport(monkeypatch):
    test_shards = {}

    def handler(request: httpx.Request) -> httpx.Response:
        url_path = request.url.path

        if url_path == "/health":
            return httpx.Response(200, json={"status": "healthy", "node_id": "node-a", "uptime_seconds": 120.0})

        if url_path == "/stats":
            return httpx.Response(200, json={
                "node_id": "node-a",
                "status": "online",
                "disk": {"total_bytes": 1000, "used_bytes": 100, "free_bytes": 900},
                "shard_count": len(test_shards),
                "load_average": 0.05,
                "cpu_percent": 12.0,
                "memory_percent": 25.0,
                "uptime_seconds": 120.0,
            })

        if request.method == "PUT" and url_path.startswith("/v1/shards/"):
            shard_id = url_path.replace("/v1/shards/", "")
            content = request.content
            test_shards[shard_id] = content
            checksum = compute_sha256(content)
            return httpx.Response(200, json={
                "shard_id": shard_id,
                "size_bytes": len(content),
                "checksum": checksum,
                "stored_at": "2026-09-26T00:00:00Z",
            })

        if request.method == "GET" and url_path.startswith("/v1/shards/"):
            shard_id = url_path.replace("/v1/shards/", "")
            if shard_id in test_shards:
                return httpx.Response(200, content=test_shards[shard_id])
            return httpx.Response(404, json={"detail": "Shard not found"})

        if request.method == "DELETE" and url_path.startswith("/v1/shards/"):
            shard_id = url_path.replace("/v1/shards/", "")
            test_shards.pop(shard_id, None)
            return httpx.Response(200, json={"deleted": True})

        if request.method == "POST" and url_path.endswith("/verify"):
            return httpx.Response(200, json={
                "shard_id": "test-sh",
                "valid": True,
                "expected_checksum": "abc",
                "actual_checksum": "abc",
                "checked_at": "2026-09-26T00:00:00Z",
            })

        return httpx.Response(404)

    mock_transport = httpx.MockTransport(handler)

    client = StorageNodeClient(node_id="node-a", base_url="http://localhost:9101", shared_secret="secret")
    
    # Patch httpx.AsyncClient to use mock_transport
    orig_request = client._request
    async def mocked_request(method, path, headers=None, content=None, json_data=None, params=None):
        req_headers = client._headers(headers)
        async with httpx.AsyncClient(transport=mock_transport, base_url=client.base_url) as ac:
            return await ac.request(method, path, headers=req_headers, content=content, json=json_data, params=params)
    
    client._request = mocked_request

    # 1. Health check
    health = await client.health_check()
    assert health.status == "healthy"
    assert health.node_id == "node-a"

    # 2. Store shard
    data = b"Vault Shard Physical Data Payload 12345"
    csum = compute_sha256(data)
    store_res = await client.store_shard("sh-01", data, csum, "obj-01")
    assert store_res.shard_id == "sh-01"
    assert store_res.checksum == csum

    # 3. Read shard with checksum verification
    read_payload = await client.read_shard("sh-01", expected_checksum=csum)
    assert read_payload == data

    # 4. Read shard with corrupted checksum expectation -> raises CorruptedShardError
    with pytest.raises(CorruptedShardError):
        await client.read_shard("sh-01", expected_checksum="corrupted_checksum_value_here")

    # 5. Delete shard
    del_res = await client.delete_shard("sh-01")
    assert del_res is True
