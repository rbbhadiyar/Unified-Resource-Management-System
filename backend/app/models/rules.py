from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class Rule(Base):
    __tablename__ = "rules"

    rule_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    rule_key = Column(String(64), unique=True, nullable=True, index=True)
    category = Column(String(128), nullable=False)
    rule_name = Column(String(255), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String(64), nullable=False)
    type_id = Column(Integer, ForeignKey("resource_types.type_id"), nullable=True, index=True)

    resource_type = relationship("ResourceType", back_populates="rules")
