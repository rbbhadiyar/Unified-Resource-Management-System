from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps.auth import require_admin
from app.models import Rule, User
from app.schemas.rules_schema import RuleOut, RuleUpdate

router = APIRouter(prefix="/rules", tags=["rules"])


class RuleBulkItem(BaseModel):
    rule_id: int
    value: float


@router.get("/", response_model=list[RuleOut])
def list_rules(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.query(Rule).order_by(Rule.category, Rule.rule_id).all()
    return rows


@router.put("/{rule_id}", response_model=RuleOut)
def update_rule(
    rule_id: int,
    body: RuleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    r = db.query(Rule).filter(Rule.rule_id == rule_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Rule not found")
    r.value = body.value
    db.commit()
    db.refresh(r)
    return r


@router.put("/bulk")
def bulk_update_rules(
    items: list[RuleBulkItem],
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    for item in items:
        r = db.query(Rule).filter(Rule.rule_id == item.rule_id).first()
        if r:
            r.value = float(item.value)
    db.commit()
    return {"detail": "updated"}
