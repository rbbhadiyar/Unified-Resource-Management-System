from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Defaulter(Base):
    __tablename__ = "defaulters"

    defaulter_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.transaction_id"), nullable=False, index=True)
    request_id = Column(Integer, ForeignKey("requests.request_id"), nullable=True, index=True)

    overdue_days = Column(Integer, default=0, nullable=False)
    fine_amount = Column(Float, default=0.0, nullable=False)
    status = Column(String(32), nullable=False, default="active")  # active | cleared

    marked_date = Column(DateTime(timezone=True), server_default=func.now())
    cleared_date = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="defaulter_entries")
    lease_transaction = relationship("LeaseTransaction", back_populates="defaulter_entries")
