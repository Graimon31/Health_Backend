from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import require_patient
from app.db import get_db
from app.models.measurement import Measurement, MeasurementType
from app.models.user import User
from app.schemas.measurement import MeasurementCreate, MeasurementOut

router = APIRouter(prefix='/api/v1/measurements', tags=['measurements'])


@router.post('', response_model=MeasurementOut, status_code=status.HTTP_201_CREATED)
def create_measurement(
    payload: MeasurementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
) -> MeasurementOut:
    measurement = Measurement(
        patient_id=current_user.id,
        type=payload.type,
        value_primary=payload.value_primary,
        value_secondary=payload.value_secondary,
        unit=payload.unit,
        measured_at=payload.measured_at,
        source=payload.source,
        device_name=payload.device_name,
        note=payload.note,
    )
    db.add(measurement)
    db.commit()
    db.refresh(measurement)
    return MeasurementOut.model_validate(measurement)


@router.get('', response_model=list[MeasurementOut])
def list_measurements(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
    type: MeasurementType | None = None,
    date_from: datetime | None = None,
    date_to: datetime | None = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
) -> list[MeasurementOut]:
    query = db.query(Measurement).filter(Measurement.patient_id == current_user.id)
    if type is not None:
        query = query.filter(Measurement.type == type)
    if date_from is not None:
        query = query.filter(Measurement.measured_at >= date_from)
    if date_to is not None:
        query = query.filter(Measurement.measured_at <= date_to)
    query = query.order_by(Measurement.measured_at.desc())
    measurements = query.offset(offset).limit(limit).all()
    return [MeasurementOut.model_validate(m) for m in measurements]


@router.get('/{measurement_id}', response_model=MeasurementOut)
def get_measurement(
    measurement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_patient),
) -> MeasurementOut:
    measurement = db.query(Measurement).filter(
        Measurement.id == measurement_id,
        Measurement.patient_id == current_user.id,
    ).first()
    if measurement is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Measurement not found')
    return MeasurementOut.model_validate(measurement)
