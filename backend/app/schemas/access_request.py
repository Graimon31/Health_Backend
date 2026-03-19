from datetime import date, datetime

from pydantic import BaseModel, field_validator

from app.models.access_request import AccessStatus, AccessType


class CheckNicknameRequest(BaseModel):
    nickname: str


class CheckNicknameResponse(BaseModel):
    found: bool
    patient_id: int | None = None
    full_name: str | None = None


class PatientFormData(BaseModel):
    full_name: str
    date_of_birth: date | None = None
    phone: str | None = None
    address: str | None = None
    emergency_contact: str | None = None
    preferred_language: str | None = None
    chief_complaint: str | None = None
    medical_history: str | None = None
    medications: str | None = None
    allergies: str | None = None
    social_history: str | None = None


class CreateAccessRequest(BaseModel):
    patient_nickname: str
    access_type: AccessType
    access_start: date | None = None
    access_end: date | None = None
    patient_form: PatientFormData

    @field_validator('access_end')
    @classmethod
    def validate_period(cls, v: date | None, info) -> date | None:
        if v is not None and info.data.get('access_start') is not None:
            start = info.data['access_start']
            delta = (v - start).days
            if delta < 0:
                raise ValueError('End date must be after start date')
            if delta > 365:
                raise ValueError('Access period cannot exceed 365 days')
        return v


class AccessRequestOut(BaseModel):
    id: int
    doctor_id: int
    patient_id: int
    patient_name: str
    access_type: AccessType
    status: AccessStatus
    access_start: date | None = None
    access_end: date | None = None
    ttl_hours: int | None = None
    created_at: datetime
    responded_at: datetime | None = None


class RespondAccessRequest(BaseModel):
    accept: bool


class AccessRequestListOut(BaseModel):
    requests: list[AccessRequestOut]
