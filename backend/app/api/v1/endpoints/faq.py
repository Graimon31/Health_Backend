from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy.future import select
from typing import List
from app.api import deps
from app.models.faq import FAQItem
from app.schemas.faq import FAQ, FAQCreate, FAQUpdate
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[FAQ])
async def read_faqs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(deps.get_db),
):
    result = await db.execute(select(FAQItem).offset(skip).limit(limit))
    faqs = result.scalars().all()
    return faqs

@router.post("/", response_model=FAQ)
async def create_faq(
    faq: FAQCreate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    if current_user.role != "ADMIN":
         raise HTTPException(status_code=403, detail="Not enough permissions")

    db_faq = FAQItem(**faq.model_dump())
    db.add(db_faq)
    await db.commit()
    await db.refresh(db_faq)
    return db_faq

@router.patch("/{faq_id}", response_model=FAQ)
async def update_faq(
    faq_id: str,
    faq_update: FAQUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    result = await db.execute(select(FAQItem).where(FAQItem.id == faq_id))
    db_faq = result.scalars().first()
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")

    # Check permissions if editing content
    if (faq_update.question or faq_update.answer or faq_update.category) and current_user.role != "ADMIN":
         # Allow voting?
         if not (faq_update.helpful_count or faq_update.not_helpful_count):
             raise HTTPException(status_code=403, detail="Not enough permissions to edit content")

    update_data = faq_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_faq, key, value)

    await db.commit()
    await db.refresh(db_faq)
    return db_faq
