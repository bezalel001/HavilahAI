from celery import Celery

from app.core.config import settings


celery_app = Celery(
    "havilah",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.worker.tasks"],
)

celery_app.conf.update(
    broker_connection_retry_on_startup=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    task_default_queue=settings.CELERY_QUEUE_NAME,
    timezone="UTC",
)
