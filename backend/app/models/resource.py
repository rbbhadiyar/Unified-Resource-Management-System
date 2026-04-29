from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class Resource(Base):
    __tablename__ = "resources"

    resource_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    resource_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type_id = Column(Integer, ForeignKey("resource_types.type_id"), nullable=False, index=True)

    total_quantity = Column(Integer, nullable=False, default=0)
    available_quantity = Column(Integer, nullable=False, default=0)

    lease_per_day = Column(Float, nullable=True)
    security_deposit = Column(Float, nullable=True, default=0.0)
    is_leasable = Column(Boolean, default=True, nullable=False)
    fine_per_day = Column(Float, nullable=True)

    attributes_json = Column(JSONB, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    resource_type = relationship("ResourceType", back_populates="resources")
    loan_requests = relationship("LoanRequest", back_populates="resource")
