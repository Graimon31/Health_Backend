"""Feature engineering from raw health measurements.

Builds a fixed-order feature vector for each patient snapshot.
"""

import logging
from datetime import datetime, timedelta

import numpy as np
import pandas as pd

from ml.config import (
    MIN_MEASUREMENTS,
    SIGNAL_COLUMNS,
    WINDOW_3D,
    WINDOW_7D,
    WINDOW_14D,
)

logger = logging.getLogger(__name__)

# ── Public helpers ───────────────────────────────────────────────────────


def build_feature_names() -> list[str]:
    """Return the canonical ordered list of feature names."""
    names: list[str] = []
    for signal in SIGNAL_COLUMNS:
        names.extend(_signal_feature_names(signal))
    return names


def build_features_for_patient(
    df: pd.DataFrame,
    reference_date: datetime,
    window_days: int = WINDOW_14D,
) -> dict[str, float]:
    """Build the full feature dict for one patient as of *reference_date*.

    Args:
        df: DataFrame with at least columns ``measured_at`` plus the DB signal
            columns listed in :pydata:`SIGNAL_COLUMNS`.  Must belong to a
            single patient.
        reference_date: The "now" anchor.  Only rows in
            ``[reference_date - window_days, reference_date]`` are used.
        window_days: Look-back window size (default 14).

    Returns:
        Ordered ``{feature_name: value}`` dict.  Missing signals produce
        ``NaN`` for aggregation features and the count of missing rows.

    Raises:
        ValueError: If fewer than :pydata:`MIN_MEASUREMENTS` records exist in
            the window.
    """
    # Ensure reference_date is tz-naive for comparison with pandas timestamps
    ref = reference_date.replace(tzinfo=None) if reference_date.tzinfo else reference_date
    start = ref - timedelta(days=window_days)

    ts = pd.to_datetime(df["measured_at"]).dt.tz_localize(None)
    mask = (ts >= start) & (ts <= ref)
    window_df = df.loc[mask].sort_values("measured_at").copy()

    if len(window_df) < MIN_MEASUREMENTS:
        raise ValueError(
            f"Insufficient data: {len(window_df)} records in window "
            f"(need >= {MIN_MEASUREMENTS})"
        )

    features: dict[str, float] = {}
    for signal, col in SIGNAL_COLUMNS.items():
        features.update(_compute_signal_features(window_df, col, signal, reference_date))

    # Replace inf/-inf with NaN, then fill remaining NaN with 0.0
    for k, v in features.items():
        if not np.isfinite(v):
            features[k] = 0.0

    return features


def build_features_bulk(
    df: pd.DataFrame,
    reference_dates: dict[int, datetime],
    window_days: int = WINDOW_14D,
) -> list[dict[str, object]]:
    """Build feature rows for many patients at once.

    Args:
        df: Full measurements DataFrame (all patients).
        reference_dates: ``{patient_id: reference_date}``.
        window_days: Look-back window.

    Returns:
        List of dicts with ``patient_id``, ``feature_date``, and feature values.
    """
    rows: list[dict[str, object]] = []
    for pid, ref_date in reference_dates.items():
        pdf = df[df["patient_id"] == pid]
        if pdf.empty:
            continue
        try:
            feats = build_features_for_patient(pdf, ref_date, window_days)
        except ValueError:
            logger.debug("Skipping patient %d — insufficient data", pid)
            continue
        row: dict[str, object] = {"patient_id": pid, "feature_date": ref_date, **feats}
        rows.append(row)
    return rows


# ── Internal helpers ─────────────────────────────────────────────────────


def _signal_feature_names(signal: str) -> list[str]:
    return [
        f"{signal}_mean_3d",
        f"{signal}_mean_7d",
        f"{signal}_mean_14d",
        f"{signal}_min_7d",
        f"{signal}_max_7d",
        f"{signal}_std_7d",
        f"{signal}_std_14d",
        f"{signal}_trend_7d",
        f"{signal}_trend_14d",
        f"{signal}_last_value",
        f"{signal}_missing_count_14d",
    ]


def _compute_signal_features(
    window_df: pd.DataFrame,
    col: str,
    signal: str,
    reference_date: datetime,
) -> dict[str, float]:
    """Compute all aggregation features for a single signal."""
    series = window_df[col] if col in window_df.columns else pd.Series(dtype=float)
    non_null = series.dropna()
    total_rows = len(window_df)

    feats: dict[str, float] = {}

    # Sub-windows (tz-naive for safe comparison)
    ref = reference_date.replace(tzinfo=None) if reference_date.tzinfo else reference_date
    dates = pd.to_datetime(window_df["measured_at"]).dt.tz_localize(None)
    mask_3d = dates >= (ref - timedelta(days=WINDOW_3D))
    mask_7d = dates >= (ref - timedelta(days=WINDOW_7D))

    s_3d = series[mask_3d].dropna()
    s_7d = series[mask_7d].dropna()
    s_14d = non_null  # full window is 14d

    feats[f"{signal}_mean_3d"] = float(s_3d.mean()) if len(s_3d) > 0 else 0.0
    feats[f"{signal}_mean_7d"] = float(s_7d.mean()) if len(s_7d) > 0 else 0.0
    feats[f"{signal}_mean_14d"] = float(s_14d.mean()) if len(s_14d) > 0 else 0.0

    feats[f"{signal}_min_7d"] = float(s_7d.min()) if len(s_7d) > 0 else 0.0
    feats[f"{signal}_max_7d"] = float(s_7d.max()) if len(s_7d) > 0 else 0.0

    feats[f"{signal}_std_7d"] = float(s_7d.std()) if len(s_7d) > 1 else 0.0
    feats[f"{signal}_std_14d"] = float(s_14d.std()) if len(s_14d) > 1 else 0.0

    # Trend = last - first within window
    feats[f"{signal}_trend_7d"] = _trend(s_7d)
    feats[f"{signal}_trend_14d"] = _trend(s_14d)

    feats[f"{signal}_last_value"] = float(non_null.iloc[-1]) if len(non_null) > 0 else 0.0
    feats[f"{signal}_missing_count_14d"] = float(total_rows - len(non_null))

    return feats


def _trend(series: pd.Series) -> float:
    if len(series) < 2:
        return 0.0
    return float(series.iloc[-1] - series.iloc[0])
