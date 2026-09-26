import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(async_client: AsyncClient):
    resp = await async_client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["role"] == "control-plane"
    assert data["version"] == "1.0.0"


@pytest.mark.asyncio
async def test_health_system_endpoint(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/health/system")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["success"] is True
    assert payload["error"] is None
    data = payload["data"]
    assert data["api"] == "healthy"
    assert data["database"] == "healthy"
    assert data["storage_nodes"]["total"] == 6
    assert data["storage_nodes"]["online"] == 6


@pytest.mark.asyncio
async def test_health_metrics_endpoint(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/health/metrics")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["success"] is True
    data = payload["data"]
    assert data["clusterHealth"] == "healthy"
    assert data["totalNodes"] == 6
    assert data["onlineNodes"] == 6


@pytest.mark.asyncio
async def test_nodes_endpoints(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/nodes")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["success"] is True
    nodes = payload["data"]
    assert len(nodes) == 6

    # Test topology endpoint
    topo_resp = await async_client.get("/api/v1/nodes/topology")
    assert topo_resp.status_code == 200
    topo_payload = topo_resp.json()
    assert topo_payload["success"] is True
    assert topo_payload["data"]["totalNodes"] == 6


@pytest.mark.asyncio
async def test_storage_overview_and_metrics(async_client: AsyncClient):
    resp_overview = await async_client.get("/api/v1/storage/overview")
    assert resp_overview.status_code == 200
    overview_data = resp_overview.json()["data"]
    assert "logical_storage" in overview_data
    assert "storage_efficiency" in overview_data
    assert overview_data["data_shards"] == 4
    assert overview_data["parity_shards"] == 2

    resp_metrics = await async_client.get("/api/v1/storage/metrics")
    assert resp_metrics.status_code == 200
    metrics_data = resp_metrics.json()["data"]
    assert "logicalUsed" in metrics_data
    assert "efficiencyPercent" in metrics_data


@pytest.mark.asyncio
async def test_dashboard_overview(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/dashboard/overview")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "storage_used" in data
    assert "storage_capacity" in data
    assert "cluster_health" in data
    assert "healthy_nodes" in data


@pytest.mark.asyncio
async def test_repairs_list(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/repairs")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert "active" in data
    assert "queued" in data
    assert "completed" in data
    assert "failed" in data


@pytest.mark.asyncio
async def test_activity_list(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/activity")
    assert resp.status_code == 200
    payload = resp.json()
    assert payload["success"] is True
    assert isinstance(payload["data"], list)


@pytest.mark.asyncio
async def test_settings_endpoint(async_client: AsyncClient):
    resp = await async_client.get("/api/v1/settings")
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["dataShards"] == 4
    assert data["parityShards"] == 2
