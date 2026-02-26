from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from app.api import deps
from app.core import security
from app.schemas.user import Token, UserCreate
from app.models.user import User

router = APIRouter()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(deps.get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalars().first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=Token)
async def register(user: UserCreate, db: Session = Depends(deps.get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    hashed_password = security.get_password_hash(user.password)
    new_user = User(email=user.email, hashed_password=hashed_password, role=user.role, full_name=user.full_name)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    access_token = security.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}
