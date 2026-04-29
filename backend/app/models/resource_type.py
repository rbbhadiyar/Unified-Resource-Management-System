from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base


class ResourceType(Base):
    __tablename__ = "resource_types"

    type_id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    type_name = Column(String(128), unique=True, nullable=False)
    description = Column(Text, nullable=True)

    resources = relationship("Resource", back_populates="resource_type")
    rules = relationship("Rule", back_populates="resource_type")
