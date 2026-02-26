from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, DateTime, Text, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.db.session import Base

class ChatRole(str, enum.Enum):
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"

class MessageStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    READ = "READ"

class ChatThread(Base):
    __tablename__ = "chat_threads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_ts = Column(DateTime(timezone=True))
    unread_for_doctor = Column(Integer, default=0)
    unread_for_patient = Column(Integer, default=0)

    # Constraint unique pair
    __table_args__ = (Index('ix_chat_threads_pair', 'patient_id', 'doctor_id', unique=True),)

    messages = relationship("ChatMessage", back_populates="thread", cascade="all, delete-orphan")
    patient = relationship("Patient")
    doctor = relationship("Doctor")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    thread_id = Column(UUID(as_uuid=True), ForeignKey("chat_threads.id"), nullable=False)
    from_id = Column(String, nullable=False) # User ID or Patient External ID? Usually User.id (int) or Patient.external_user_id (str)
    # Requirement: "from: <userId>"
    # Since doctors are Users (int id) and patients have External User ID (str), let's use String.
    from_role = Column(Enum(ChatRole), nullable=False)
    text = Column(Text, nullable=False)
    ts = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(Enum(MessageStatus), default=MessageStatus.SENT)

    thread = relationship("ChatThread", back_populates="messages")
