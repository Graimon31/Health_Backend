"""Patient and HealthMeasurement ORM models."""

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class Patient(Base):
    """Patient entity linked to a doctor (User)."""

    __tablename__ = "patients"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    doctor_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    date_of_birth: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    measurements: Mapped[list["HealthMeasurement"]] = relationship(back_populates="patient", order_by="HealthMeasurement.measured_at")


class HealthMeasurement(Base):
    """Single health measurement record for a patient.

    All vital-sign fields are nullable — a record may contain only a subset of signals.
    """

    __tablename__ = "health_measurements"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(Integer, ForeignKey("patients.id"), nullable=False, index=True)
    measured_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, index=True)

    heart_rate: Mapped[float | None] = mapped_column(Float, nullable=True)
    bp_systolic: Mapped[float | None] = mapped_column(Float, nullable=True)
    bp_diastolic: Mapped[float | None] = mapped_column(Float, nullable=True)
    spo2: Mapped[float | None] = mapped_column(Float, nullable=True)
    glucose: Mapped[float | None] = mapped_column(Float, nullable=True)
    stress_level: Mapped[float | None] = mapped_column(Float, nullable=True)
    sleep_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_critical_event: Mapped[bool | None] = mapped_column(nullable=True)

    patient: Mapped["Patient"] = relationship(back_populates="measurements")
