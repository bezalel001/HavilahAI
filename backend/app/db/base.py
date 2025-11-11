from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so Alembic / metadata is aware of them
from app.models import user  # noqa: E402,F401
