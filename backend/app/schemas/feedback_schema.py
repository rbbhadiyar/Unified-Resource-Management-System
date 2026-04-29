from enum import Enum

from pydantic import BaseModel, Field


class FeedbackScope(str, Enum):
    resource = "resource"
    overall = "overall"


class FeedbackCreate(BaseModel):
    scope: FeedbackScope
    request_id: int | None = None
    rating: int = Field(ge=1, le=5)
    comment: str | None = None
    category: str | None = None


class FeedbackOut(BaseModel):
    feedback_id: int
    user_id: int
    user_name: str | None = None
    scope: str
    request_id: int | None = None
    resource_name: str | None = None
    rating: int
    category: str | None = None
    comment: str | None = None
    created_at: str | None = None

    class Config:
        from_attributes = True
