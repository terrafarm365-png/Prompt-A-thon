from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.db.models.repair import RepairTask
from app.db.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.repairs import RepairRetryRequest, RepairsListResponse, RepairTaskResponse
from app.services.repair_service import get_repair_service
from app.utils.time import to_iso
from app.workers.tasks import get_task_queue

router = APIRouter(prefix="/repairs", tags=["Repairs"])


def _to_repair_response(task: RepairTask) -> RepairTaskResponse:
    source_nodes = []
    return RepairTaskResponse(
        id=task.id,
        objectId=task.object_id,
        objectName=task.object_name,
        shardIndex=task.shard_index,
        shardLabel=task.shard_label,
        shardType=task.shard_type,
        sourceNodeId="multi-node",
        sourceNodeName="Quorum Nodes",
        destinationNodeId=task.destination_node_id,
        destinationNodeName=task.destination_node_name,
        progress=task.progress,
        status="in-progress" if task.status == "running" else task.status,
        reason=task.reason,
        detectedAt=to_iso(task.created_at),
        startedAt=to_iso(task.started_at) if task.started_at else None,
        completedAt=to_iso(task.completed_at) if task.completed_at else None,
        bytesTotal=task.bytes_total,
        bytesTransferred=task.bytes_transferred,
    )


@router.get("", response_model=ApiResponse[RepairsListResponse])
async def list_repairs(
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List categorized repair tasks per Requirement 36."""
    stmt = select(RepairTask).order_by(RepairTask.created_at.desc()).limit(100)
    res = await session.execute(stmt)
    tasks = list(res.scalars().all())

    active: List[RepairTaskResponse] = []
    queued: List[RepairTaskResponse] = []
    completed: List[RepairTaskResponse] = []
    failed: List[RepairTaskResponse] = []

    for t in tasks:
        resp = _to_repair_response(t)
        if t.status in ("in-progress", "running"):
            active.append(resp)
        elif t.status == "queued":
            queued.append(resp)
        elif t.status == "completed":
            completed.append(resp)
        else:
            failed.append(resp)

    return ApiResponse.ok(
        RepairsListResponse(
            active=active,
            queued=queued,
            completed=completed,
            failed=failed,
            totalActive=len(active) + len(queued),
            totalCompleted=len(completed),
        )
    )


@router.get("/{id}", response_model=ApiResponse[RepairTaskResponse])
async def get_repair_by_id(
    id: str,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get single repair task details."""
    stmt = select(RepairTask).where(RepairTask.id == id)
    res = await session.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail=f"Repair task '{id}' not found")
    return ApiResponse.ok(_to_repair_response(task))


@router.post("/{id}/retry", response_model=ApiResponse[RepairTaskResponse])
async def retry_repair(
    id: str,
    request: Optional[RepairRetryRequest] = None,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Re-queue and immediately trigger a failed repair task."""
    stmt = select(RepairTask).where(RepairTask.id == id)
    res = await session.execute(stmt)
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail=f"Repair task '{id}' not found")

    task.status = "queued"
    task.retry_count += 1
    task.progress = 0.0
    task.error_message = None
    await session.commit()

    # Enqueue to background worker
    queue = get_task_queue()
    await queue.enqueue_repair(task.id)

    return ApiResponse.ok(_to_repair_response(task))
