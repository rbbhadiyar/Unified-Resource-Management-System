from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps.auth import require_admin
from app.models import Defaulter, User

router = APIRouter(prefix="/defaulters", tags=["defaulters"])


@router.get("/")
def list_defaulters(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = (
        db.query(Defaulter)
        .filter(Defaulter.status == "active")
        .order_by(Defaulter.marked_date.desc())
        .all()
    )
    out = []
    for d in rows:
        u = d.user
        out.append(
            {
                "defaulter_id": d.defaulter_id,
                "user_id": d.user_id,
                "user_name": u.name if u else None,
                "email": u.email if u else None,
                "transaction_id": d.transaction_id,
                "request_id": d.request_id,
                "overdue_days": d.overdue_days,
                "fine_amount": d.fine_amount,
                "marked_date": d.marked_date.isoformat() if d.marked_date else None,
            }
        )
    return out


@router.post("/{defaulter_id}/clear")
def clear_defaulter(
    defaulter_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    d = db.query(Defaulter).filter(Defaulter.defaulter_id == defaulter_id).first()
    if not d:
        raise HTTPException(status_code=404, detail="Defaulter record not found")
    d.status = "cleared"
    d.cleared_date = datetime.now(timezone.utc)
    db.commit()
    return {"detail": "cleared", "defaulter_id": defaulter_id}
