import logging
import smtplib
from email.mime.text import MIMEText

from app.config import SMTP_FROM, SMTP_HOST, SMTP_PASSWORD, SMTP_PORT, SMTP_USE_TLS, SMTP_USER

logger = logging.getLogger(__name__)


def send_plain_email(to_addr: str, subject: str, body: str) -> bool:
    """Send plain text email. Returns False when SMTP is not configured."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return False
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = subject
    msg["From"] = SMTP_FROM or SMTP_USER
    msg["To"] = to_addr
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30) as server:
            if SMTP_USE_TLS:
                server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_FROM or SMTP_USER, [to_addr], msg.as_string())
        return True
    except Exception:
        logger.exception("SMTP send failed to %s", to_addr)
        return False
