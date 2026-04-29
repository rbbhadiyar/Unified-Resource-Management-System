from datetime import datetime, timezone
from typing import Tuple


def compute_fine(
    due_date: datetime,
    return_date: datetime,
    fine_per_day: float,
    grace_days: float,
    fine_cap: float,
) -> Tuple[float, int]:
    """Return (fine_amount, chargeable_overdue_days_after_grace)."""
    dd = due_date.astimezone(timezone.utc).date()
    rd = return_date.astimezone(timezone.utc).date()
    overdue_calendar = (rd - dd).days
    if overdue_calendar <= 0:
        return 0.0, 0

    g = int(grace_days)
    effective = max(0, overdue_calendar - g)
    if effective == 0:
        return 0.0, 0

    raw = effective * fine_per_day
    capped = min(raw, fine_cap) if fine_cap > 0 else raw
    return round(capped, 2), effective
