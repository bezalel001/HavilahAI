"""add machine learning topic seed

Revision ID: 202502051200
Revises: 202502041200
Create Date: 2025-02-05 12:00:00.000000
"""

from datetime import datetime
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "202502051200"
down_revision = "202502041200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    connection = op.get_bind()
    exists = connection.execute(
        sa.text("SELECT 1 FROM topics WHERE name = :name"),
        {"name": "Machine Learning"},
    ).first()
    if exists:
        return

    topic_id = uuid4()
    now = datetime.utcnow()
    connection.execute(
        sa.text(
            """
            INSERT INTO topics (
                id, name, category, icon_emoji, description, difficulty,
                estimated_hours, gradient_color, is_popular, created_at, updated_at
            )
            VALUES (
                :id, :name, :category, :icon_emoji, :description, :difficulty,
                :estimated_hours, :gradient_color, :is_popular, :created_at, :updated_at
            )
            """
        ),
        {
            "id": topic_id,
            "name": "Machine Learning",
            "category": "AI & Data",
            "icon_emoji": "🤖",
            "description": "Learn supervised, unsupervised, and practical ML workflows.",
            "difficulty": "intermediate",
            "estimated_hours": 4.0,
            "gradient_color": "from-indigo-500 to-cyan-500",
            "is_popular": True,
            "created_at": now,
            "updated_at": now,
        },
    )

    modules = [
        ("ML Foundations", "reading", 20, 1),
        ("Supervised Learning", "video", 25, 2),
        ("Unsupervised Learning", "video", 20, 3),
        ("Model Evaluation", "interactive", 15, 4),
        ("Practice Quiz", "quiz", 10, 5),
    ]
    for title, mtype, duration, order_index in modules:
        connection.execute(
            sa.text(
                """
                INSERT INTO learning_modules (
                    id, topic_id, title, type, duration_minutes, order_index
                )
                VALUES (
                    :id, :topic_id, :title, :type, :duration_minutes, :order_index
                )
                """
            ),
            {
                "id": uuid4(),
                "topic_id": topic_id,
                "title": title,
                "type": mtype,
                "duration_minutes": duration,
                "order_index": order_index,
            },
        )


def downgrade() -> None:
    connection = op.get_bind()
    topic_row = connection.execute(
        sa.text("SELECT id FROM topics WHERE name = :name"),
        {"name": "Machine Learning"},
    ).first()
    if not topic_row:
        return

    topic_id = topic_row[0]
    connection.execute(
        sa.text("DELETE FROM learning_modules WHERE topic_id = :topic_id"),
        {"topic_id": topic_id},
    )
    connection.execute(
        sa.text("DELETE FROM topics WHERE id = :topic_id"),
        {"topic_id": topic_id},
    )
