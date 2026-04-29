from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Defaulter, LeaseTransaction, LoanRequest, Resource


def active_loan_count_for_type(db: Session, user_id: int, type_id: int) -> int:
    return (
        db.query(LoanRequest)
        .join(LeaseTransaction, LoanRequest.request_id == LeaseTransaction.request_id)
        .join(Resource, LoanRequest.resource_id == Resource.resource_id)
        .filter(
            LoanRequest.user_id == user_id,
            LeaseTransaction.transaction_status == "active",
            Resource.type_id == type_id,
        )
        .count()
    )


def total_unpaid_defaulter_fines(db: Session, user_id: int) -> float:
    q = (
        db.query(func.coalesce(func.sum(Defaulter.fine_amount), 0.0))
        .filter(
            Defaulter.user_id == user_id,
            Defaulter.status == "active",
        )
        .scalar()
    )
    return float(q or 0.0)
