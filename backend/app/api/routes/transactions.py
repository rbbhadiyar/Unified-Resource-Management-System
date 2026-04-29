from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Date, cast
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.deps.auth import get_current_user, require_admin
from app.models import Defaulter, LeaseTransaction, LoanRequest, Notification, Resource, User
from app.schemas.requests_schema import ReturnBody, ReturnIdsBody
from app.services import rules_lookup
from app.services.reminder_jobs import run_due_reminders
from app.utils.fine_calculator import compute_fine

router = APIRouter(prefix="/transactions", tags=["transactions"])


def _resolve_txn(db: Session, body: ReturnIdsBody | ReturnBody) -> LeaseTransaction | None:
    if body.transaction_id:
        return (
            db.query(LeaseTransaction)
            .options(
                joinedload(LeaseTransaction.loan_request).joinedload(LoanRequest.resource).joinedload(
                    Resource.resource_type
                ),
                joinedload(LeaseTransaction.loan_request).joinedload(LoanRequest.user),
            )
            .filter(LeaseTransaction.transaction_id == body.transaction_id)
            .first()
        )
    if body.request_id:
        return (
            db.query(LeaseTransaction)
            .options(
                joinedload(LeaseTransaction.loan_request).joinedload(LoanRequest.resource).joinedload(
                    Resource.resource_type
                ),
                joinedload(LeaseTransaction.loan_request).joinedload(LoanRequest.user),
            )
            .filter(LeaseTransaction.request_id == body.request_id)
            .first()
        )
    return None


def _finalize_return(db: Session, txn: LeaseTransaction, body: ReturnBody) -> dict:
    req = txn.loan_request
    resource = req.resource if req else None
    now = datetime.now(timezone.utc)
    due = txn.due_date
    if due is None or not resource or not req:
        raise HTTPException(status_code=500, detail="Invalid transaction data")

    fine_per_day = rules_lookup.fine_per_day_for_resource(db, resource)
    cap = rules_lookup.fine_cap(db)
    grace = rules_lookup.grace_days(db)

    fine, effective_days = compute_fine(due, now, fine_per_day, grace, cap)
    damage = max(0.0, float(body.damage_fine or 0))
    total_fine = round(fine + damage, 2)

    txn.return_date = now
    txn.fine_amount = total_fine
    txn.damage_fine = damage
    txn.transaction_status = "returned"
    txn.return_requested_at = None

    req.status = "completed"
    req.returned_at = now

    resource.available_quantity += 1

    if total_fine > 0 or effective_days > 0:
        db.add(
            Defaulter(
                user_id=txn.user_id,
                transaction_id=txn.transaction_id,
                request_id=req.request_id,
                overdue_days=effective_days,
                fine_amount=total_fine,
                status="active",
            )
        )

    db.add(
        Notification(
            user_id=txn.user_id,
            request_id=req.request_id,
            title="Resource returned",
            message=f'"{resource.resource_name}" returned. Fine due: ₹{total_fine:.2f}.',
            is_read=False,
        )
    )
    return {
        "transaction_id": txn.transaction_id,
        "fine_amount": total_fine,
        "overdue_days_after_grace": effective_days,
    }


@router.get("/")
def list_transactions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    role = user.role_obj.role_name if user.role_obj else "user"
    q = (
        db.query(LeaseTransaction)
        .options(
            joinedload(LeaseTransaction.loan_request)
            .joinedload(LoanRequest.resource)
            .joinedload(Resource.resource_type),
        )
        .order_by(LeaseTransaction.created_at.desc())
    )
    if role != "admin":
        q = q.filter(LeaseTransaction.user_id == user.user_id)
    rows = q.all()
    out = []
    for t in rows:
        req = t.loan_request
        res = req.resource if req else None
        out.append(
            {
                "transaction_id": t.transaction_id,
                "request_id": t.request_id,
                "user_id": t.user_id,
                "issue_date": t.issue_date.isoformat() if t.issue_date else None,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "return_date": t.return_date.isoformat() if t.return_date else None,
                "return_requested_at": t.return_requested_at.isoformat() if t.return_requested_at else None,
                "fine_amount": t.fine_amount,
                "transaction_status": t.transaction_status,
                "resource_name": res.resource_name if res else None,
                "resource_type": res.resource_type.type_name if res and res.resource_type else None,
            }
        )
    return out


@router.get("/due-soon")
def due_soon(
    days: int = Query(3, ge=1, le=30),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    role = user.role_obj.role_name if user.role_obj else "user"
    limit_day = date.today() + timedelta(days=days)
    q = (
        db.query(LeaseTransaction)
        .options(
            joinedload(LeaseTransaction.loan_request)
            .joinedload(LoanRequest.resource)
            .joinedload(Resource.resource_type),
        )
        .filter(LeaseTransaction.transaction_status == "active")
        .filter(LeaseTransaction.due_date.isnot(None))
        .filter(cast(LeaseTransaction.due_date, Date) <= limit_day)
        .order_by(LeaseTransaction.due_date.asc())
    )
    if role != "admin":
        q = q.filter(LeaseTransaction.user_id == user.user_id)
    rows = q.all()
    today = date.today()
    out = []
    for t in rows:
        req = t.loan_request
        res = req.resource if req else None
        due_day = t.due_date.astimezone(timezone.utc).date() if t.due_date else None
        out.append(
            {
                "transaction_id": t.transaction_id,
                "request_id": t.request_id,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "days_until_due": (due_day - today).days if due_day else None,
                "resource_name": res.resource_name if res else None,
                "resource_type": res.resource_type.type_name if res and res.resource_type else None,
            }
        )
    return out


@router.post("/run-reminders")
def run_reminders(_: User = Depends(require_admin)):
    processed = run_due_reminders()
    return {"detail": "Reminder job completed.", "processed": processed}


@router.get("/pending-returns")
def list_pending_returns(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    rows = (
        db.query(LeaseTransaction)
        .filter(LeaseTransaction.transaction_status == "return_pending")
        .options(
            joinedload(LeaseTransaction.loan_request).joinedload(LoanRequest.resource),
            joinedload(LeaseTransaction.loan_request).joinedload(LoanRequest.user),
        )
        .order_by(LeaseTransaction.return_requested_at.desc(), LeaseTransaction.created_at.desc())
        .all()
    )
    out = []
    for t in rows:
        req = t.loan_request
        u = req.user if req else None
        res = req.resource if req else None
        out.append(
            {
                "transaction_id": t.transaction_id,
                "request_id": t.request_id,
                "user_id": t.user_id,
                "user_name": u.name if u else None,
                "user_email": u.email if u else None,
                "resource_name": res.resource_name if res else None,
                "due_date": t.due_date.isoformat() if t.due_date else None,
                "return_requested_at": t.return_requested_at.isoformat() if t.return_requested_at else None,
            }
        )
    return out


@router.post("/request-return")
def request_return(
    body: ReturnIdsBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    role = user.role_obj.role_name if user.role_obj else "user"
    if role == "admin":
        raise HTTPException(
            status_code=400,
            detail="Admins confirm returns from the Pending returns queue, not this endpoint.",
        )
    txn = _resolve_txn(db, body)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn.user_id != user.user_id:
        raise HTTPException(status_code=403, detail="Not allowed")
    if txn.transaction_status == "return_pending":
        raise HTTPException(status_code=400, detail="Return already pending admin verification")
    if txn.transaction_status != "active":
        raise HTTPException(status_code=400, detail="Transaction is not active")

    req = txn.loan_request
    resource = req.resource if req else None
    now = datetime.now(timezone.utc)
    txn.transaction_status = "return_pending"
    txn.return_requested_at = now
    title = "Return request submitted"
    msg = (
        f'Your return for "{resource.resource_name}" is pending staff verification.'
        if resource
        else "Your return is pending staff verification."
    )
    db.add(Notification(user_id=txn.user_id, request_id=req.request_id if req else None, title=title, message=msg, is_read=False))
    db.commit()
    return {"detail": "pending_admin", "transaction_id": txn.transaction_id}


@router.post("/confirm-return")
def confirm_return(
    body: ReturnBody,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    txn = _resolve_txn(db, body)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if txn.transaction_status != "return_pending":
        raise HTTPException(
            status_code=400,
            detail="Transaction has no pending return. User must request a return first.",
        )
    result = _finalize_return(db, txn, body)
    db.commit()
    return result


@router.get("/issue")
def issue_placeholder():
    return {"detail": "Issuance is created on request approval — use POST /requests/{id}/approve"}
