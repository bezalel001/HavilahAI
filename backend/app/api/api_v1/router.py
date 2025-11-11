from fastapi import APIRouter

from app.api.routes import auth, debug


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
