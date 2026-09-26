from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.nodes import NodeTopologyResponse, StorageNodeResponse
from app.services.node_service import get_node_service

router = APIRouter(prefix="/nodes", tags=["Storage Nodes"])


@router.get("", response_model=ApiResponse[List[StorageNodeResponse]])
async def list_nodes(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all registered storage nodes with current hardware and capacity metrics."""
    node_service = get_node_service()
    nodes = await node_service.get_all_nodes(session)
    return ApiResponse.ok(nodes)


@router.get("/topology", response_model=ApiResponse[NodeTopologyResponse])
async def get_node_topology(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve cluster node topology and shard connections for frontend network graphs."""
    node_service = get_node_service()
    topology = await node_service.get_topology(session)
    return ApiResponse.ok(topology)


@router.get("/{id}", response_model=ApiResponse[StorageNodeResponse])
async def get_node_by_id(
    id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get telemetry details for a specific storage node."""
    node_service = get_node_service()
    node = await node_service.get_node_by_id(session, id)
    if not node:
        raise HTTPException(status_code=404, detail=f"Storage node '{id}' not found")
    return ApiResponse.ok(node)


@router.post("/{id}/health-check", response_model=ApiResponse[StorageNodeResponse])
async def trigger_node_health_check(
    id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Trigger an on-demand ping and stats poll for a specific storage node."""
    node_service = get_node_service()
    updated_node = await node_service.check_single_node(session, id)
    return ApiResponse.ok(updated_node)
