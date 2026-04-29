from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class LoanRequest(Base):
    __tablename__ = "requests"

    request_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    resource_id = Column(Integer, ForeignKey("resources.resource_id"), nullable=False, index=True)

    status = Column(
        String(32),
        nullable=False,
        default="pending",
    )  # pending | approved | rejected | cancelled | completed

    notes = Column(Text, nullable=True)
    loan_days = Column(Integer, nullable=False, default=7)

    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)

    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_at = Column(DateTime(timezone=True), nullable=True)
    approved_by = Column(Integer, ForeignKey("users.user_id"), nullable=True)

    due_date = Column(DateTime(timezone=True), nullable=True)
    returned_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="loan_requests",
    )
    approver = relationship("User", foreign_keys=[approved_by], viewonly=True)
    resource = relationship("Resource", back_populates="loan_requests")
    lease_transaction = relationship(
        "LeaseTransaction",
        back_populates="loan_request",
        uselist=False,
    )
    notifications = relationship("Notification", back_populates="loan_request")
