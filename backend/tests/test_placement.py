import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.placement_service import PlacementService


@pytest.mark.asyncio
async def test_placement_selection(db_session: AsyncSession):
    placement = PlacementService()
    selected_nodes = await placement.select_nodes_for_object(session=db_session, total_shards=6)

    assert len(selected_nodes) == 6
    # Ensure all selected node IDs are unique
    node_ids = [n.id for n in selected_nodes]
    assert len(set(node_ids)) == 6
    assert all(n.status in ("online", "degraded") for n in selected_nodes)


@pytest.mark.asyncio
async def test_repair_destination_selection(db_session: AsyncSession):
    placement = PlacementService()
    # Suppose shards are currently on nodes a, b, c, d, e
    existing_nodes = {"node-a", "node-b", "node-c", "node-d", "node-e"}
    
    # Destination node must NOT be one of the existing nodes
    dest_node = await placement.select_repair_destination(session=db_session, existing_shard_node_ids=existing_nodes)
    assert dest_node.id not in existing_nodes
    assert dest_node.id == "node-f"
