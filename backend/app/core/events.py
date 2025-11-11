from fastapi import FastAPI
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.db.base import Base
from app.db.session import engine


def create_start_app_handler(app: FastAPI):
    async def start_app() -> None:
        Base.metadata.create_all(bind=engine)
        app.state.mongo_client = AsyncIOMotorClient(settings.MONGODB_URL)
        app.state.mongo_db = app.state.mongo_client[settings.MONGODB_DB_NAME]

    return start_app


def create_stop_app_handler(app: FastAPI):
    async def stop_app() -> None:
        mongo_client = getattr(app.state, "mongo_client", None)
        if mongo_client:
            mongo_client.close()

    return stop_app
