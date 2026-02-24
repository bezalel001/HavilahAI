"""add goals table

Revision ID: 202502061200
Revises: 202502051200
Create Date: 2025-02-06 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "202502061200"
down_revision = "202502051200"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "goals",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(length=200), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("current", sa.Float(), nullable=False, server_default="0"),
        sa.Column("total", sa.Float(), nullable=False),
        sa.Column("deadline", sa.Date(), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_goals_user_id", "goals", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_goals_user_id", table_name="goals")
    op.drop_table("goals")
