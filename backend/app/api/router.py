from fastapi import APIRouter

from app.api.v1.activity import router as activity_router
from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.downloads import router as downloads_router
from app.api.v1.health import router as health_router
from app.api.v1.nodes import router as nodes_router
from app.api.v1.objects import router as objects_router
from app.api.v1.repairs import router as repairs_router
from app.api.v1.settings import router as settings_router
from app.api.v1.storage import router as storage_router
from app.api.v1.upload import router as upload_router
from app.api.v1.users import router as users_router

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(objects_router)
api_v1_router.include_router(upload_router)
api_v1_router.include_router(downloads_router)
api_v1_router.include_router(nodes_router)
api_v1_router.include_router(health_router)
api_v1_router.include_router(repairs_router)
api_v1_router.include_router(storage_router)
api_v1_router.include_router(activity_router)
api_v1_router.include_router(dashboard_router)
api_v1_router.include_router(settings_router)
