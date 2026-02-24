"""add topics and learning modules tables

Revision ID: 202502031200
Revises: 19ecb4c4875b
Create Date: 2025-02-03 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from uuid import uuid4
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "202502031200"
down_revision = "19ecb4c4875b"
branch_labels = None
depends_on = None


topicdifficulty = sa.Enum("beginner", "intermediate", "advanced", name="topicdifficulty")
moduletype = sa.Enum("video", "reading", "interactive", "quiz", name="moduletype")


def upgrade() -> None:
    topicdifficulty.create(op.get_bind(), checkfirst=True)
    moduletype.create(op.get_bind(), checkfirst=True)

    topics_table = op.create_table(
        "topics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("icon_emoji", sa.String(length=16), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("difficulty", topicdifficulty, nullable=False, server_default="intermediate"),
        sa.Column("estimated_hours", sa.Float(), nullable=False, server_default="1"),
        sa.Column("gradient_color", sa.String(length=64), nullable=False, server_default="from-purple-500 to-pink-500"),
        sa.Column("is_popular", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )

    modules_table = op.create_table(
        "learning_modules",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("topic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("topics.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("type", moduletype, nullable=False, server_default="reading"),
        sa.Column("duration_minutes", sa.Integer(), nullable=False, server_default="10"),
        sa.Column("order_index", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("content_url", sa.String(length=512)),
        sa.Column("eu_context", sa.Text()),
    )
    op.create_index("ix_learning_modules_topic_id", "learning_modules", ["topic_id"])

    op.create_table(
        "user_topic_progress",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("topic_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("topics.id", ondelete="CASCADE"), nullable=False),
        sa.Column("started_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("last_accessed", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("progress_percentage", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_modules", postgresql.ARRAY(postgresql.UUID(as_uuid=True)), server_default="{}"),
    )
    op.create_index("ix_user_topic_progress_user_id", "user_topic_progress", ["user_id"])
    op.create_index("ix_user_topic_progress_topic_id", "user_topic_progress", ["topic_id"])

    op.create_table(
        "user_module_completions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("module_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("learning_modules.id", ondelete="CASCADE"), nullable=False),
        sa.Column("completed_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("time_spent_seconds", sa.Integer(), nullable=False, server_default="0"),
    )
    op.create_index("ix_user_module_completions_user_id", "user_module_completions", ["user_id"])
    op.create_index("ix_user_module_completions_module_id", "user_module_completions", ["module_id"])

    seed_topic_data(topics_table, modules_table)


def downgrade() -> None:
    op.drop_index("ix_user_module_completions_module_id", table_name="user_module_completions")
    op.drop_index("ix_user_module_completions_user_id", table_name="user_module_completions")
    op.drop_table("user_module_completions")

    op.drop_index("ix_user_topic_progress_topic_id", table_name="user_topic_progress")
    op.drop_index("ix_user_topic_progress_user_id", table_name="user_topic_progress")
    op.drop_table("user_topic_progress")

    op.drop_index("ix_learning_modules_topic_id", table_name="learning_modules")
    op.drop_table("learning_modules")

    op.drop_table("topics")

    moduletype.drop(op.get_bind(), checkfirst=True)
    topicdifficulty.drop(op.get_bind(), checkfirst=True)


def seed_topic_data(topics_table, modules_table):
    connection = op.get_bind()
    topics = [
        {
            "id": uuid4(),
            "name": "GDPR & Data Privacy",
            "category": "Law & Policy",
            "icon_emoji": "🔒",
            "description": "Master the fundamentals of data protection in the EU.",
            "difficulty": "intermediate",
            "estimated_hours": 3.5,
            "gradient_color": "from-blue-500 to-cyan-500",
            "is_popular": True,
            "modules": [
                ("Introduction & Overview", "video", 15, 1),
                ("Core Concepts Explained", "reading", 25, 2),
                ("Interactive Examples", "interactive", 20, 3),
                ("Practice Quiz", "quiz", 10, 4),
                ("Deep Dive Discussion", "reading", 30, 5),
            ],
        },
        {
            "id": uuid4(),
            "name": "Quantum Physics",
            "category": "Physics",
            "icon_emoji": "⚛️",
            "description": "Understand superposition, entanglement, and modern applications.",
            "difficulty": "advanced",
            "estimated_hours": 4.0,
            "gradient_color": "from-purple-500 to-pink-500",
            "is_popular": True,
            "modules": [
                ("Atoms to Qubits", "video", 20, 1),
                ("Mathematical Foundations", "reading", 30, 2),
                ("Thought Experiments", "interactive", 15, 3),
            ],
        },
        {
            "id": uuid4(),
            "name": "Calculus Fundamentals",
            "category": "Mathematics",
            "icon_emoji": "📊",
            "description": "Derivatives, integrals, and limits explained clearly.",
            "difficulty": "beginner",
            "estimated_hours": 3.0,
            "gradient_color": "from-green-500 to-teal-500",
            "is_popular": True,
            "modules": [
                ("Limits Refresher", "reading", 15, 1),
                ("Derivatives in Action", "video", 25, 2),
                ("Integration Workshop", "interactive", 20, 3),
                ("Practice Quiz", "quiz", 15, 4),
            ],
        },
    ]

    for topic in topics:
        connection.execute(topics_table.insert().values(**{k: v for k, v in topic.items() if k != "modules"}))
        for title, mtype, duration, order_index in topic["modules"]:
            connection.execute(
                modules_table.insert().values(
                    id=uuid4(),
                    topic_id=topic["id"],
                    title=title,
                    type=mtype,
                    duration_minutes=duration,
                    order_index=order_index,
                )
            )
