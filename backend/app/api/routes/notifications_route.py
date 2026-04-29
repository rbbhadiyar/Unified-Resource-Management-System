from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.deps.auth import get_current_user
from app.models import Notification, User

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/")
def list_notifications(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(Notification)
        .filter(Notification.user_id == user.user_id)
        .order_by(Notification.created_at.desc())
        .all()
    )
    return [
        {
            "notification_id": n.notification_id,
            "title": n.title,
            "message": n.message,
            "is_read": n.is_read,
            "request_id": n.request_id,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in rows
    ]


@router.post("/{notification_id}/read")
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    n = (
        db.query(Notification)
        .filter(
            Notification.notification_id == notification_id,
            Notification.user_id == user.user_id,
        )
        .first()
    )
    if not n:
        return {"detail": "not found"}
    n.is_read = True
    db.commit()
    return {"detail": "ok"}
