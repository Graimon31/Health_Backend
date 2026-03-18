from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import require_doctor
from app.db import get_db
from app.models.measurement import Measurement, MeasurementType
from app.models.patient_profile import PatientProfile
from app.models.user import User
from app.schemas.doctor import PatientListItem
from app.schemas.measurement import MeasurementOut
from app.schemas.patient import PatientProfileOut

router = APIRouter(prefix='/api/v1/doctor', tags=['doctor'])


@router.get('/patients', response_model=list[PatientListItem])
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
) -> list[PatientListItem]:
    profiles = db.query(PatientProfile).filter(PatientProfile.doctor_id == current_user.id).all()

    result = []
    for profile in profiles:
        patient = db.query(User).filter(User.id == profile.user_id).first()
        if patient is None:
            continue

        last_measurement = db.query(func.max(Measurement.measured_at)).filter(
            Measurement.patient_id == patient.id,
        ).scalar()

        result.append(PatientListItem(
            id=patient.id,
            full_name=patient.full_name,
            email=patient.email,
            last_measurement_at=last_measurement,
        ))

    return result


@router.get('/patients/{patient_id}/measurements', response_model=list[MeasurementOut])
def get_patient_measurements(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
    type: MeasurementType | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
) -> list[MeasurementOut]:
    profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == patient_id,
        PatientProfile.doctor_id == current_user.id,
    ).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Patient not assigned to you')

    query = db.query(Measurement).filter(Measurement.patient_id == patient_id)
    if type is not None:
        query = query.filter(Measurement.type == type)
    if date_from is not None:
        query = query.filter(Measurement.measured_at >= date_from)
    if date_to is not None:
        query = query.filter(Measurement.measured_at <= date_to)
    query = query.order_by(Measurement.measured_at.desc())
    measurements = query.offset(offset).limit(limit).all()
    return [MeasurementOut.model_validate(m) for m in measurements]


@router.get('/patients/{patient_id}/profile', response_model=PatientProfileOut)
def get_patient_profile(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor),
) -> PatientProfileOut:
    profile = db.query(PatientProfile).filter(
        PatientProfile.user_id == patient_id,
        PatientProfile.doctor_id == current_user.id,
    ).first()
    if profile is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Patient not assigned to you')

    return PatientProfileOut(
        birth_date=profile.birth_date,
        sex=profile.sex,
        height_cm=profile.height_cm,
        weight_kg=profile.weight_kg,
        conditions=profile.conditions,
        allergies=profile.allergies,
        doctor_name=current_user.full_name,
    )
