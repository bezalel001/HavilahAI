from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api_v1.router import api_router
from app.core.config import settings
from app.core.events import create_start_app_handler, create_stop_app_handler


def get_application() -> FastAPI:
    body_limit = settings.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        max_request_body_size=body_limit * 2,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(api_router, prefix=settings.API_V1_STR)
    app.add_event_handler("startup", create_start_app_handler(app))
    app.add_event_handler("shutdown", create_stop_app_handler(app))
    return app


app = get_application()
