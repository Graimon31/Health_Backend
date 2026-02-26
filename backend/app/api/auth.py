from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_admin
from app.db import get_db
from app.models.user import User, UserRole
from app.schemas.auth import AuthResponse, LoginRequest, RefreshRequest, RefreshResponse, RegisterDoctorRequest, UserOut
from app.security import create_token, decode_token, hash_password, verify_password

router = APIRouter(prefix='/api/v1/auth', tags=['auth'])


@router.post('/login', response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid email or password')

    access_token = create_token(str(user.id), 30, 'access')
    refresh_token = create_token(str(user.id), 60 * 24 * 7, 'refresh')

    return AuthResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut(id=user.id, role=user.role, full_name=user.full_name),
    )


@router.post('/refresh', response_model=RefreshResponse)
def refresh(payload: RefreshRequest) -> RefreshResponse:
    user_id = decode_token(payload.refresh_token, expected_type='refresh')
    access_token = create_token(user_id, 30, 'access')
    return RefreshResponse(access_token=access_token)


@router.post('/register-doctor', response_model=UserOut)
def register_doctor(
    payload: RegisterDoctorRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> UserOut:
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Email already exists')

    user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        role=UserRole.DOCTOR,
        full_name=payload.full_name,
        phone=payload.phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return UserOut(id=user.id, role=user.role, full_name=user.full_name)
