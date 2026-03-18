import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db import Base


class MeasurementType(str, enum.Enum):
    PULSE = 'PULSE'
    BLOOD_PRESSURE = 'BLOOD_PRESSURE'
    WEIGHT = 'WEIGHT'
    SPO2 = 'SPO2'
    STEPS = 'STEPS'
    CALORIES = 'CALORIES'
    SLEEP = 'SLEEP'
    RESPIRATORY = 'RESPIRATORY'


class MeasurementSource(str, enum.Enum):
    DEVICE = 'DEVICE'
    MANUAL = 'MANUAL'


class Measurement(Base):
    __tablename__ = 'measurements'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)
    type: Mapped[MeasurementType] = mapped_column(Enum(MeasurementType, name='measurement_type'), nullable=False)
    value_primary: Mapped[float] = mapped_column(Float, nullable=False)
    value_secondary: Mapped[float | None] = mapped_column(Float, nullable=True)
    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    measured_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    source: Mapped[MeasurementSource] = mapped_column(Enum(MeasurementSource, name='measurement_source'), nullable=False)
    device_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
