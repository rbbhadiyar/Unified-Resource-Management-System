from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.deps.auth import get_current_user, require_admin
from app.models import LeaseTransaction, LoanRequest, Notification, Resource, User
from app.schemas.requests_schema import CreateLoanRequestBody, LoanRequestOut
from app.services.borrow_checks import active_loan_count_for_type, total_unpaid_defaulter_fines
from app.services import rules_lookup

router = APIRouter(prefix="/requests", tags=["requests"])


def _serialize(req: LoanRequest) -> LoanRequestOut:
    uname = req.user.name if req.user else None
    rname = req.resource.resource_name if req.resource else None
    return LoanRequestOut(
        request_id=req.request_id,
        user_id=req.user_id,
        user_name=uname,
        resource_id=req.resource_id,
        resource_name=rname,
        status=req.status,
        notes=req.notes,
        loan_days=req.loan_days,
        start_date=req.start_date,
        end_date=req.end_date,
        requested_at=req.requested_at,
        approved_at=req.approved_at,
        approved_by=req.approved_by,
        due_date=req.due_date,
        returned_at=req.returned_at,
    )


@router.post("/create")
def create_request(
    body: CreateLoanRequestBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    resource = (
        db.query(Resource)
        .options(joinedload(Resource.resource_type))
        .filter(Resource.resource_id == body.resource_id)
        .first()
    )
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    if resource.available_quantity <= 0:
        raise HTTPException(status_code=400, detail="Resource unavailable")

    threshold = rules_lookup.block_borrow_fine_threshold(db)
    if total_unpaid_defaulter_fines(db, user.user_id) >= threshold:
        raise HTTPException(
            status_code=400,
            detail="Outstanding fines exceed borrowing limit — clear fines first",
        )

    max_items = rules_lookup.max_items_for_type(db, resource.type_id)
    if active_loan_count_for_type(db, user.user_id, resource.type_id) >= max_items:
        raise HTTPException(status_code=400, detail="Borrowing limit reached for this resource type")

    max_loan_days = rules_lookup.loan_days_for_resource(db, resource)
    if body.loan_days > max_loan_days:
        raise HTTPException(
            status_code=400,
            detail=f"Loan period cannot exceed {max_loan_days} days for this resource type",
        )

    req = LoanRequest(
        user_id=user.user_id,
        resource_id=body.resource_id,
        status="pending",
        notes=body.notes,
        loan_days=body.loan_days,
        start_date=body.start_date,
        end_date=body.end_date,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return {"msg": "request created", "request_id": req.request_id}


@router.get("/", response_model=list[LoanRequestOut])
def list_requests(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = (
        db.query(LoanRequest)
        .options(joinedload(LoanRequest.user), joinedload(LoanRequest.resource))
        .order_by(LoanRequest.requested_at.desc())
    )
    role = user.role_obj.role_name if user.role_obj else "user"
    if role != "admin":
        q = q.filter(LoanRequest.user_id == user.user_id)
    rows = q.all()
    return [_serialize(r) for r in rows]


@router.post("/{request_id}/approve")
def approve_request(
    request_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    req = (
        db.query(LoanRequest)
        .options(joinedload(LoanRequest.resource).joinedload(Resource.resource_type))
        .filter(LoanRequest.request_id == request_id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")

    resource = req.resource
    if resource.available_quantity <= 0:
        raise HTTPException(status_code=400, detail="No stock available")

    now = datetime.now(timezone.utc)
    due = now + timedelta(days=req.loan_days)

    req.status = "approved"
    req.approved_at = now
    req.approved_by = admin.user_id
    req.due_date = due

    resource.available_quantity -= 1

    txn = LeaseTransaction(
        user_id=req.user_id,
        request_id=req.request_id,
        issue_date=now,
        due_date=due,
        fine_amount=0.0,
        deposit_paid=resource.security_deposit or 0.0,
        deposit_refunded=0.0,
        damage_fine=0.0,
        transaction_status="active",
    )
    db.add(txn)

    note = Notification(
        user_id=req.user_id,
        request_id=req.request_id,
        title="Request approved",
        message=f'Your request for "{resource.resource_name}" was approved. Due: {due.date().isoformat()}.',
        is_read=False,
    )
    db.add(note)
    db.commit()
    return {"msg": "approved", "request_id": request_id, "due_date": due.isoformat()}


@router.post("/{request_id}/reject")
def reject_request(
    request_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    req = db.query(LoanRequest).filter(LoanRequest.request_id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request is not pending")
    req.status = "rejected"
    db.add(
        Notification(
            user_id=req.user_id,
            request_id=req.request_id,
            title="Request rejected",
            message="Your resource request was rejected.",
            is_read=False,
        )
    )
    db.commit()
    return {"msg": "rejected", "request_id": request_id}
