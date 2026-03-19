from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_doctor, require_patient
from app.db import get_db
from app.models.access_request import AccessRequest, AccessStatus, AccessType, AuditLog
from app.models.patient_profile import PatientProfile
from app.models.user import User, UserRole
from app.schemas.access_request import (
    AccessRequestListOut,
    AccessRequestOut,
    CheckNicknameRequest,
    CheckNicknameResponse,
    CreateAccessRequest,
    RespondAccessRequest,
)

router = APIRouter(prefix='/api/v1/access', tags=['access'])


def _audit(db: Session, user_id: int, action: str, target_type: str | None = None,
           target_id: int | None = None, details: str | None = None) -> None:
    db.add(AuditLog(user_id=user_id, action=action, target_type=target_type,
                     target_id=target_id, details=details))


def _to_out(req: AccessRequest, patient_name: str) -> AccessRequestOut:
    return AccessRequestOut(
        id=req.id,
        doctor_id=req.doctor_id,
        patient_id=req.patient_id,
        patient_name=patient_name,
        access_type=req.access_type,
        status=req.status,
        access_start=req.access_start,
        access_end=req.access_end,
        ttl_hours=req.ttl_hours,
        created_at=req.created_at,
        responded_at=req.responded_at,
    )


# ── Doctor endpoints ──


@router.post('/check-nickname', response_model=CheckNicknameResponse)
def check_nickname(
    payload: CheckNicknameRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_doctor),
) -> CheckNicknameResponse:
    patient = db.query(User).filter(
        User.nickname == payload.nickname,
        User.role == UserRole.PATIENT,
    ).first()
    if patient is None:
        return CheckNicknameResponse(found=False)
    return CheckNicknameResponse(found=True, patient_id=patient.id, full_name=patient.full_name)


@router.post('/request', response_model=AccessRequestOut)
def create_access_request(
    payload: CreateAccessRequest,
    db: Session = Depends(get_db),
    doctor: User = Depends(require_doctor),
) -> AccessRequestOut:
    # Validate patient exists
    patient = db.query(User).filter(
        User.nickname == payload.patient_nickname,
        User.role == UserRole.PATIENT,
    ).first()
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Patient not found')

    # Validate no active access already exists
    existing = db.query(AccessRequest).filter(
        AccessRequest.doctor_id == doctor.id,
        AccessRequest.patient_id == patient.id,
        AccessRequest.status.in_([AccessStatus.PENDING_PATIENT, AccessStatus.ACTIVE, AccessStatus.APPROVED]),
    ).first()
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail='Active or pending access already exists')

    # Validate permanent access period
    if payload.access_type == AccessType.PERMANENT:
        if payload.access_start is None or payload.access_end is None:
            raise HTTPException(status_code=422, detail='Start and end dates required for permanent access')
        delta = (payload.access_end - payload.access_start).days
        if delta < 0:
            raise HTTPException(status_code=422, detail='End date must be after start date')
        if delta > 365:
            raise HTTPException(status_code=422, detail='Access period cannot exceed 365 days')

    req = AccessRequest(
        doctor_id=doctor.id,
        patient_id=patient.id,
        access_type=payload.access_type,
        status=AccessStatus.PENDING_PATIENT,
        access_start=payload.access_start if payload.access_type == AccessType.PERMANENT else None,
        access_end=payload.access_end if payload.access_type == AccessType.PERMANENT else None,
        ttl_hours=24 if payload.access_type == AccessType.ONE_TIME else None,
        chief_complaint=payload.patient_form.chief_complaint,
        medical_history=payload.patient_form.medical_history,
        medications=payload.patient_form.medications,
        allergies_text=payload.patient_form.allergies,
        social_history=payload.patient_form.social_history,
        emergency_contact=payload.patient_form.emergency_contact,
        preferred_language=payload.patient_form.preferred_language,
    )
    db.add(req)
    db.flush()

    _audit(db, doctor.id, 'create_access_request', 'access_request', req.id,
           f'type={payload.access_type.value} patient={patient.id}')
    db.commit()
    db.refresh(req)

    return _to_out(req, patient.full_name)


@router.get('/requests', response_model=AccessRequestListOut)
def list_access_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AccessRequestListOut:
    if current_user.role == UserRole.DOCTOR:
        reqs = db.query(AccessRequest).filter(AccessRequest.doctor_id == current_user.id).all()
    elif current_user.role == UserRole.PATIENT:
        reqs = db.query(AccessRequest).filter(AccessRequest.patient_id == current_user.id).all()
    else:
        reqs = db.query(AccessRequest).all()

    result = []
    for r in reqs:
        patient = db.query(User).filter(User.id == r.patient_id).first()
        name = patient.full_name if patient else 'Unknown'
        result.append(_to_out(r, name))

    return AccessRequestListOut(requests=result)


@router.get('/requests/{request_id}', response_model=AccessRequestOut)
def get_access_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AccessRequestOut:
    req = db.query(AccessRequest).filter(AccessRequest.id == request_id).first()
    if req is None:
        raise HTTPException(status_code=404, detail='Request not found')
    if current_user.role == UserRole.DOCTOR and req.doctor_id != current_user.id:
        raise HTTPException(status_code=403, detail='Access denied')
    if current_user.role == UserRole.PATIENT and req.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail='Access denied')

    patient = db.query(User).filter(User.id == req.patient_id).first()
    return _to_out(req, patient.full_name if patient else 'Unknown')


# ── Patient endpoints ──


@router.put('/requests/{request_id}/respond', response_model=AccessRequestOut)
def respond_to_request(
    request_id: int,
    payload: RespondAccessRequest,
    db: Session = Depends(get_db),
    patient: User = Depends(require_patient),
) -> AccessRequestOut:
    req = db.query(AccessRequest).filter(
        AccessRequest.id == request_id,
        AccessRequest.patient_id == patient.id,
    ).first()
    if req is None:
        raise HTTPException(status_code=404, detail='Request not found')
    if req.status != AccessStatus.PENDING_PATIENT:
        raise HTTPException(status_code=400, detail='Request is not pending')

    req.responded_at = datetime.utcnow()
    if payload.accept:
        req.status = AccessStatus.ACTIVE
        # Link patient to doctor via profile
        profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient.id).first()
        if profile is not None:
            profile.doctor_id = req.doctor_id
    else:
        req.status = AccessStatus.REJECTED

    _audit(db, patient.id, 'respond_access_request', 'access_request', req.id,
           f'accepted={payload.accept}')
    db.commit()
    db.refresh(req)

    return _to_out(req, patient.full_name)


@router.put('/requests/{request_id}/revoke', response_model=AccessRequestOut)
def revoke_access(
    request_id: int,
    db: Session = Depends(get_db),
    patient: User = Depends(require_patient),
) -> AccessRequestOut:
    req = db.query(AccessRequest).filter(
        AccessRequest.id == request_id,
        AccessRequest.patient_id == patient.id,
    ).first()
    if req is None:
        raise HTTPException(status_code=404, detail='Request not found')
    if req.status not in (AccessStatus.ACTIVE, AccessStatus.APPROVED):
        raise HTTPException(status_code=400, detail='Access is not active')

    req.status = AccessStatus.REVOKED
    req.responded_at = datetime.utcnow()

    # Unlink doctor from patient profile
    profile = db.query(PatientProfile).filter(PatientProfile.user_id == patient.id).first()
    if profile is not None and profile.doctor_id == req.doctor_id:
        profile.doctor_id = None

    _audit(db, patient.id, 'revoke_access', 'access_request', req.id)
    db.commit()
    db.refresh(req)

    return _to_out(req, patient.full_name)


# ── Sync endpoint ──


@router.post('/requests/{request_id}/sync')
def sync_patient_data(
    request_id: int,
    db: Session = Depends(get_db),
    doctor: User = Depends(require_doctor),
) -> dict:
    req = db.query(AccessRequest).filter(
        AccessRequest.id == request_id,
        AccessRequest.doctor_id == doctor.id,
    ).first()
    if req is None:
        raise HTTPException(status_code=404, detail='Request not found')
    if req.status != AccessStatus.ACTIVE:
        raise HTTPException(status_code=403, detail='Access is not active')

    # Check if permanent access has expired
    if req.access_type == AccessType.PERMANENT and req.access_end is not None:
        if date.today() > req.access_end:
            req.status = AccessStatus.EXPIRED
            db.commit()
            raise HTTPException(status_code=403, detail='Access has expired')

    _audit(db, doctor.id, 'sync_patient_data', 'access_request', req.id)
    db.commit()

    return {'status': 'sync_initiated', 'request_id': req.id, 'patient_id': req.patient_id}
