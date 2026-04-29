import logging
from datetime import date, datetime, timedelta, timezone

from sqlalchemy import Date, cast

from app.db.database import SessionLocal
from app.models import LeaseTransaction, Notification, User
from app.utils.mail import send_plain_email

logger = logging.getLogger(__name__)


def run_due_reminders() -> int:
    """Notify users whose due date is tomorrow (one day before deadline)."""
    db = SessionLocal()
    processed = 0
    try:
        tomorrow = date.today() + timedelta(days=1)
        rows = (
            db.query(LeaseTransaction)
            .filter(LeaseTransaction.transaction_status == "active")
            .filter(LeaseTransaction.reminder_email_sent_at.is_(None))
            .filter(cast(LeaseTransaction.due_date, Date) == tomorrow)
            .all()
        )
        for txn in rows:
            user = db.query(User).filter(User.user_id == txn.user_id).first()
            if not user:
                continue
            msg_text = (
                f"Hello {user.name},\n\n"
                f"This is a reminder that your borrowed item is due on {tomorrow.isoformat()}. "
                "Please return it on time to avoid fines.\n\n"
                "— URMS"
            )
            emailed = False
            if user.email:
                try:
                    emailed = send_plain_email(
                        user.email,
                        "URMS — return reminder",
                        msg_text,
                    )
                except Exception as e:
                    logger.exception("Failed email to %s: %s", user.email, e)
            if not emailed:
                db.add(
                    Notification(
                        user_id=user.user_id,
                        request_id=txn.request_id,
                        title="Return reminder",
                        message=msg_text.replace("\n", " "),
                        is_read=False,
                    )
                )
            txn.reminder_email_sent_at = datetime.now(timezone.utc)
            db.commit()
            processed += 1
        return processed
    finally:
        db.close()
