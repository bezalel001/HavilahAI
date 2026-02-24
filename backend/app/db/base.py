from sqlalchemy.orm import declarative_base

Base = declarative_base()

# Import models so Alembic / metadata is aware of them
from app.models import chat, feed_interaction, flashcard_attempt, goal, quiz_attempt, topic, upload, user  # noqa: E402,F401
