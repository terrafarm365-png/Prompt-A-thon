from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.db.models.user import User
from app.services.download_service import get_download_service

router = APIRouter(prefix="/downloads", tags=["Downloads"])


@router.get("/{id}")
async def download_file(
    id: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
):
    """Download an object with RS(4+2) reconstruction support."""
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
    }

    return Response(
        content=file_bytes,
        media_type=obj.mime_type or "application/octet-stream",
        headers=headers,
    )
