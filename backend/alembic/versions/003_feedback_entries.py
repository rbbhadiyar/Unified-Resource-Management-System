"""feedback entries table

Revision ID: 003
Revises: 002
Create Date: 2026-04-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "feedback_entries",
        sa.Column("feedback_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("scope", sa.String(length=16), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(length=64), nullable=True),
        sa.Column("comment", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["request_id"], ["requests.request_id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("feedback_id"),
    )
    op.create_index(op.f("ix_feedback_entries_feedback_id"), "feedback_entries", ["feedback_id"], unique=False)
    op.create_index(op.f("ix_feedback_entries_user_id"), "feedback_entries", ["user_id"], unique=False)
    op.create_index(
        "uq_feedback_user_request_resource",
        "feedback_entries",
        ["user_id", "request_id"],
        unique=True,
        postgresql_where=sa.text("request_id IS NOT NULL AND scope = 'resource'"),
    )


def downgrade() -> None:
    op.drop_index("uq_feedback_user_request_resource", table_name="feedback_entries")
    op.drop_index(op.f("ix_feedback_entries_user_id"), table_name="feedback_entries")
    op.drop_index(op.f("ix_feedback_entries_feedback_id"), table_name="feedback_entries")
    op.drop_table("feedback_entries")
