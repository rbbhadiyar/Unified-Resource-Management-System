"""Seed core lookup data and optional demo entities.

Usage:
  python -m app.db.seed
  python -m app.db.seed --demo --count 12
"""

import argparse
import os
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.models import LeaseTransaction, LoanRequest, Resource, ResourceType, Role, Rule, User
from app.utils.password import hash_password


def _type_id(session: Session, name: str) -> int | None:
    t = session.query(ResourceType).filter(ResourceType.type_name == name).first()
    return t.type_id if t else None


def seed(session: Session) -> None:
    if session.query(Role).count() == 0:
        session.add_all(
            [
                Role(role_name="admin", description="Administrator"),
                Role(role_name="user", description="Regular user"),
            ]
        )
        session.flush()

    if session.query(ResourceType).count() == 0:
        session.add_all(
            [
                ResourceType(type_name="Hardware", description="Hardware assets"),
                ResourceType(type_name="Software", description="Software licenses"),
                ResourceType(type_name="Book", description="Books"),
            ]
        )
        session.flush()

    if session.query(Rule).count() == 0:
        hw = _type_id(session, "Hardware")
        sw = _type_id(session, "Software")
        bk = _type_id(session, "Book")

        rows = [
            ("lp1", "Loan Period", "Hardware loan duration", 7.0, "days", hw),
            ("lp2", "Loan Period", "Software license loan duration", 14.0, "days", sw),
            ("lp3", "Loan Period", "Book loan duration", 7.0, "days", bk),
            ("lp4", "Loan Period", "Maximum renewals allowed", 2.0, "times", None),
            ("fp1", "Fine Policy", "Fine per overdue day (Hardware)", 50.0, "INR/day", hw),
            ("fp2", "Fine Policy", "Fine per overdue day (Book)", 10.0, "INR/day", bk),
            ("fp3", "Fine Policy", "Fine per overdue day (Software)", 20.0, "INR/day", sw),
            ("fp4", "Fine Policy", "Maximum fine cap per resource", 500.0, "INR", None),
            ("fp5", "Fine Policy", "Grace period before fine applies", 1.0, "days", None),
            ("bl1", "Borrowing Limits", "Max hardware items per user", 2.0, "items", hw),
            ("bl2", "Borrowing Limits", "Max books per user", 3.0, "items", bk),
            ("bl3", "Borrowing Limits", "Max software licenses per user", 2.0, "items", sw),
            ("bl4", "Borrowing Limits", "Block borrowing if fine exceeds", 200.0, "INR", None),
            ("rr1", "Request Rules", "Request approval window", 48.0, "hours", None),
            ("rr2", "Request Rules", "Auto-reject if not approved within", 72.0, "hours", None),
            ("rr3", "Request Rules", "Advance booking allowed up to", 7.0, "days", None),
        ]
        for key, cat, name, val, unit, tid in rows:
            session.add(
                Rule(
                    rule_key=key,
                    category=cat,
                    rule_name=name,
                    value=val,
                    unit=unit,
                    type_id=tid,
                )
            )

    admin_email = os.getenv("SEED_ADMIN_EMAIL", "").strip()
    admin_password = os.getenv("SEED_ADMIN_PASSWORD", "").strip()
    if admin_email and admin_password:
        exists = session.query(User).filter(User.email == admin_email).first()
        if not exists:
            admin_role = session.query(Role).filter(Role.role_name == "admin").first()
            if admin_role:
                session.add(
                    User(
                        name="Admin",
                        email=admin_email,
                        password=hash_password(admin_password),
                        role_id=admin_role.role_id,
                        email_verified=True,
                    )
                )


def _make_demo_users(session: Session) -> list[User]:
    existing = session.query(User).filter(User.email.like("demo.user%")).all()
    if existing:
        return existing
    user_role = session.query(Role).filter(Role.role_name == "user").first()
    if not user_role:
        return []
    rows = []
    for i in range(1, 7):
        rows.append(
            User(
                name=f"Demo User {i}",
                email=f"demo.user{i}@example.com",
                password=hash_password("demo1234"),
                phone=f"+91 90000000{i:02d}",
                department="Demo Department",
                year_of_study="3rd Year",
                roll_number=f"DEMO-{1000+i}",
                role_id=user_role.role_id,
                email_verified=True,
            )
        )
    session.add_all(rows)
    session.flush()
    return rows


def _demo_assets_pool() -> list[tuple[str, str]]:
    return [
        ("Hardware", "Dell Latitude 5440"),
        ("Hardware", "HP ProBook 450"),
        ("Hardware", "MacBook Air M1"),
        ("Hardware", "Projector Epson X41"),
        ("Hardware", "Canon DSLR 1500D"),
        ("Software", "MATLAB Campus License"),
        ("Software", "MS Office 365 License"),
        ("Software", "AutoCAD Student License"),
        ("Software", "Adobe CC Lab License"),
        ("Book", "Operating System Concepts"),
        ("Book", "Computer Networks - Tanenbaum"),
        ("Book", "Database System Concepts"),
        ("Book", "Design Patterns (GoF)"),
        ("Book", "Clean Code"),
        ("Book", "Introduction to Algorithms"),
    ]


def _make_demo_assets(session: Session, count: int) -> list[Resource]:
    existing = session.query(Resource).filter(Resource.resource_name.like("DEMO:%")).all()
    if existing:
        return existing

    by_name = {x.type_name: x for x in session.query(ResourceType).all()}
    assets: list[Resource] = []
    for typ, name in _demo_assets_pool()[: max(1, min(count, 15))]:
        t = by_name.get(typ)
        if not t:
            continue
        total = random.randint(2, 8)
        available = max(1, total - random.randint(0, 2))
        assets.append(
            Resource(
                resource_name=f"DEMO: {name}",
                description=f"Demo seeded asset: {name}",
                type_id=t.type_id,
                total_quantity=total,
                available_quantity=available,
                lease_per_day=0.0,
                security_deposit=0.0,
                is_leasable=True,
                fine_per_day=10.0 if typ == "Book" else 25.0,
            )
        )
    session.add_all(assets)
    session.flush()
    return assets


def _make_demo_loans(session: Session, users: list[User], assets: list[Resource]) -> None:
    if not users or not assets:
        return
    existing = session.query(LoanRequest).filter(LoanRequest.notes.like("seed-demo%")).first()
    if existing:
        return

    now = datetime.now(timezone.utc)
    requests: list[LoanRequest] = []
    for i in range(min(8, len(assets))):
        u = users[i % len(users)]
        a = assets[i]
        req = LoanRequest(
            user_id=u.user_id,
            resource_id=a.resource_id,
            status="approved",
            notes="seed-demo approved loan",
            loan_days=7 + (i % 3),
            requested_at=now - timedelta(days=10 - i),
            approved_at=now - timedelta(days=9 - i),
            approved_by=None,
            due_date=now + timedelta(days=(1 if i % 2 == 0 else 3)),
        )
        requests.append(req)
    session.add_all(requests)
    session.flush()

    txs: list[LeaseTransaction] = []
    for req in requests:
        issue = req.approved_at or now
        txs.append(
            LeaseTransaction(
                user_id=req.user_id,
                request_id=req.request_id,
                issue_date=issue,
                due_date=req.due_date,
                fine_amount=0.0,
                deposit_paid=0.0,
                deposit_refunded=0.0,
                damage_fine=0.0,
                transaction_status="active",
            )
        )
    session.add_all(txs)


def seed_demo_data(session: Session, count: int = 12) -> None:
    users = _make_demo_users(session)
    assets = _make_demo_assets(session, count=count)
    _make_demo_loans(session, users, assets)


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed URMS lookup and optional demo data")
    parser.add_argument("--demo", action="store_true", help="Also seed demo users/assets/loans")
    parser.add_argument("--count", type=int, default=12, help="Number of demo assets (max 15)")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        seed(db)
        if args.demo:
            seed_demo_data(db, count=args.count)
        db.commit()
        print("Seed completed.")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    main()
