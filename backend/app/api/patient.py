from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_patient
from app.db import get_db
from app.models.patient_profile import PatientProfile
from app.models.user import User, UserRole
from app.schemas.patient import LinkDoctorRequest, PatientProfileOut, PatientProfileUpdate

router = APIRouter(prefix='/api/v1/patient', tags=['patient'])


@router.get('/profile', response_model=PatientProfileOut)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
) -> PatientProfileOut:
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Profile not found')

    doctor_name = None
    if profile.doctor_id is not None:
        doctor = db.query(User).filter(User.id == profile.doctor_id).first()
        if doctor is not None:
            doctor_name = doctor.full_name

    return PatientProfileOut(
        birth_date=profile.birth_date,
        sex=profile.sex,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        conditions=profile.conditions,
        allergies=profile.allergies,
        doctor_name=doctor_name,
    )


@router.put('/profile', response_model=PatientProfileOut)
def update_profile(
    payload: PatientProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
) -> PatientProfileOut:
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Profile not found')

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)

    doctor_name = None
    if profile.doctor_id is not None:
        doctor = db.query(User).filter(User.id == profile.doctor_id).first()
        if doctor is not None:
            doctor_name = doctor.full_name

    return PatientProfileOut(
        birth_date=profile.birth_date,
        sex=profile.sex,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        conditions=profile.conditions,
        allergies=profile.allergies,
        doctor_name=doctor_name,
    )


@router.post('/link-doctor')
def link_doctor(
    payload: LinkDoctorRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
) -> dict[str, str]:
    doctor = db.query(User).filter(
        User.invite_code == payload.doctor_code,
        User.role == UserRole.DOCTOR,
    ).first()
    if doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Doctor not found')

    profile = db.query(PatientProfile).filter(PatientProfile.user_id == current_user.id).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Profile not found')

    profile.doctor_id = doctor.id
    db.commit()

    return {'detail': f'Linked to doctor {doctor.full_name}'}
