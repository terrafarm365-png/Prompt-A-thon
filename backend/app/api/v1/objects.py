from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, Query, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.objects import VaultObjectResponse
from app.services.download_service import get_download_service
from app.services.object_service import get_object_service
from app.services.upload_service import get_upload_service

router = APIRouter(prefix="/objects", tags=["Objects"])


@router.get("", response_model=ApiResponse[List[VaultObjectResponse]])
async def list_objects(
    search: Optional[str] = Query(None, description="Search by object name"),
    bucket: Optional[str] = Query(None, description="Filter by bucket"),
    status: Optional[str] = Query(None, description="Filter by status (healthy, degraded, repairing, corrupted)"),
    sortBy: Optional[str] = Query("updatedAt", description="Sort field (name, size, updatedAt)"),
    sortOrder: Optional[str] = Query("desc", description="Sort order (asc, desc)"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """List stored objects matching frontend query criteria."""
    object_service = get_object_service()
    objects = await object_service.list_objects(
        session=session,
        user=current_user,
        search=search,
        bucket=bucket,
        status=status,
        sort_by=sortBy,
        sort_order=sortOrder,
    )
    return ApiResponse.ok(objects)


@router.post("", response_model=ApiResponse[VaultObjectResponse], status_code=status.HTTP_201_CREATED)
async def upload_object(
    file: UploadFile = File(...),
    bucket: Optional[str] = Form("vault-prod-east1"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Direct object upload with distributed Reed-Solomon RS(4+2) encoding.
    Splits payload into 4 data + 2 parity shards and distributes across 6 storage nodes.
    """
    upload_service = get_upload_service()
    object_service = get_object_service()

    payload = await file.read()
    content_type = file.content_type or "application/octet-stream"

    obj = await upload_service.process_and_distribute(
        session=session,
        user=current_user,
        name=file.filename or "unnamed_object",
        payload=payload,
        content_type=content_type,
        bucket=bucket or "vault-prod-east1",
    )

    resp = object_service.to_vault_object_response(obj)
    return ApiResponse.ok(resp)


@router.get("/{id}", response_model=ApiResponse[VaultObjectResponse])
async def get_object_by_id(
    id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Retrieve details and shard map for a specific object."""
    object_service = get_object_service()
    obj_response = await object_service.get_object_by_id(session, current_user, id)
    return ApiResponse.ok(obj_response)


@router.delete("/{id}", response_model=ApiResponse[dict])
async def delete_object(
    id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Safely delete an object and its distributed physical shards."""
    object_service = get_object_service()
    await object_service.delete_object_safely(session, current_user, id)
    return ApiResponse.ok({"message": f"Object {id} successfully deleted", "id": id})


@router.get("/{id}/download")
async def download_object(
    id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Download and reconstruct object from distributed storage nodes.
    Tolerates up to 2 missing or corrupted nodes via Reed-Solomon RS(4+2) recovery.
    """
    download_service = get_download_service()
    obj, file_bytes = await download_service.reconstruct_and_stream(
        session=session,
        user=current_user,
        object_id=id,
    )

    headers = {
        "Content-Disposition": f'attachment; filename="{obj.name}"',
        "Content-Length": str(len(file_bytes)),
        "X-Vault-Object-Checksum": obj.checksum,
        "X-Vault-Durability-Scheme": f"RS({obj.data_shards}+{obj.parity_shards})",
    }

    return Response(
        content=file_bytes,
        media_type=obj.mime_type or "application/octet-stream",
        headers=headers,
    )
