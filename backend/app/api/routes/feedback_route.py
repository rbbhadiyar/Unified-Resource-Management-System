from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.deps.auth import get_current_user, require_admin
from app.models import FeedbackEntry, LeaseTransaction, LoanRequest, Resource, User
from app.schemas.feedback_schema import FeedbackCreate, FeedbackOut, FeedbackScope

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("/eligible")
def list_eligible_returns(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    """Returned loans the current user can still rate (resource scope)."""
    role = user.role_obj.role_name if user.role_obj else "user"
    if role == "admin":
        return []

    rated_ids = [
        r
        for (r,) in db.query(FeedbackEntry.request_id)
        .filter(
            FeedbackEntry.user_id == user.user_id,
            FeedbackEntry.scope == "resource",
            FeedbackEntry.request_id.isnot(None),
        )
        .all()
    ]
    q = (
        db.query(LeaseTransaction)
        .options(joinedload(LeaseTransaction.loan_request).joinedload(LoanRequest.resource))
        .join(LoanRequest, LoanRequest.request_id == LeaseTransaction.request_id)
        .join(Resource, Resource.resource_id == LoanRequest.resource_id)
        .filter(
            LeaseTransaction.user_id == user.user_id,
            LeaseTransaction.transaction_status == "returned",
        )
    )
    if rated_ids:
        q = q.filter(~LoanRequest.request_id.in_(rated_ids))
    rows = q.all()
    out = []
    for t in rows:
        req = t.loan_request
        res = req.resource if req else None
        out.append(
            {
                "request_id": t.request_id,
                "resource_name": res.resource_name if res else None,
                "returned_at": t.return_date.isoformat() if t.return_date else None,
            }
        )
    return out


@router.get("/mine", response_model=list[FeedbackOut])
def my_feedback(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(FeedbackEntry)
        .options(joinedload(FeedbackEntry.user), joinedload(FeedbackEntry.loan_request).joinedload(LoanRequest.resource))
        .filter(FeedbackEntry.user_id == user.user_id)
        .order_by(FeedbackEntry.created_at.desc())
        .all()
    )
    return [_serialize_out(db, f) for f in rows]


@router.get("/admin", response_model=list[FeedbackOut])
def admin_list_feedback(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = (
        db.query(FeedbackEntry)
        .options(joinedload(FeedbackEntry.user), joinedload(FeedbackEntry.loan_request).joinedload(LoanRequest.resource))
        .order_by(FeedbackEntry.created_at.desc())
        .all()
    )
    return [_serialize_out(db, f) for f in rows]


def _serialize_out(_db: Session, f: FeedbackEntry) -> FeedbackOut:
    u = f.user
    res_name = None
    if f.loan_request and f.loan_request.resource:
        res_name = f.loan_request.resource.resource_name
    return FeedbackOut(
        feedback_id=f.feedback_id,
        user_id=f.user_id,
        user_name=u.name if u else None,
        scope=f.scope,
        request_id=f.request_id,
        resource_name=res_name,
        rating=f.rating,
        category=f.category,
        comment=f.comment,
        created_at=f.created_at.isoformat() if f.created_at else None,
    )


@router.post("/", response_model=FeedbackOut)
def submit_feedback(
    body: FeedbackCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    role = user.role_obj.role_name if user.role_obj else "user"
    if role == "admin":
        raise HTTPException(status_code=400, detail="Admins do not submit borrower feedback here")

    if body.scope == FeedbackScope.resource:
        if body.request_id is None:
            raise HTTPException(status_code=400, detail="request_id required for resource feedback")
        txn = (
            db.query(LeaseTransaction)
            .filter(
                LeaseTransaction.request_id == body.request_id,
                LeaseTransaction.user_id == user.user_id,
                LeaseTransaction.transaction_status == "returned",
            )
            .first()
        )
        if not txn:
            raise HTTPException(status_code=400, detail="No returned loan found for this request")
        exists = (
            db.query(FeedbackEntry)
            .filter(
                FeedbackEntry.user_id == user.user_id,
                FeedbackEntry.request_id == body.request_id,
                FeedbackEntry.scope == "resource",
            )
            .first()
        )
        if exists:
            raise HTTPException(status_code=400, detail="Feedback already submitted for this resource")
        row = FeedbackEntry(
            user_id=user.user_id,
            scope="resource",
            request_id=body.request_id,
            rating=body.rating,
            category=body.category,
            comment=body.comment,
        )
    else:
        row = FeedbackEntry(
            user_id=user.user_id,
            scope="overall",
            request_id=None,
            rating=body.rating,
            category=body.category,
            comment=body.comment,
        )
    db.add(row)
    db.commit()
    db.refresh(row)
    row = (
        db.query(FeedbackEntry)
        .options(joinedload(FeedbackEntry.user), joinedload(FeedbackEntry.loan_request).joinedload(LoanRequest.resource))
        .filter(FeedbackEntry.feedback_id == row.feedback_id)
        .first()
    )
    return _serialize_out(db, row)
