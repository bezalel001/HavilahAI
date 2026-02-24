"""add learning activity tables

Revision ID: 202502041200
Revises: 202502031200
Create Date: 2025-02-04 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "202502041200"
down_revision = "202502031200"
branch_labels = None
depends_on = None


uploadstatus = sa.Enum("uploaded", "processing", "processed", "failed", name="uploadstatus")
chatrole = sa.Enum("user", "assistant", name="chatrole")


def upgrade() -> None:
    uploadstatus.create(op.get_bind(), checkfirst=True)
    chatrole.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "uploads",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("original_filename", sa.String(length=255), nullable=False),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=255), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("storage_backend", sa.String(length=32), nullable=False),
        sa.Column("storage_path", sa.String(length=512), nullable=False),
        sa.Column("bucket_name", sa.String(length=255)),
        sa.Column("status", uploadstatus, nullable=False, server_default="uploaded"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_uploads_user_id", "uploads", ["user_id"])

    op.create_table(
        "quiz_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("topic", sa.String(length=255)),
        sa.Column("question_count", sa.Integer()),
        sa.Column("answers", sa.JSON()),
        sa.Column("duration_seconds", sa.Integer()),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("correct_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("total", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_quiz_attempts_user_id", "quiz_attempts", ["user_id"])

    op.create_table(
        "flashcard_attempts",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("topic", sa.String(length=255), nullable=False),
        sa.Column("known_ids", sa.JSON()),
        sa.Column("unknown_ids", sa.JSON()),
        sa.Column("known_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("unknown_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("progress_percent", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_flashcard_attempts_user_id", "flashcard_attempts", ["user_id"])

    op.create_table(
        "chat_sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(length=255)),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_chat_sessions_user_id", "chat_sessions", ["user_id"])

    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("chat_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("role", chatrole, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_chat_messages_session_id", "chat_messages", ["session_id"])

    op.create_table(
        "feed_video_interactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("video_id", sa.String(length=64), nullable=False),
        sa.Column("liked", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("saved", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_feed_video_interactions_user_id", "feed_video_interactions", ["user_id"])
    op.create_index("ix_feed_video_interactions_video_id", "feed_video_interactions", ["video_id"])


def downgrade() -> None:
    op.drop_index("ix_feed_video_interactions_video_id", table_name="feed_video_interactions")
    op.drop_index("ix_feed_video_interactions_user_id", table_name="feed_video_interactions")
    op.drop_table("feed_video_interactions")

    op.drop_index("ix_chat_messages_session_id", table_name="chat_messages")
    op.drop_table("chat_messages")

    op.drop_index("ix_chat_sessions_user_id", table_name="chat_sessions")
    op.drop_table("chat_sessions")

    op.drop_index("ix_flashcard_attempts_user_id", table_name="flashcard_attempts")
    op.drop_table("flashcard_attempts")

    op.drop_index("ix_quiz_attempts_user_id", table_name="quiz_attempts")
    op.drop_table("quiz_attempts")

    op.drop_index("ix_uploads_user_id", table_name="uploads")
    op.drop_table("uploads")

    chatrole.drop(op.get_bind(), checkfirst=True)
    uploadstatus.drop(op.get_bind(), checkfirst=True)
