import logging

from app.config import SMTP_FROM, SMTP_PASSWORD

logger = logging.getLogger(__name__)


def send_plain_email(to_addr: str, subject: str, body: str) -> bool:
    """Send email via SendGrid HTTP API. Returns False when not configured."""
    if not SMTP_PASSWORD:
        return False
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail
        message = Mail(
            from_email=SMTP_FROM,
            to_emails=to_addr,
            subject=subject,
            plain_text_content=body,
        )
        sg = SendGridAPIClient(SMTP_PASSWORD)
        response = sg.send(message)
        return response.status_code in (200, 202)
    except Exception:
        logger.exception("SendGrid send failed to %s", to_addr)
        return False
