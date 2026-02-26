from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID
from enum import Enum

class ChatRole(str, Enum):
    DOCTOR = "DOCTOR"
    PATIENT = "PATIENT"

class MessageStatus(str, Enum):
    QUEUED = "QUEUED"
    SENT = "SENT"
    DELIVERED = "DELIVERED"
    READ = "READ"

class ChatThreadBase(BaseModel):
    patient_id: int
    doctor_id: int

class ChatThreadCreate(ChatThreadBase):
    pass

class ChatThread(ChatThreadBase):
    id: UUID
    created_at: datetime
    last_message_ts: Optional[datetime] = None
    unread_for_doctor: int
    unread_for_patient: int

    model_config = ConfigDict(from_attributes=True)

class ChatMessageBase(BaseModel):
    thread_id: UUID
    text: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: UUID
    from_id: str
    from_role: ChatRole
    ts: datetime
    status: MessageStatus

    model_config = ConfigDict(from_attributes=True)
