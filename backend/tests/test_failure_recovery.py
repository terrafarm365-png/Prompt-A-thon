import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.models.node import StorageNode
from app.db.models.object import Object
from app.db.models.shard import Shard
from app.db.models.user import User
from app.services.repair_service import RepairService
from app.services.upload_service import UploadService
from app.storage.node_registry import get_node_registry
from app.utils.hashing import compute_sha256


@pytest.mark.asyncio
async def test_shard_repair_and_recovery(db_session: AsyncSession):
    # Setup node cluster storage mock
    cluster_storage = {}
    offline_nodes = set()

    # Add a 7th standby node (node-g) to act as a repair destination
    standby_node = StorageNode(
        id="node-g",
        name="Node-G (Standby)",
        endpoint="http://localhost:9107",
        status="online",
        enabled=True,
        capacity_bytes=1_000_000_000_000,
        used_bytes=0,
        free_bytes=1_000_000_000_000,
        load=0.01,
        rack="rack-03",
        region="us-east-1",
    )
    db_session.add(standby_node)
    await db_session.commit()

    registry = get_node_registry()
    from app.core.config import StorageNodeConfig
    registry.register_node(
        StorageNodeConfig(id="node-g", name="Node-G", url="http://localhost:9107")
    )

    for node_cfg in registry.list_nodes():
        client = registry.get_client(node_cfg.id)

        async def mock_store(shard_id, data, checksum, object_id, shard_index=0, shard_type="data", c=client):
            if c.node_id in offline_nodes:
                raise Exception(f"Node {c.node_id} is offline")
            cluster_storage[(c.node_id, shard_id)] = data
            from app.storage.node_protocol import StoreShardResponse
            return StoreShardResponse(shard_id=shard_id, size_bytes=len(data), checksum=checksum, stored_at="now")

        async def mock_read(shard_id, expected_checksum=None, c=client):
            if c.node_id in offline_nodes:
                raise Exception(f"Node {c.node_id} is offline")
            key = (c.node_id, shard_id)
            if key not in cluster_storage:
                raise Exception(f"Shard {shard_id} not found on node {c.node_id}")
            return cluster_storage[key]

        async def mock_verify(shard_id, expected_checksum, c=client):
            data = cluster_storage.get((c.node_id, shard_id))
            csum = compute_sha256(data) if data else ""
            from app.storage.node_protocol import VerifyShardResponse
            return VerifyShardResponse(
                shard_id=shard_id,
                valid=(csum == expected_checksum),
                expected_checksum=expected_checksum,
                actual_checksum=csum,
                checked_at="now",
            )

        client.store_shard = mock_store
        client.read_shard = mock_read
        client.verify_shard = mock_verify

    # Get admin user
    user_res = await db_session.execute(select(User).where(User.email == "admin@vault.test"))
    user = user_res.scalar_one()

    # 1. Upload object
    upload_service = UploadService()
    test_data = b"Self-Healing Distributed Vault Object Test Payload 2026" * 500
    obj = await upload_service.process_and_distribute(
        session=db_session,
        user=user,
        name="recovery_test.dat",
        payload=test_data,
    )

    # 2. Identify shard 3 (D3)
    target_shard = next(s for s in obj.shards if s.shard_index == 3)
    original_node_id = target_shard.node_id
    original_checksum = target_shard.checksum

    # Simulate failure of the node hosting shard 3
    offline_nodes.add(original_node_id)
    target_shard.status = "missing"
    obj.status = "degraded"
    failed_node_res = await db_session.execute(select(StorageNode).where(StorageNode.id == original_node_id))
    failed_node = failed_node_res.scalar_one_or_none()
    if failed_node:
        failed_node.status = "offline"
    await db_session.commit()

    # 3. Queue repair task
    repair_service = RepairService()
    repair_task = await repair_service.queue_repair_task(
        session=db_session,
        object_id=obj.id,
        missing_shard_id=target_shard.id,
        reason="Simulated hardware failure",
    )
    assert repair_task.status == "queued"
    existing_surviving_nodes = {s.node_id for s in obj.shards if s.id != target_shard.id}
    assert repair_task.destination_node_id not in existing_surviving_nodes

    # 4. Execute repair
    completed_task = await repair_service.execute_repair(session=db_session, repair_id=repair_task.id)
    assert completed_task.status == "completed"
    assert completed_task.progress == 100.0

    # 5. Verify target shard is now on destination node with valid checksum
    await db_session.refresh(target_shard)
    await db_session.refresh(obj)
    assert target_shard.node_id == repair_task.destination_node_id
    assert target_shard.status == "healthy"
    assert target_shard.checksum == original_checksum
    assert obj.status == "healthy"
