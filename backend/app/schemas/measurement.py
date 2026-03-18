from datetime import datetime

from pydantic import BaseModel

from app.models.measurement import MeasurementSource, MeasurementType


class MeasurementCreate(BaseModel):
    type: MeasurementType
    value_primary: float
    value_secondary: float | None = None
    unit: str
    measured_at: datetime
    source: MeasurementSource
    device_name: str | None = None
    note: str | None = None


class MeasurementOut(BaseModel):
    id: int
    patient_id: int
    type: MeasurementType
    value_primary: float
    value_secondary: float | None
    unit: str
    measured_at: datetime
    source: MeasurementSource
    device_name: str | None
    note: str | None
    created_at: datetime

    model_config = {'from_attributes': True}
