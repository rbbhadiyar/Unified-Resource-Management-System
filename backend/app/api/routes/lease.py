from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.deps.auth import get_current_user
from app.models import Resource, User
from app.services import rules_lookup

router = APIRouter(prefix="/lease", tags=["lease"])


@router.get("/calculate")
def lease_calculate(
    resource_id: int = Query(...),
    loan_days: int = Query(..., ge=1, le=365),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    del user
    r = (
        db.query(Resource)
        .options(joinedload(Resource.resource_type))
        .filter(Resource.resource_id == resource_id)
        .first()
    )
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")

    now = datetime.now(timezone.utc)
    due = now + timedelta(days=loan_days)
    max_days = rules_lookup.loan_days_for_resource(db, r)
    if loan_days > max_days:
        raise HTTPException(
            status_code=400,
            detail=f"loan_days exceeds maximum {max_days} for this type",
        )

    return {
        "resource_id": resource_id,
        "expected_due_date": due.isoformat(),
        "security_deposit": r.security_deposit or 0.0,
        "lease_per_day": r.lease_per_day,
        "fine_per_day_estimate": rules_lookup.fine_per_day_for_resource(db, r),
        "fine_cap": rules_lookup.fine_cap(db),
        "grace_days": rules_lookup.grace_days(db),
    }
