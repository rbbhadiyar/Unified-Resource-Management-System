from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str | None = None
    department: str | None = None
    year_of_study: str | None = None
    roll_number: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    name: str
    email: str
    role: str


class UserOut(BaseModel):
    user_id: int
    name: str
    email: str
    phone: str | None
    department: str | None
    year_of_study: str | None
    roll_number: str | None
    role: str
    is_blocked: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    department: str | None = None
    year_of_study: str | None = None
    roll_number: str | None = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10)
    new_password: str = Field(min_length=6)
