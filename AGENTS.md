# Repository Guidelines

## Project Structure & Module Organization
Havilah’s backend lives under `backend/`. Runtime code is split inside `backend/app`: `core/` exposes configuration (`core/config.py`) and should be the sole reader of `.env`; `db/` holds SQLAlchemy base/session helpers; `models/` keeps ORM entities such as `models/user.py`; `schemas/` is reserved for Pydantic request/response models so transport contracts stay separate from persistence. Introduce tests under `backend/tests/<module>/...` so the tree mirrors the app modules and makes ownership obvious.

## Build, Test, and Development Commands
- `cd backend && uv sync` — install the Python 3.13 toolchain from `pyproject.toml` + `uv.lock`.
- `cd backend && uv run python main.py` — run the current entry point; swap in your FastAPI app once it exists.
- `cd backend && uv run fastapi dev main.py` — FastAPI’s CLI (bundled via `fastapi[standard]`) hot-reloads the server for API work.
- `cd backend && uv run pytest` — execute the suite after adding `pytest` (and friends) as dev dependencies.
Document new commands here whenever you introduce Celery workers, Alembic migrations, or asset pipelines.

## Coding Style & Naming Conventions
Target Python 3.13, 4-space indentation, and type annotations on public callables. Keep modules/files in `snake_case`, classes in `PascalCase`, and constants in `UPPER_SNAKE_CASE`. SQLAlchemy models stay in `app/models`, Pydantic schemas in `app/schemas`, and configuration logic in `app/core` to keep API routers thin. Run your formatter/linter (`uv run python -m black .` and similar) before pushing and fix warnings in the same commit.

## Testing Guidelines
Co-locate async API tests under `backend/tests` following `test_<feature>.py` and descriptive test names such as `test_register_user_returns_201`. Use FastAPI’s `TestClient` or `httpx.AsyncClient` plus dependency overrides for isolation. Assert on HTTP status, payload shape, and side effects (DB, Redis, MinIO). Aim for feature-level coverage before requesting review and update fixtures whenever settings or schemas change.

## Commit & Pull Request Guidelines
History already uses Conventional Commits (`chore: backend starter code`), so keep `type(scope?): summary` and reference issues in the body when relevant. Every PR should describe the change, call out new env vars/secrets, list the commands/tests you ran, and include screenshots for UX-facing updates. Rebase onto `main`, ensure lint/tests pass locally, and request review only after the branch is CI-ready.

## Environment & Secrets
`app/core/config.py` loads everything via `pydantic-settings`; populate `.env` locally with the provided keys for SMTP, Redis, MongoDB, MinIO, and AI services. Never commit real credentials—use example values in docs or `.env.example`. When adding a new secret, document the purpose, expected format, and whether it is required for local development or only in production.
