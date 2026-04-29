import hashlib
import logging
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config import FRONTEND_BASE_URL
from app.db.database import get_db
from app.deps.auth import get_current_user
from app.models import Role, User
from app.schemas.auth import (
    ForgotPasswordRequest,
    GoogleAuthRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserOut,
    UserUpdate,
)
from app.utils.google_auth import verify_google_id_token
from app.utils.jwt import create_access_token
from app.utils.mail import send_plain_email
from app.utils.password import hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger(__name__)


def _user_out(user: User) -> UserOut:
    role_name = user.role_obj.role_name if user.role_obj else "user"
    return UserOut(
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        department=user.department,
        year_of_study=user.year_of_study,
        roll_number=user.roll_number,
        role=role_name,
        is_blocked=user.is_blocked,
    )


def _token_for_user(user: User) -> TokenResponse:
    role_name = user.role_obj.role_name if user.role_obj else "user"
    token = create_access_token({"user_id": user.user_id, "role": role_name})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.user_id,
        name=user.name,
        email=user.email,
        role=role_name,
    )


@router.post("/register", response_model=TokenResponse)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user_role = db.query(Role).filter(Role.role_name == "user").first()
    if not user_role:
        raise HTTPException(status_code=500, detail="Roles not seeded — run python -m app.db.seed")
    user = User(
        name=body.name,
        email=body.email,
        password=hash_password(body.password),
        phone=body.phone,
        department=body.department,
        year_of_study=body.year_of_study,
        roll_number=body.roll_number,
        role_id=user_role.role_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _token_for_user(user)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account blocked")
    return _token_for_user(user)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return _user_out(user)


@router.patch("/me", response_model=UserOut)
def update_me(
    body: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    data = body.model_dump(exclude_unset=True)
    if "name" in data and data["name"] is not None:
        data["name"] = data["name"].strip() or user.name
    for k, v in data.items():
        setattr(user, k, v)
    db.commit()
    db.refresh(user)
    return _user_out(user)


@router.get("/user", response_model=UserOut)
def user_alias(user: User = Depends(get_current_user)):
    return _user_out(user)


@router.post("/google", response_model=TokenResponse)
def google_auth(body: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        data = verify_google_id_token(body.id_token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=401, detail="Google token verification failed") from e

    sub = data.get("sub")
    email = data.get("email")
    name = data.get("name") or (email or "User").split("@")[0]
    if not email or not sub:
        raise HTTPException(status_code=400, detail="Invalid Google profile")

    user = db.query(User).filter((User.google_id == sub) | (User.email == email)).first()
    user_role = db.query(Role).filter(Role.role_name == "user").first()
    if not user_role:
        raise HTTPException(status_code=500, detail="Roles not seeded")

    if user:
        user.google_id = sub
        user.name = name
        if not user.email_verified:
            user.email_verified = True
        db.commit()
        db.refresh(user)
    else:
        user = User(
            name=name,
            email=email,
            google_id=sub,
            password=None,
            email_verified=True,
            role_id=user_role.role_id,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if user.is_blocked:
        raise HTTPException(status_code=403, detail="Account blocked")
    return _token_for_user(user)


def _hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    generic = {"detail": "If an account exists for this email, reset instructions have been sent."}
    # keep response generic to avoid account enumeration
    if not user or not user.password:
        return generic

    token = secrets.token_urlsafe(32)
    user.password_reset_token_hash = _hash_reset_token(token)
    user.password_reset_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    db.commit()

    reset_link = f"{FRONTEND_BASE_URL}/reset-password?token={token}"
    body_text = (
        f"Hello {user.name},\n\n"
        "You requested a password reset for URMS.\n"
        f"Use this link within 1 hour:\n{reset_link}\n\n"
        "If you didn't request this, you can ignore this email.\n\n"
        "— URMS"
    )
    sent = send_plain_email(user.email, "URMS — password reset", body_text)
    if not sent:
        logger.info("Password reset (SMTP off). Link for %s: %s", user.email, reset_link)
    return generic


@router.post("/reset-password")
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    h = _hash_reset_token(body.token)
    user = (
        db.query(User)
        .filter(User.password_reset_token_hash == h)
        .filter(User.password_reset_token_expires_at.isnot(None))
        .filter(User.password_reset_token_expires_at > datetime.now(timezone.utc))
        .first()
    )
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    user.password = hash_password(body.new_password)
    user.password_reset_token_hash = None
    user.password_reset_token_expires_at = None
    db.commit()
    return {"detail": "Password updated. You can now sign in with your new password."}


@router.post("/logout")
def logout():
    return {"detail": "Logged out on client — discard token"}
