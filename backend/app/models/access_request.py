import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class AccessType(str, enum.Enum):
    ONE_TIME = 'ONE_TIME'
    PERMANENT = 'PERMANENT'


class AccessStatus(str, enum.Enum):
    DRAFT = 'draft'
    PENDING_PATIENT = 'pending_patient'
    APPROVED = 'approved'
    REJECTED = 'rejected'
    ACTIVE = 'active'
    EXPIRED = 'expired'
    REVOKED = 'revoked'


class AccessRequest(Base):
    __tablename__ = 'access_requests'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    doctor_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)
    patient_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)

    access_type: Mapped[AccessType] = mapped_column(Enum(AccessType, name='access_type_enum'), nullable=False)
    status: Mapped[AccessStatus] = mapped_column(
        Enum(AccessStatus, name='access_status_enum'), nullable=False, default=AccessStatus.DRAFT,
    )

    # Permanent access period
    access_start: Mapped[date | None] = mapped_column(Date, nullable=True)
    access_end: Mapped[date | None] = mapped_column(Date, nullable=True)

    # One-time access TTL (hours)
    ttl_hours: Mapped[int | None] = mapped_column(Integer, nullable=True, default=24)

    # Patient data from doctor form (FR-03)
    chief_complaint: Mapped[str | None] = mapped_column(Text, nullable=True)
    medical_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    medications: Mapped[str | None] = mapped_column(Text, nullable=True)
    allergies_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    social_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    emergency_contact: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferred_language: Mapped[str | None] = mapped_column(String(10), nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    doctor = relationship('User', foreign_keys=[doctor_id])
    patient = relationship('User', foreign_keys=[patient_id])


class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    target_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    target_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship('User', foreign_keys=[user_id])
