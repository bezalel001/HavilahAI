from __future__ import annotations

import json
from typing import Any

import redis

from app.core.config import settings


def publish_realtime_event(event_type: str, payload: dict[str, Any]) -> None:
    """Best-effort event publish for websocket consumers."""
    message = {"type": event_type, **payload}
    try:
        client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)
        client.publish(settings.WS_REDIS_CHANNEL, json.dumps(message))
        client.close()
    except Exception:
        # Events are non-critical for API flow.
        return
