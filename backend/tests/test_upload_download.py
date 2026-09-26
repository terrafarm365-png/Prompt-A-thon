import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import InsufficientShardsError
from app.db.models.user import User
from app.services.download_service import DownloadService
from app.services.upload_service import UploadService
from app.storage.node_client import StorageNodeClient
from app.storage.node_registry import get_node_registry


@pytest.mark.asyncio
async def test_full_upload_and_download_pipeline(db_session: AsyncSession):
    """
    Test end-to-end distributed upload and download lifecycle:
    - 4 data shards, 2 parity shards distributed to nodes A-F.
    - Simulated storage node storage in in-memory memory store.
    - Test full reconstruction when 1 node is offline.
    - Test full reconstruction when 2 nodes are offline.
    """
    # 1. Setup in-memory simulated storage for all node clients
    cluster_storage = {}  # (node_id, shard_id) -> bytes
    offline_nodes = set()

    registry = get_node_registry()
    for node_cfg in registry.list_nodes():
        client = registry.get_client(node_cfg.id)

        # Mock store_shard
        async def mock_store(shard_id, data, checksum, object_id, shard_index=0, shard_type="data", c=client):
            if c.node_id in offline_nodes:
                raise Exception(f"Node {c.node_id} is offline")
            cluster_storage[(c.node_id, shard_id)] = data
            from app.storage.node_protocol import StoreShardResponse
            return StoreShardResponse(shard_id=shard_id, size_bytes=len(data), checksum=checksum, stored_at="now")

        # Mock read_shard
        async def mock_read(shard_id, expected_checksum=None, c=client):
            if c.node_id in offline_nodes:
                raise Exception(f"Node {c.node_id} is offline")
            key = (c.node_id, shard_id)
            if key not in cluster_storage:
                raise Exception(f"Shard {shard_id} not found on node {c.node_id}")
            return cluster_storage[key]

        # Mock verify_shard
        async def mock_verify(shard_id, expected_checksum, c=client):
            return type("VerifyResp", (), {"valid": True, "actual_checksum": expected_checksum})()

        # Mock delete_shard
        async def mock_del(shard_id, c=client):
            cluster_storage.pop((c.node_id, shard_id), None)
            return True

        client.store_shard = mock_store
        client.read_shard = mock_read
        client.verify_shard = mock_verify
        client.delete_shard = mock_del

    # Get admin user
    user_res = await db_session.execute(select(User).where(User.email == "admin@vault.test"))
    user = user_res.scalar_one()

    upload_service = UploadService()
    download_service = DownloadService()

    # 2. Upload object (256 KB binary data)
    test_payload = b"Vault Distributed Erasure-Coded Object Storage Test Payload" * 4000
    obj = await upload_service.process_and_distribute(
        session=db_session,
        user=user,
        name="test_document.bin",
        payload=test_payload,
        content_type="application/octet-stream",
    )

    assert obj.id is not None
    assert obj.status == "healthy"
    assert len(obj.shards) == 6

    # 3. Download with all 6 nodes healthy
    retrieved_obj, downloaded_data = await download_service.reconstruct_and_stream(
        session=db_session,
        user=user,
        object_id=obj.id,
    )
    assert downloaded_data == test_payload
    assert retrieved_obj.checksum == obj.checksum

    # 4. Simulate Node C going offline (1 missing data shard)
    offline_nodes.add("node-c")
    retrieved_obj_deg1, downloaded_data_deg1 = await download_service.reconstruct_and_stream(
        session=db_session,
        user=user,
        object_id=obj.id,
    )
    assert downloaded_data_deg1 == test_payload

    # 5. Simulate Node A also going offline (2 missing data shards: Node A and Node C)
    offline_nodes.add("node-a")
    retrieved_obj_deg2, downloaded_data_deg2 = await download_service.reconstruct_and_stream(
        session=db_session,
        user=user,
        object_id=obj.id,
    )
    assert downloaded_data_deg2 == test_payload

    # 6. Simulate Node E also going offline (3 missing shards: Node A, Node C, Node E)
    # Beyond RS(4+2) tolerance -> must raise InsufficientShardsError!
    offline_nodes.add("node-e")
    with pytest.raises(InsufficientShardsError):
        await download_service.reconstruct_and_stream(
            session=db_session,
            user=user,
            object_id=obj.id,
        )
