"""Prediction API router — GET /api/v1/prediction/{patient_id}."""

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.prediction import PredictionResponse
from app.services.risk_service import (
    InsufficientDataError,
    ModelNotReadyError,
    PatientNotFoundError,
    get_prediction,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/prediction", tags=["prediction"])


@router.get(
    "/{patient_id}",
    response_model=PredictionResponse,
    responses={
        404: {"description": "Patient not found"},
        422: {"description": "Insufficient measurement data"},
        503: {"description": "Model not loaded"},
    },
)
def predict_risk(
    patient_id: int,
    db: Session = Depends(get_db),
) -> PredictionResponse:
    """Return 7-day risk prediction for the given patient.

    Computes features from the latest health measurements, runs inference
    through the trained ML model, and returns risk probability, level,
    and top contributing factors.
    """
    try:
        result = get_prediction(patient_id, db)
    except PatientNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Patient {patient_id} not found")
    except InsufficientDataError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))
    except ModelNotReadyError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Risk prediction model is not available. Train the model first.",
        )

    return PredictionResponse(
        patient_id=result.patient_id,
        risk_probability=result.risk_probability,
        risk_level=result.risk_level,
        threshold=result.threshold,
        top_factors=[{"name": f["name"], "impact": f["impact"]} for f in result.top_factors],
        model_version=result.model_version,
        generated_at=result.generated_at,
    )
