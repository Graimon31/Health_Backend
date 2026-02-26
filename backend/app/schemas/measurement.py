from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from enum import Enum

class MeasurementBase(BaseModel):
    patient_id: Optional[int] = None # Or derived from context
    external_user_id: Optional[str] = None # Alternative
    ts: datetime
    heart_rate: Optional[int] = None
    bp_systolic: Optional[int] = None
    bp_diastolic: Optional[int] = None
    source: Optional[str] = "manual"

class MeasurementCreate(MeasurementBase):
    pass

class Measurement(MeasurementBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

class Trend(BaseModel):
    slope: float
    verdict: str # "UP" | "NORMAL" | "DOWN"
