from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=True)
    phone = Column(String(32), nullable=True)
    department = Column(String(128), nullable=True)
    year_of_study = Column(String(64), nullable=True)
    roll_number = Column(String(64), nullable=True)
    password_reset_token_hash = Column(String(128), nullable=True)
    password_reset_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    google_id = Column(String(255), nullable=True, unique=True, index=True)
    email_verified = Column(Boolean, default=False, nullable=False)
    is_blocked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False, default=2)
    role_obj = relationship("Role", back_populates="users")

    loan_requests = relationship(
        "LoanRequest",
        back_populates="user",
        foreign_keys="LoanRequest.user_id",
    )
    lease_transactions = relationship("LeaseTransaction", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    defaulter_entries = relationship("Defaulter", back_populates="user")
    feedback_entries = relationship("FeedbackEntry", back_populates="user")
