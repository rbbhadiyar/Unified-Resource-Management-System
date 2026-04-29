from sqlalchemy.orm import Session

from app.models import Resource, ResourceType, Rule


def rule_value(db: Session, rule_key: str) -> float | None:
    r = db.query(Rule).filter(Rule.rule_key == rule_key).first()
    return float(r.value) if r else None


def loan_days_for_resource(db: Session, resource: Resource) -> int:
    r = (
        db.query(Rule)
        .filter(
            Rule.type_id == resource.type_id,
            Rule.category == "Loan Period",
        )
        .first()
    )
    if r:
        return int(r.value)
    return 7


def fine_per_day_for_resource(db: Session, resource: Resource) -> float:
    r = (
        db.query(Rule)
        .filter(
            Rule.type_id == resource.type_id,
            Rule.category == "Fine Policy",
        )
        .first()
    )
    if r:
        return float(r.value)
    if resource.fine_per_day is not None:
        return float(resource.fine_per_day)
    return 10.0


def fine_cap(db: Session) -> float:
    v = rule_value(db, "fp4")
    return float(v) if v is not None else 500.0


def grace_days(db: Session) -> float:
    v = rule_value(db, "fp5")
    return float(v) if v is not None else 0.0


def max_items_for_type(db: Session, type_id: int) -> int:
    r = (
        db.query(Rule)
        .filter(
            Rule.type_id == type_id,
            Rule.category == "Borrowing Limits",
        )
        .first()
    )
    if r:
        return int(r.value)
    return 99


def block_borrow_fine_threshold(db: Session) -> float:
    v = rule_value(db, "bl4")
    return float(v) if v is not None else 200.0


def type_name(db: Session, type_id: int) -> str:
    t = db.query(ResourceType).filter(ResourceType.type_id == type_id).first()
    return t.type_name if t else ""
