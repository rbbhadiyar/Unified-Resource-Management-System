from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class LeaseTransaction(Base):
    __tablename__ = "transactions"

    transaction_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    request_id = Column(Integer, ForeignKey("requests.request_id"), nullable=False, unique=True, index=True)

    issue_date = Column(DateTime(timezone=True), nullable=True)
    due_date = Column(DateTime(timezone=True), nullable=True)
    return_date = Column(DateTime(timezone=True), nullable=True)
    return_requested_at = Column(DateTime(timezone=True), nullable=True)

    fine_amount = Column(Float, nullable=False, default=0.0)
    deposit_paid = Column(Float, nullable=False, default=0.0)
    deposit_refunded = Column(Float, nullable=False, default=0.0)
    damage_fine = Column(Float, nullable=False, default=0.0)

    transaction_status = Column(
        String(32),
        nullable=False,
        default="active",
    )  # active | returned | overdue | return_pending

    reminder_email_sent_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="lease_transactions")
    loan_request = relationship("LoanRequest", back_populates="lease_transaction")
    defaulter_entries = relationship("Defaulter", back_populates="lease_transaction")
