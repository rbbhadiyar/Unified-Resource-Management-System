"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-04-19

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "roles",
        sa.Column("role_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("role_name", sa.String(length=64), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint("role_id"),
        sa.UniqueConstraint("role_name"),
    )
    op.create_index(op.f("ix_roles_role_id"), "roles", ["role_id"], unique=False)

    op.create_table(
        "resource_types",
        sa.Column("type_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("type_name", sa.String(length=128), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("type_id"),
        sa.UniqueConstraint("type_name"),
    )
    op.create_index(op.f("ix_resource_types_type_id"), "resource_types", ["type_id"], unique=False)

    op.create_table(
        "users",
        sa.Column("user_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=32), nullable=True),
        sa.Column("department", sa.String(length=128), nullable=True),
        sa.Column("google_id", sa.String(length=255), nullable=True),
        sa.Column("email_verified", sa.Boolean(), nullable=False),
        sa.Column("is_blocked", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("role_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["role_id"], ["roles.role_id"]),
        sa.PrimaryKeyConstraint("user_id"),
        sa.UniqueConstraint("email"),
        sa.UniqueConstraint("google_id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_google_id"), "users", ["google_id"], unique=False)
    op.create_index(op.f("ix_users_user_id"), "users", ["user_id"], unique=False)

    op.create_table(
        "resources",
        sa.Column("resource_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("resource_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("type_id", sa.Integer(), nullable=False),
        sa.Column("total_quantity", sa.Integer(), nullable=False),
        sa.Column("available_quantity", sa.Integer(), nullable=False),
        sa.Column("lease_per_day", sa.Float(), nullable=True),
        sa.Column("security_deposit", sa.Float(), nullable=True),
        sa.Column("is_leasable", sa.Boolean(), nullable=False),
        sa.Column("fine_per_day", sa.Float(), nullable=True),
        sa.Column("attributes_json", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["type_id"], ["resource_types.type_id"]),
        sa.PrimaryKeyConstraint("resource_id"),
    )
    op.create_index(op.f("ix_resources_resource_id"), "resources", ["resource_id"], unique=False)
    op.create_index(op.f("ix_resources_type_id"), "resources", ["type_id"], unique=False)

    op.create_table(
        "rules",
        sa.Column("rule_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("rule_key", sa.String(length=64), nullable=True),
        sa.Column("category", sa.String(length=128), nullable=False),
        sa.Column("rule_name", sa.String(length=255), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=64), nullable=False),
        sa.Column("type_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["type_id"], ["resource_types.type_id"]),
        sa.PrimaryKeyConstraint("rule_id"),
        sa.UniqueConstraint("rule_key"),
    )
    op.create_index(op.f("ix_rules_rule_id"), "rules", ["rule_id"], unique=False)
    op.create_index(op.f("ix_rules_type_id"), "rules", ["type_id"], unique=False)

    op.create_table(
        "requests",
        sa.Column("request_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("resource_id", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("loan_days", sa.Integer(), nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("requested_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("approved_by", sa.Integer(), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("returned_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["approved_by"], ["users.user_id"]),
        sa.ForeignKeyConstraint(["resource_id"], ["resources.resource_id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("request_id"),
    )
    op.create_index(op.f("ix_requests_request_id"), "requests", ["request_id"], unique=False)
    op.create_index(op.f("ix_requests_resource_id"), "requests", ["resource_id"], unique=False)
    op.create_index(op.f("ix_requests_user_id"), "requests", ["user_id"], unique=False)

    op.create_table(
        "transactions",
        sa.Column("transaction_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=False),
        sa.Column("issue_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("return_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("fine_amount", sa.Float(), nullable=False),
        sa.Column("deposit_paid", sa.Float(), nullable=False),
        sa.Column("deposit_refunded", sa.Float(), nullable=False),
        sa.Column("damage_fine", sa.Float(), nullable=False),
        sa.Column("transaction_status", sa.String(length=32), nullable=False),
        sa.Column("reminder_email_sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["request_id"], ["requests.request_id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("transaction_id"),
        sa.UniqueConstraint("request_id"),
    )
    op.create_index(op.f("ix_transactions_request_id"), "transactions", ["request_id"], unique=False)
    op.create_index(op.f("ix_transactions_transaction_id"), "transactions", ["transaction_id"], unique=False)
    op.create_index(op.f("ix_transactions_user_id"), "transactions", ["user_id"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("notification_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["request_id"], ["requests.request_id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("notification_id"),
    )
    op.create_index(op.f("ix_notifications_notification_id"), "notifications", ["notification_id"], unique=False)
    op.create_index(op.f("ix_notifications_request_id"), "notifications", ["request_id"], unique=False)
    op.create_index(op.f("ix_notifications_user_id"), "notifications", ["user_id"], unique=False)

    op.create_table(
        "defaulters",
        sa.Column("defaulter_id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("transaction_id", sa.Integer(), nullable=False),
        sa.Column("request_id", sa.Integer(), nullable=True),
        sa.Column("overdue_days", sa.Integer(), nullable=False),
        sa.Column("fine_amount", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("marked_date", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.Column("cleared_date", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["request_id"], ["requests.request_id"]),
        sa.ForeignKeyConstraint(["transaction_id"], ["transactions.transaction_id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("defaulter_id"),
    )
    op.create_index(op.f("ix_defaulters_defaulter_id"), "defaulters", ["defaulter_id"], unique=False)
    op.create_index(op.f("ix_defaulters_request_id"), "defaulters", ["request_id"], unique=False)
    op.create_index(op.f("ix_defaulters_transaction_id"), "defaulters", ["transaction_id"], unique=False)
    op.create_index(op.f("ix_defaulters_user_id"), "defaulters", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_table("defaulters")
    op.drop_table("notifications")
    op.drop_table("transactions")
    op.drop_table("requests")
    op.drop_table("rules")
    op.drop_table("resources")
    op.drop_table("users")
    op.drop_table("resource_types")
    op.drop_table("roles")
