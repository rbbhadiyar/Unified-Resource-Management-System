from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps.auth import require_admin
from app.models import Defaulter, User
from app.models.role import Role

router = APIRouter(prefix="/users", tags=["users"])


class AssignRoleBody(BaseModel):
    role_name: str


@router.get("/")
def list_users(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    rows = db.query(User).all()
    out = []
    for u in rows:
        role_name = u.role_obj.role_name if u.role_obj else "user"
        out.append(
            {
                "user_id": u.user_id,
                "name": u.name,
                "email": u.email,
                "role": role_name,
                "is_blocked": u.is_blocked,
            }
        )
    return out


@router.get("/defaulters")
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


@router.post("/{user_id}/block")
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    u = db.query(User).filter(User.user_id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_blocked = True
    db.commit()
    return {"detail": "blocked", "user_id": user_id}


@router.post("/{user_id}/unblock")
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    u = db.query(User).filter(User.user_id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_blocked = False
    db.commit()
    return {"detail": "unblocked", "user_id": user_id}


@router.post("/{user_id}/assign-role")
def assign_role(
    user_id: int,
    body: AssignRoleBody,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    role_name = body.role_name
    u = db.query(User).filter(User.user_id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    role = db.query(Role).filter(Role.role_name == role_name).first()
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")
    u.role_id = role.role_id
    db.commit()
    return {"detail": "ok", "user_id": user_id, "role": role_name}
