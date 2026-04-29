"""user profile fields + return request timestamp

Revision ID: 002
Revises: 001
Create Date: 2026-04-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("year_of_study", sa.String(length=64), nullable=True))
    op.add_column("users", sa.Column("roll_number", sa.String(length=64), nullable=True))
    op.add_column(
        "transactions",
        sa.Column("return_requested_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("transactions", "return_requested_at")
    op.drop_column("users", "roll_number")
    op.drop_column("users", "year_of_study")
