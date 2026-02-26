from sqlalchemy import Column, Integer, String, Boolean, Date, Text
from sqlalchemy.sql import func
from app.db.session import Base

class FAQItem(Base):
    __tablename__ = "faq_items"

    id = Column(String, primary_key=True, index=True) # Text PK
    category = Column(String)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    updated_at = Column(Date, default=func.now())
    helpful_count = Column(Integer, default=0)
    not_helpful_count = Column(Integer, default=0)
