"""Pydantic / dataclass structures used across the ML pipeline."""

from dataclasses import dataclass, field
from datetime import datetime


@dataclass(frozen=True)
class TrainResult:
    """Outcome of a training run."""

    model_version: str
    threshold: float
    roc_auc: float
    pr_auc: float
    recall: float
    precision: float
    f1: float
    train_rows: int
    val_rows: int


@dataclass
class FeatureRow:
    """A single patient feature vector with metadata."""

    patient_id: int
    feature_date: datetime
    values: dict[str, float] = field(default_factory=dict)
    target: int | None = None


@dataclass(frozen=True)
class PredictionResult:
    """Output of a single inference call."""

    patient_id: int
    risk_probability: float
    risk_level: str
    threshold: float
    top_factors: list[dict[str, object]]
    model_version: str
    generated_at: datetime
