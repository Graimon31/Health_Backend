from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from enum import Enum

class Sex(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class UnitSystem(str, Enum):
    METRIC = "METRIC"
    IMPERIAL = "IMPERIAL"

class PatientBase(BaseModel):
    external_user_id: str
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    sex: Optional[Sex] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[float] = None
    contact_phone: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    birth_date: Optional[date] = None
    sex: Optional[Sex] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[float] = None
    contact_phone: Optional[str] = None

class Patient(PatientBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ProfileBase(BaseModel):
    units: Optional[UnitSystem] = UnitSystem.METRIC
    conditions: Optional[List[Dict[str, Any]]] = []
    allergies: Optional[List[Dict[str, Any]]] = []
    medications: Optional[List[Dict[str, Any]]] = []
    resting_hr: Optional[int] = None
    bp_baseline_sys: Optional[int] = None
    bp_baseline_dia: Optional[int] = None
    hr_high: Optional[int] = None
    bp_sys_high: Optional[int] = None
    bp_dia_high: Optional[int] = None
    emergency_name: Optional[str] = None
    emergency_phone: Optional[str] = None
    doctor_name: Optional[str] = None
    doctor_phone: Optional[str] = None
    ble_device_name: Optional[str] = None
    ble_device_address: Optional[str] = None
    share_with_doctor: Optional[bool] = False
    consent_accepted: Optional[bool] = False
    consent_version: Optional[str] = None
    consent_timestamp: Optional[datetime] = None
    schema_version: Optional[int] = 1

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    patient_id: int
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
