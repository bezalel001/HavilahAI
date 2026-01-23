from fastapi import APIRouter

from app.api.routes import (
    auth,
    chat,
    content,
    dashboard,
    debug,
    flashcards,
    learning_feed,
    ocr,
    progress,
    quiz,
    topics,
    uploads,
)


api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(debug.router, prefix="/debug", tags=["debug"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["ocr"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(learning_feed.router, prefix="/feed", tags=["feed"])
api_router.include_router(quiz.router, prefix="/quiz", tags=["quiz"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["flashcards"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(topics.router, prefix="/topics", tags=["topics"])
