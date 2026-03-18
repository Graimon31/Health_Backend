from datetime import date, datetime

from pydantic import BaseModel

from app.models.patient_profile import Sex


class PatientProfileUpdate(BaseModel):
    birth_date: date | None = None
    sex: Sex | None = None
    height_cm: int | None = None
    weight_kg: float | None = None
    conditions: list[str] | None = None
    allergies: list[str] | None = None


class PatientProfileOut(BaseModel):
    birth_date: date | None
    sex: Sex | None
    height_cm: int | None
    weight_kg: float | None
    conditions: list | None
    allergies: list | None
    doctor_name: str | None = None

    model_config = {'from_attributes': True}


class LinkDoctorRequest(BaseModel):
    doctor_code: str
