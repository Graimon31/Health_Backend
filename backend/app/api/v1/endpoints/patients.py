from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.patient import Patient, Profile
from app.schemas.patient import Patient as PatientSchema, PatientCreate, PatientUpdate, Profile as ProfileSchema, ProfileUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[PatientSchema])
async def read_patients(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(Patient).offset(skip).limit(limit))
    patients = result.scalars().all()
    return patients

@router.post("/", response_model=PatientSchema)
async def create_patient(
    patient: PatientCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.external_user_id == patient.external_user_id))
    db_patient = result.scalars().first()
    if db_patient:
        raise HTTPException(status_code=400, detail="Patient already registered")

    new_patient = Patient(**patient.model_dump())
    # Create empty profile
    new_patient.profile = Profile()

    db.add(new_patient)
    await db.commit()
    await db.refresh(new_patient)
    return new_patient

@router.get("/{patient_id}", response_model=PatientSchema)
async def read_patient(
    patient_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    patient = result.scalars().first()
    if patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.patch("/{patient_id}", response_model=PatientSchema)
async def update_patient(
    patient_id: int,
    patient_update: PatientUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(Patient).where(Patient.id == patient_id))
    db_patient = result.scalars().first()
    if db_patient is None:
        raise HTTPException(status_code=404, detail="Patient not found")

    update_data = patient_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_patient, key, value)

    await db.commit()
    await db.refresh(db_patient)
    return db_patient

@router.get("/{patient_id}/profile", response_model=ProfileSchema)
async def read_patient_profile(
    patient_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(Profile).where(Profile.patient_id == patient_id))
    profile = result.scalars().first()
    if profile is None:
         # If profile doesn't exist, maybe create it or return 404.
         # In create_patient we created one, but good to be safe.
         raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.patch("/{patient_id}/profile", response_model=ProfileSchema)
async def update_patient_profile(
    patient_id: int,
    profile_update: ProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(Profile).where(Profile.patient_id == patient_id))
    db_profile = result.scalars().first()
    if db_profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    update_data = profile_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_profile, key, value)

    await db.commit()
    await db.refresh(db_profile)
    return db_profile
