from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Date, Numeric, Text, JSON, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    ts = Column(DateTime(timezone=True), nullable=False)
    heart_rate = Column(Integer)
    bp_systolic = Column(Integer)
    bp_diastolic = Column(Integer)
    source = Column(String) # "manual", "device", etc.

    __table_args__ = (Index('ix_measurements_patient_ts', 'patient_id', 'ts', unique=True),)

class AlertType(str, enum.Enum):
    HR_HIGH = "HR_HIGH"
    BP_HIGH = "BP_HIGH"
    TREND_UP = "TREND_UP"
    MANUAL = "MANUAL"

class AlertSeverity(str, enum.Enum):
    INFO = "INFO"
    WARN = "WARN"
    CRITICAL = "CRITICAL"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    kind = Column(Enum(AlertType), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    text = Column(String)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime(timezone=True))
    resolved_by = Column(String) # User ID or name

    patient = relationship("Patient", back_populates="alerts") # Need to add back_populates in Patient
