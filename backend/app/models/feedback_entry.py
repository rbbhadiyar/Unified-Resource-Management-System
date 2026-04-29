from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class FeedbackEntry(Base):
    __tablename__ = "feedback_entries"

    feedback_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    scope = Column(String(16), nullable=False)  # resource | overall
    request_id = Column(Integer, ForeignKey("requests.request_id"), nullable=True)
    rating = Column(Integer, nullable=False)
    category = Column(String(64), nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="feedback_entries")
    loan_request = relationship("LoanRequest", foreign_keys=[request_id])
