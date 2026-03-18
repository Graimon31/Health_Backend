"""ML pipeline configuration — single source of truth for all constants."""

from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────
ARTIFACTS_DIR: Path = Path(__file__).parent / "artifacts"
MODEL_PATH: Path = ARTIFACTS_DIR / "model.pkl"
FEATURE_SCHEMA_PATH: Path = ARTIFACTS_DIR / "feature_schema.json"
METADATA_PATH: Path = ARTIFACTS_DIR / "metadata.json"

# ── Feature-engineering windows (days) ───────────────────────────────────
WINDOW_3D: int = 3
WINDOW_7D: int = 7
WINDOW_14D: int = 14
MIN_MEASUREMENTS: int = 3  # minimum records to build features

# ── Signals → DB column mapping ──────────────────────────────────────────
SIGNAL_COLUMNS: dict[str, str] = {
    "hr": "heart_rate",
    "bp_sys": "bp_systolic",
    "bp_dia": "bp_diastolic",
    "spo2": "spo2",
    "glucose": "glucose",
    "stress": "stress_level",
    "sleep": "sleep_hours",
}

# ── Target definition ────────────────────────────────────────────────────
TARGET_HORIZON_DAYS: int = 7
BP_SYS_CRITICAL: float = 150.0
SPO2_CRITICAL: float = 93.0

# ── Risk-level thresholds (multiplier of the learned threshold) ──────────
RISK_MEDIUM_FACTOR: float = 0.7  # medium when prob >= threshold * factor

# ── Training defaults ────────────────────────────────────────────────────
VALIDATION_FRACTION: float = 0.2  # chronological split
MIN_RECALL_CONSTRAINT: float = 0.8
DEFAULT_THRESHOLD: float = 0.5

# ── LightGBM default hyper-parameters ────────────────────────────────────
LGBM_PARAMS: dict[str, object] = {
    "n_estimators": 300,
    "max_depth": 6,
    "learning_rate": 0.05,
    "num_leaves": 31,
    "subsample": 0.8,
    "colsample_bytree": 0.8,
    "min_child_samples": 10,
    "random_state": 42,
    "n_jobs": -1,
    "verbose": -1,
}
