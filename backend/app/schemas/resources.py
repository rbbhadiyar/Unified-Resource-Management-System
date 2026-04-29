from typing import Any

from pydantic import BaseModel, Field


class ResourceCreate(BaseModel):
    resource_name: str
    description: str | None = None
    type_id: int
    total_quantity: int = Field(ge=0)
    lease_per_day: float | None = None
    security_deposit: float | None = 0.0
    is_leasable: bool = True
    fine_per_day: float | None = None
    attributes_json: dict[str, Any] | None = None


class ResourceUpdate(BaseModel):
    resource_name: str | None = None
    description: str | None = None
    type_id: int | None = None
    total_quantity: int | None = Field(default=None, ge=0)
    lease_per_day: float | None = None
    security_deposit: float | None = None
    is_leasable: bool | None = None
    fine_per_day: float | None = None
    attributes_json: dict[str, Any] | None = None


class ResourceOut(BaseModel):
    resource_id: int
    resource_name: str
    description: str | None
    type_id: int
    type_name: str | None = None
    total_quantity: int
    available_quantity: int
    lease_per_day: float | None
    security_deposit: float | None
    is_leasable: bool
    fine_per_day: float | None
    attributes_json: dict | None = None

    class Config:
        from_attributes = True
