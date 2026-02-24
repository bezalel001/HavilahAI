## Backend Setup

This folder houses the FastAPI stack for Havilah.

### Prerequisites
- Python 3.13
- [uv](https://github.com/astral-sh/uv) for dependency management
- PostgreSQL 16+
- MongoDB 7+

### Install & Run
```bash
cp .env.example .env
uv sync          # install dependencies into .venv
uv run python -m app.main
# or with hot reload
uv run fastapi dev app/main.py
```

### Key Commands
- `uv run pytest` — execute backend tests when they’re added.
- `uv run alembic revision --autogenerate -m "..."` — create DB migrations once Alembic config lands.
- `uv run celery -A app.worker.celery_app:celery_app worker --loglevel=info` — run background task worker.

### Docker (recommended)
```bash
docker compose up --build
```
This starts the API, Celery worker, realtime WebSocket server, PostgreSQL, MongoDB, and Redis containers for local work.
