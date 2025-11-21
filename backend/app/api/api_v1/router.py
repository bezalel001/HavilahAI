from fastapi import APIRouter

from app.api.routes import auth, content, debug, ocr, uploads


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
