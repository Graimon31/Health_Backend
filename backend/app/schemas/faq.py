from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import date

class FAQBase(BaseModel):
    id: str
    category: Optional[str] = "General"
    question: str
    answer: str

class FAQCreate(FAQBase):
    pass

class FAQUpdate(BaseModel):
    category: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    helpful_count: Optional[int] = None
    not_helpful_count: Optional[int] = None

class FAQ(FAQBase):
    updated_at: Optional[date] = None
    helpful_count: int
    not_helpful_count: int

    model_config = ConfigDict(from_attributes=True)
