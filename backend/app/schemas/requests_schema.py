from datetime import datetime

from pydantic import BaseModel, Field


class CreateLoanRequestBody(BaseModel):
    resource_id: int
    loan_days: int = Field(ge=1, le=365)
    notes: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None


class LoanRequestOut(BaseModel):
    request_id: int
    user_id: int
    user_name: str | None = None
    resource_id: int
    resource_name: str | None = None
    status: str
    notes: str | None
    loan_days: int
    start_date: datetime | None
    end_date: datetime | None
    requested_at: datetime | None
    approved_at: datetime | None
    approved_by: int | None
    due_date: datetime | None
    returned_at: datetime | None

    class Config:
        from_attributes = True


class ReturnIdsBody(BaseModel):
    transaction_id: int | None = None
    request_id: int | None = None


class ReturnBody(BaseModel):
    transaction_id: int | None = None
    request_id: int | None = None
    damage_fine: float = 0.0
