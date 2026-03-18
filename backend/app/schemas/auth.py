from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class RegisterDoctorRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    specialty: str | None = None
    phone: str | None = None


class UserOut(BaseModel):
    id: int
    role: UserRole
    full_name: str


class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserOut


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class RefreshResponse(BaseModel):
    access_token: str
