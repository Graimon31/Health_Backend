"""Explainability — SHAP-based feature contributions for a single prediction.

Falls back to model ``feature_importances_`` when SHAP is unavailable.
"""

import logging

import numpy as np

from ml.infer import _feature_names, _model

logger = logging.getLogger(__name__)


def explain_prediction(features: dict[str, float], top_n: int = 5) -> list[dict[str, object]]:
    """Return top-N contributing features for the given input.

    Tries SHAP ``TreeExplainer`` first; on failure uses built-in feature importances.

    Args:
        features: Feature dict (same as passed to :func:`ml.infer.predict`).
        top_n: Number of top factors to return.

    Returns:
        List of ``{"name": str, "impact": float}`` sorted by absolute impact.
    """
    if _model is None or _feature_names is None:
        return []

    x = np.array(
        [features.get(f, 0.0) for f in _feature_names], dtype=np.float32
    ).reshape(1, -1)
    x = np.nan_to_num(x, nan=0.0, posinf=0.0, neginf=0.0)

    try:
        import shap
        explainer = shap.TreeExplainer(_model)
        shap_values = explainer.shap_values(x)
        # For binary classification shap_values may be a list of 2 arrays
        if isinstance(shap_values, list):
            sv = shap_values[1][0]
        else:
            sv = shap_values[0]

        indexed = sorted(
            zip(_feature_names, sv),
            key=lambda t: abs(t[1]),
            reverse=True,
        )
        return [
            {"name": name, "impact": round(float(val), 4)}
            for name, val in indexed[:top_n]
        ]
    except Exception:
        logger.debug("SHAP unavailable or failed — using feature_importances_.")
        importances = getattr(_model, "feature_importances_", None)
        if importances is None:
            return []
        indexed = sorted(
            zip(_feature_names, importances),
            key=lambda t: t[1],
            reverse=True,
        )
        return [
            {"name": name, "impact": round(float(imp), 4)}
            for name, imp in indexed[:top_n]
        ]
