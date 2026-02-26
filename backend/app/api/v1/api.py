from fastapi import APIRouter
from app.api.v1.endpoints import auth, patients, mobile, faq, chat, measurements

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(mobile.router, prefix="/mobile", tags=["mobile"])
api_router.include_router(faq.router, prefix="/faq", tags=["faq"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(measurements.router, prefix="/measurements", tags=["measurements"])
api_router.include_router(measurements.router, prefix="/analytics", tags=["analytics"]) # Reuse same router or split? Requirement has /analytics/trend
