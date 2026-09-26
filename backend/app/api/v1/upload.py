import os
from fastapi import APIRouter, Depends, File, Header, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.core.exceptions import UploadSessionError
from app.db.models.upload_session import UploadSession
from app.db.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.objects import (
    CompleteUploadRequest,
    InitiateUploadRequest,
    InitiateUploadResponse,
    VaultObjectResponse,
)
from app.services.object_service import get_object_service
from app.services.upload_service import get_upload_service

router = APIRouter(prefix="/upload", tags=["Upload Pipeline"])


@router.post("/initiate", response_model=ApiResponse[InitiateUploadResponse], status_code=status.HTTP_201_CREATED)
async def initiate_upload(
    request: InitiateUploadRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
    idempotency_key: str = Header(None, alias="Idempotency-Key"),
):
    """Initiate a chunked or multipart upload session."""
    upload_service = get_upload_service()
    resp = await upload_service.initiate_upload(
        session=session,
        user_id=current_user.id,
        name=request.name,
        size=request.size,
        content_type=request.content_type or "application/octet-stream",
        bucket=request.bucket or "vault-prod-east1",
        idempotency_key=request.idempotency_key or idempotency_key,
    )
    return ApiResponse.ok(resp)


@router.put("/{id}/part", response_model=ApiResponse[dict])
async def upload_part(
    id: str,
    part_number: int = Header(1, alias="X-Vault-Part-Number"),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Upload a stream chunk or part for an active upload session."""
    stmt = select(UploadSession).where(UploadSession.id == id, UploadSession.user_id == current_user.id)
    res = await session.execute(stmt)
    upload_sess = res.scalar_one_or_none()

    if not upload_sess or upload_sess.status == "aborted":
        raise UploadSessionError(id, "Upload session not found or aborted")

    content = await file.read()
    temp_dir = "temp/uploads"
    os.makedirs(temp_dir, exist_ok=True)
    temp_path = os.path.join(temp_dir, f"{id}.part_{part_number}")
    with open(temp_path, "wb") as f:
        f.write(content)

    upload_sess.parts_count += 1
    upload_sess.status = "parts_received"
    await session.commit()

    return ApiResponse.ok({"upload_id": id, "part_number": part_number, "bytes_received": len(content)})


@router.post("/{id}/complete", response_model=ApiResponse[VaultObjectResponse])
async def complete_upload(
    id: str,
    request: CompleteUploadRequest = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """
    Finalize an upload session: reassemble parts, execute Reed-Solomon RS(4+2)
    distribution across storage nodes, and persist metadata.
    """
    stmt = select(UploadSession).where(UploadSession.id == id, UploadSession.user_id == current_user.id)
    res = await session.execute(stmt)
    upload_sess = res.scalar_one_or_none()

    if not upload_sess or upload_sess.status == "aborted":
        raise UploadSessionError(id, "Upload session not found or aborted")

    temp_dir = "temp/uploads"
    part_files = [
        os.path.join(temp_dir, f)
        for f in sorted(os.listdir(temp_dir))
        if f.startswith(f"{id}.part_")
    ]

    full_payload = bytearray()
    for pf in part_files:
        with open(pf, "rb") as f:
            full_payload.extend(f.read())
        try:
            os.remove(pf)
        except Exception:
            pass

    upload_service = get_upload_service()
    object_service = get_object_service()

    obj = await upload_service.process_and_distribute(
        session=session,
        user=current_user,
        name=upload_sess.object_name,
        payload=bytes(full_payload),
        content_type=upload_sess.content_type,
    )

    upload_sess.status = "completed"
    await session.commit()

    return ApiResponse.ok(object_service.to_vault_object_response(obj))


@router.delete("/{id}", response_model=ApiResponse[dict])
async def abort_upload(
    id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Abort an active upload session and clean up temporary parts."""
    stmt = select(UploadSession).where(UploadSession.id == id, UploadSession.user_id == current_user.id)
    res = await session.execute(stmt)
    upload_sess = res.scalar_one_or_none()

    if upload_sess:
        upload_sess.status = "aborted"
        await session.commit()

    temp_dir = "temp/uploads"
    if os.path.exists(temp_dir):
        for f in os.listdir(temp_dir):
            if f.startswith(f"{id}.part_"):
                try:
                    os.remove(os.path.join(temp_dir, f))
                except Exception:
                    pass

    return ApiResponse.ok({"message": f"Upload session {id} aborted successfully"})
