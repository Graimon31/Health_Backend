from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Date, Numeric, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.session import Base

class Sex(str, enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"

class UnitSystem(str, enum.Enum):
    METRIC = "METRIC"
    IMPERIAL = "IMPERIAL"

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    external_user_id = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    birth_date = Column(Date)
    sex = Column(Enum(Sex))
    height_cm = Column(Integer)
    weight_kg = Column(Numeric(6, 2))
    contact_phone = Column(String)
    doctor_id = Column(Integer, ForeignKey("doctors.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    profile = relationship("Profile", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="patient")
    # doctor = relationship("Doctor", back_populates="patients")

class Profile(Base):
    __tablename__ = "profiles"

    patient_id = Column(Integer, ForeignKey("patients.id"), primary_key=True)
    units = Column(Enum(UnitSystem), default=UnitSystem.METRIC)
    conditions = Column(JSON)
    allergies = Column(JSON)
    medications = Column(JSON)
    resting_hr = Column(Integer)
    bp_baseline_sys = Column(Integer)
    bp_baseline_dia = Column(Integer)
    hr_high = Column(Integer)
    bp_sys_high = Column(Integer)
    bp_dia_high = Column(Integer)
    emergency_name = Column(String)
    emergency_phone = Column(String)
    doctor_name = Column(String)
    doctor_phone = Column(String)
    ble_device_name = Column(String)
    ble_device_address = Column(String)
    share_with_doctor = Column(Boolean, default=False)
    consent_accepted = Column(Boolean, default=False)
    consent_version = Column(String)
    consent_timestamp = Column(DateTime(timezone=True))
    schema_version = Column(Integer, default=1)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("Patient", back_populates="profile")
