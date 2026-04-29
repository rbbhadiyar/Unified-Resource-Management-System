from pydantic import BaseModel


class RuleOut(BaseModel):
    rule_id: int
    rule_key: str | None
    category: str
    rule_name: str
    value: float
    unit: str
    type_id: int | None

    class Config:
        from_attributes = True


class RuleUpdate(BaseModel):
    value: float
