from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin_user, get_current_user, get_db
from app.core.config import get_settings
from app.db.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.settings import DurabilitySettingsResponse, DurabilitySettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])


@router.get("", response_model=ApiResponse[DurabilitySettingsResponse])
async def get_cluster_settings(
    current_user: User = Depends(get_current_user),
):
    """Get durability and scrub settings matching frontend DurabilitySettings format."""
    settings = get_settings()
    return ApiResponse.ok(
        DurabilitySettingsResponse(
            dataShards=settings.DATA_SHARDS,
            parityShards=settings.PARITY_SHARDS,
            autoRepair=True,
            scrubFrequencyDays=1,
            compressionEnabled=True,
            encryptionAlgorithm="AES-256-GCM",
            replicationQuorum=settings.DATA_SHARDS,
        )
    )


@router.patch("", response_model=ApiResponse[DurabilitySettingsResponse])
async def update_cluster_settings(
    update_data: DurabilitySettingsUpdate,
    admin_user: User = Depends(get_current_admin_user),
    session: AsyncSession = Depends(get_db),
):
    """Update cluster durability parameters (admin only)."""
    settings = get_settings()
    if update_data.dataShards is not None:
        settings.DATA_SHARDS = update_data.dataShards
    if update_data.parityShards is not None:
        settings.PARITY_SHARDS = update_data.parityShards

    return ApiResponse.ok(
        DurabilitySettingsResponse(
            dataShards=settings.DATA_SHARDS,
            parityShards=settings.PARITY_SHARDS,
            autoRepair=update_data.autoRepair if update_data.autoRepair is not None else True,
            scrubFrequencyDays=update_data.scrubFrequencyDays if update_data.scrubFrequencyDays is not None else 1,
            compressionEnabled=update_data.compressionEnabled if update_data.compressionEnabled is not None else True,
            encryptionAlgorithm=update_data.encryptionAlgorithm or "AES-256-GCM",
            replicationQuorum=settings.DATA_SHARDS,
        )
    )
