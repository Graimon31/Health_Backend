"""Pydantic response models for the prediction API."""

from datetime import datetime

from pydantic import BaseModel, Field


class TopFactor(BaseModel):
    """Single contributing factor."""

    name: str
    impact: float


class PredictionResponse(BaseModel):
    """Response schema for GET /api/v1/prediction/{patient_id}."""

    patient_id: int
    risk_probability: float = Field(ge=0.0, le=1.0)
    risk_level: str = Field(pattern="^(low|medium|high)$")
    threshold: float
    top_factors: list[TopFactor]
    model_version: str
    generated_at: datetime


class ErrorResponse(BaseModel):
    """Standard error body."""

    detail: str
