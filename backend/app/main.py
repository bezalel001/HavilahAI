from fastapi import FastAPI

from app.api.api_v1.router import api_router
from app.core.config import settings
from app.core.events import create_start_app_handler, create_stop_app_handler


def get_application() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME, version=settings.VERSION)
    app.include_router(api_router, prefix=settings.API_V1_STR)
    app.add_event_handler("startup", create_start_app_handler(app))
    app.add_event_handler("shutdown", create_stop_app_handler(app))
    return app


app = get_application()
