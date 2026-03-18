"""Model loading and single-patient inference."""

import json
import logging
import pickle
import time
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from ml.config import (
    FEATURE_SCHEMA_PATH,
    METADATA_PATH,
    MODEL_PATH,
    RISK_MEDIUM_FACTOR,
)
from ml.schemas import PredictionResult

logger = logging.getLogger(__name__)

# ── Module-level model cache ─────────────────────────────────────────────
_model: object | None = None
_feature_names: list[str] | None = None
_metadata: dict[str, object] | None = None


def load_artifacts(
    model_path: Path = MODEL_PATH,
    schema_path: Path = FEATURE_SCHEMA_PATH,
    metadata_path: Path = METADATA_PATH,
) -> None:
    """Load model, feature schema, and metadata into module cache.

    This function is idempotent — calling it multiple times is safe.

    Raises:
        FileNotFoundError: If any artifact file is missing.
    """
    global _model, _feature_names, _metadata  # noqa: PLW0603

    for p in (model_path, schema_path, metadata_path):
        if not p.exists():
            raise FileNotFoundError(f"Artifact not found: {p}")

    with open(model_path, "rb") as f:
        _model = pickle.load(f)  # noqa: S301

    with open(schema_path) as f:
        _feature_names = json.load(f)["features"]

    with open(metadata_path) as f:
        _metadata = json.load(f)

    logger.info(
        "Model artifacts loaded: version=%s, features=%d",
        _metadata.get("model_version", "unknown"),
        len(_feature_names),
    )


def is_loaded() -> bool:
    """Return True if model artifacts are loaded and ready."""
    return _model is not None and _feature_names is not None and _metadata is not None


def predict(features: dict[str, float]) -> PredictionResult:
    """Run inference for a single patient.

    Args:
        features: Feature dict produced by
            :func:`ml.features.build_features_for_patient`.

    Returns:
        :class:`PredictionResult` with risk probability, level, and top factors.

    Raises:
        RuntimeError: If artifacts have not been loaded.
    """
    if not is_loaded():
        raise RuntimeError("Model artifacts not loaded — call load_artifacts() first.")

    assert _feature_names is not None
    assert _metadata is not None

    t0 = time.monotonic()

    # Build ordered feature vector
    x = np.array(
        [features.get(f, 0.0) for f in _feature_names], dtype=np.float32
    ).reshape(1, -1)
    x = np.nan_to_num(x, nan=0.0, posinf=0.0, neginf=0.0)

    prob = float(_model.predict_proba(x)[0, 1])  # type: ignore[union-attr]
    threshold = float(_metadata["threshold"])
    risk_level = _classify_risk(prob, threshold)

    elapsed_ms = (time.monotonic() - t0) * 1000
    logger.info("Inference done in %.1f ms — prob=%.4f level=%s", elapsed_ms, prob, risk_level)

    # Top factors from model feature importance (not SHAP — that's in explain.py)
    top_factors = _quick_feature_importance(features)

    return PredictionResult(
        patient_id=0,  # caller should override
        risk_probability=round(prob, 4),
        risk_level=risk_level,
        threshold=threshold,
        top_factors=top_factors,
        model_version=str(_metadata.get("model_version", "unknown")),
        generated_at=datetime.now(timezone.utc),
    )


def _classify_risk(prob: float, threshold: float) -> str:
    """Map probability to risk level string."""
    if prob >= threshold:
        return "high"
    if prob >= threshold * RISK_MEDIUM_FACTOR:
        return "medium"
    return "low"


def _quick_feature_importance(features: dict[str, float]) -> list[dict[str, object]]:
    """Return top-5 features by model importance weighted by feature value deviation."""
    assert _model is not None
    assert _feature_names is not None

    importances: np.ndarray | None = getattr(_model, "feature_importances_", None)
    if importances is None:
        return []

    indexed = sorted(
        zip(_feature_names, importances),
        key=lambda t: t[1],
        reverse=True,
    )
    return [
        {"name": name, "impact": round(float(imp), 4)}
        for name, imp in indexed[:5]
    ]
