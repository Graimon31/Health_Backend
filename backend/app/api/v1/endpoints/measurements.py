from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import List, Optional
from app.api import deps
from app.models.measurement import Measurement
from app.models.patient import Patient
from app.schemas.measurement import Measurement as MeasurementSchema, MeasurementCreate
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/", status_code=204)
async def create_measurement(
    measurement: MeasurementCreate,
    db: Session = Depends(deps.get_db),
    # current_user: User = Depends(deps.get_current_user), # Mobile might post without user if device-based? Or authenticated.
    # Let's assume authenticated or trusted.
):
    # Resolve patient
    patient = None
    if measurement.patient_id:
        result = await db.execute(select(Patient).where(Patient.id == measurement.patient_id))
        patient = result.scalars().first()
    elif measurement.external_user_id:
        result = await db.execute(select(Patient).where(Patient.external_user_id == measurement.external_user_id))
        patient = result.scalars().first()

    if not patient:
         # If new patient (from device?), maybe auto-create? Or error.
         # Requirement: "POST /measurements ... { externalUserId ... }"
         # Let's error for now.
         raise HTTPException(status_code=404, detail="Patient not found")

    # Check unique
    existing = await db.execute(select(Measurement).where(
        Measurement.patient_id == patient.id,
        Measurement.ts == measurement.ts
    ))
    existing_measurement = existing.scalars().first()

    if existing_measurement:
        # Update
        if measurement.heart_rate is not None: existing_measurement.heart_rate = measurement.heart_rate
        if measurement.bp_systolic is not None: existing_measurement.bp_systolic = measurement.bp_systolic
        if measurement.bp_diastolic is not None: existing_measurement.bp_diastolic = measurement.bp_diastolic
        existing_measurement.source = measurement.source
    else:
        new_measurement = Measurement(
            patient_id=patient.id,
            ts=measurement.ts,
            heart_rate=measurement.heart_rate,
            bp_systolic=measurement.bp_systolic,
            bp_diastolic=measurement.bp_diastolic,
            source=measurement.source
        )
        db.add(new_measurement)

    await db.commit()
    return

@router.get("/patient/{patient_id}", response_model=List[MeasurementSchema])
async def read_measurements(
    patient_id: int,
    from_date: Optional[datetime] = Query(None, alias="from"),
    to_date: Optional[datetime] = Query(None, alias="to"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
):
    stmt = select(Measurement).where(Measurement.patient_id == patient_id).order_by(Measurement.ts.desc())
    if from_date:
        stmt = stmt.where(Measurement.ts >= from_date)
    if to_date:
        stmt = stmt.where(Measurement.ts <= to_date)

    result = await db.execute(stmt.offset(skip).limit(limit))
    return result.scalars().all()

@router.get("/trend/{patient_id}")
async def get_trend(
    patient_id: int,
    window: int = Query(10),
    db: Session = Depends(deps.get_db),
):
    cutoff = datetime.utcnow() - timedelta(days=window)
    # Fetch HR for trend
    stmt = select(Measurement.ts, Measurement.heart_rate).where(
        Measurement.patient_id == patient_id,
        Measurement.ts >= cutoff,
        Measurement.heart_rate.is_not(None)
    ).order_by(Measurement.ts.asc())

    result = await db.execute(stmt)
    data = result.all() # list of (ts, hr)

    if not data or len(data) < 2:
        return {"slope": 0.0, "verdict": "NORMAL"}

    points = []
    start_ts = data[0].ts.timestamp()
    for row in data:
        x = (row.ts.timestamp() - start_ts) / (24 * 3600) # days
        y = row.heart_rate
        points.append((x, y))

    n = len(points)
    sum_x = sum(p[0] for p in points)
    sum_y = sum(p[1] for p in points)
    sum_xy = sum(p[0] * p[1] for p in points)
    sum_xx = sum(p[0] ** 2 for p in points)

    denominator = (n * sum_xx - sum_x ** 2)
    if denominator == 0:
        slope = 0
    else:
        slope = (n * sum_xy - sum_x * sum_y) / denominator

    verdict = "NORMAL"
    if slope > 0.5: verdict = "UP"
    elif slope < -0.5: verdict = "DOWN"

    return {"slope": slope, "verdict": verdict}
