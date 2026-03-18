"""Runtime orchestration for risk prediction — bridges API ↔ ML modules."""

import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.patient import HealthMeasurement, Patient
from ml.config import SIGNAL_COLUMNS, WINDOW_14D
from ml.features import build_features_for_patient
from ml.infer import is_loaded, load_artifacts, predict
from ml.schemas import PredictionResult

logger = logging.getLogger(__name__)


def ensure_model_loaded() -> bool:
    """Try to load model artifacts if not already loaded.

    Returns:
        True if model is ready; False otherwise.
    """
    if is_loaded():
        return True
    try:
        load_artifacts()
        return True
    except FileNotFoundError:
        logger.warning("Model artifacts not found — prediction unavailable.")
        return False


def get_prediction(patient_id: int, db: Session) -> PredictionResult:
    """Compute risk prediction for a patient.

    Args:
        patient_id: Patient primary key.
        db: Active SQLAlchemy session.

    Returns:
        :class:`PredictionResult`.

    Raises:
        PatientNotFoundError: Patient does not exist.
        InsufficientDataError: Not enough measurement history.
        ModelNotReadyError: Artifacts not loaded.
    """
    if not ensure_model_loaded():
        raise ModelNotReadyError("Model artifacts are not available.")

    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if patient is None:
        raise PatientNotFoundError(f"Patient {patient_id} not found.")

    # Load measurements into a DataFrame
    import pandas as pd

    rows = (
        db.query(HealthMeasurement)
        .filter(HealthMeasurement.patient_id == patient_id)
        .order_by(HealthMeasurement.measured_at)
        .all()
    )

    records = []
    for r in rows:
        record: dict[str, object] = {"measured_at": r.measured_at}
        for _signal, col in SIGNAL_COLUMNS.items():
            record[col] = getattr(r, col)
        records.append(record)

    df = pd.DataFrame(records)
    if df.empty:
        raise InsufficientDataError("No measurements found for this patient.")

    df["measured_at"] = pd.to_datetime(df["measured_at"])
    now = datetime.utcnow()

    try:
        features = build_features_for_patient(df, now, window_days=WINDOW_14D)
    except ValueError as exc:
        raise InsufficientDataError(str(exc)) from exc

    result = predict(features)
    # Patch patient_id (infer module doesn't know it)
    return PredictionResult(
        patient_id=patient_id,
        risk_probability=result.risk_probability,
        risk_level=result.risk_level,
        threshold=result.threshold,
        top_factors=result.top_factors,
        model_version=result.model_version,
        generated_at=result.generated_at,
    )


# ── Domain errors ────────────────────────────────────────────────────────


class PatientNotFoundError(Exception):
    """Raised when patient_id doesn't exist."""


class InsufficientDataError(Exception):
    """Raised when feature window has too few records."""


class ModelNotReadyError(Exception):
    """Raised when model artifacts cannot be loaded."""
