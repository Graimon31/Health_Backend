"""Dataset preparation — loads raw data, builds features, assigns targets.

Supports two data sources:
  - ``db``: queries the application database via SQLAlchemy.
  - ``csv``: reads a CSV file (useful for offline experimentation).
"""

import logging
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from sqlalchemy.orm import Session

from ml.config import (
    BP_SYS_CRITICAL,
    SIGNAL_COLUMNS,
    SPO2_CRITICAL,
    TARGET_HORIZON_DAYS,
    VALIDATION_FRACTION,
    WINDOW_14D,
)
from ml.features import build_features_bulk, build_feature_names

logger = logging.getLogger(__name__)

# ── Public API ───────────────────────────────────────────────────────────


def load_from_db(session: Session) -> pd.DataFrame:
    """Load all health measurements from the DB into a DataFrame."""
    from app.models.patient import HealthMeasurement

    rows = session.query(HealthMeasurement).order_by(HealthMeasurement.measured_at).all()
    records = []
    for r in rows:
        record: dict[str, object] = {
            "patient_id": r.patient_id,
            "measured_at": r.measured_at,
        }
        for _signal, col in SIGNAL_COLUMNS.items():
            record[col] = getattr(r, col)
        record["is_critical_event"] = r.is_critical_event
        records.append(record)
    return pd.DataFrame(records)


def load_from_csv(path: Path) -> pd.DataFrame:
    """Load measurements from a CSV file.

    Expected columns: patient_id, measured_at, heart_rate, bp_systolic,
    bp_diastolic, spo2, glucose, stress_level, sleep_hours,
    is_critical_event.
    """
    df = pd.read_csv(path, parse_dates=["measured_at"])
    return df


def prepare_dataset(
    df: pd.DataFrame,
    window_days: int = WINDOW_14D,
) -> pd.DataFrame:
    """Build labelled feature matrix from raw measurements.

    For every (patient, date) where sufficient history exists, computes
    features and a binary target indicating whether a risk event occurs
    in the next :pydata:`TARGET_HORIZON_DAYS` days.

    Returns:
        DataFrame with columns: ``patient_id``, ``feature_date``,
        all feature columns, and ``target``.
    """
    df = df.sort_values(["patient_id", "measured_at"]).reset_index(drop=True)
    df["measured_at"] = pd.to_datetime(df["measured_at"])

    # Determine unique snapshot dates per patient (daily granularity)
    df["date"] = df["measured_at"].dt.normalize()
    snapshot_dates: dict[int, list[datetime]] = {}
    for pid, grp in df.groupby("patient_id"):
        unique_dates = sorted(grp["date"].unique())
        # Skip the first `window_days` dates (not enough history)
        valid_dates = [d for d in unique_dates if d >= unique_dates[0] + np.timedelta64(window_days, "D")]
        if valid_dates:
            snapshot_dates[int(pid)] = [pd.Timestamp(d).to_pydatetime() for d in valid_dates]

    # Build feature rows
    all_ref_dates: dict[int, datetime] = {}
    feature_rows: list[dict[str, object]] = []
    for pid, dates in snapshot_dates.items():
        for ref in dates:
            all_ref_dates[pid] = ref
            rows = build_features_bulk(df, {pid: ref}, window_days)
            feature_rows.extend(rows)

    feat_df = pd.DataFrame(feature_rows)
    if feat_df.empty:
        logger.warning("No feature rows produced — dataset may be too small.")
        return feat_df

    # Assign targets
    feat_df["target"] = feat_df.apply(
        lambda row: _compute_target(df, int(row["patient_id"]), row["feature_date"]),
        axis=1,
    )

    logger.info(
        "Dataset: %d rows, %d patients, target mean=%.3f",
        len(feat_df),
        feat_df["patient_id"].nunique(),
        feat_df["target"].mean(),
    )
    return feat_df


def time_split(
    feat_df: pd.DataFrame,
    val_fraction: float = VALIDATION_FRACTION,
) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Chronological train/val split — no data leakage."""
    feat_df = feat_df.sort_values("feature_date").reset_index(drop=True)
    split_idx = int(len(feat_df) * (1 - val_fraction))
    return feat_df.iloc[:split_idx].copy(), feat_df.iloc[split_idx:].copy()


# ── Internal ─────────────────────────────────────────────────────────────


def _compute_target(df: pd.DataFrame, patient_id: int, ref_date: datetime) -> int:
    """Return 1 if a risk event occurs in the horizon after ref_date."""
    horizon_end = ref_date + timedelta(days=TARGET_HORIZON_DAYS)
    future = df[
        (df["patient_id"] == patient_id)
        & (df["measured_at"] > ref_date)
        & (df["measured_at"] <= horizon_end)
    ]
    if future.empty:
        return 0

    bp_high = (future["bp_systolic"] > BP_SYS_CRITICAL).any() if "bp_systolic" in future.columns else False
    spo2_low = (future["spo2"] < SPO2_CRITICAL).any() if "spo2" in future.columns else False
    critical = future["is_critical_event"].any() if "is_critical_event" in future.columns else False

    return 1 if (bp_high or spo2_low or critical) else 0
