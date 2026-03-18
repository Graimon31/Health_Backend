"""Training pipeline — build dataset, fit model, evaluate, save artifacts.

Usage:
    python -m ml.train --source db
    python -m ml.train --source csv --path data/train.csv
"""

import argparse
import json
import logging
import pickle
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    average_precision_score,
    classification_report,
    f1_score,
    precision_recall_curve,
    precision_score,
    recall_score,
    roc_auc_score,
)

from ml.config import (
    ARTIFACTS_DIR,
    DEFAULT_THRESHOLD,
    FEATURE_SCHEMA_PATH,
    LGBM_PARAMS,
    METADATA_PATH,
    MIN_RECALL_CONSTRAINT,
    MODEL_PATH,
)
from ml.dataset import load_from_csv, load_from_db, prepare_dataset, time_split
from ml.features import build_feature_names
from ml.schemas import TrainResult

logger = logging.getLogger(__name__)


def _get_classifier() -> object:
    """Return the best available gradient-boosting classifier."""
    try:
        from lightgbm import LGBMClassifier
        logger.info("Using LightGBM classifier.")
        return LGBMClassifier(**LGBM_PARAMS)
    except ImportError:
        pass

    try:
        from xgboost import XGBClassifier
        params = {
            k: v for k, v in LGBM_PARAMS.items()
            if k not in ("num_leaves", "min_child_samples", "verbose")
        }
        params["use_label_encoder"] = False
        params["eval_metric"] = "logloss"
        logger.info("LightGBM unavailable — falling back to XGBoost.")
        return XGBClassifier(**params)
    except ImportError:
        pass

    from sklearn.ensemble import RandomForestClassifier
    logger.info("LightGBM & XGBoost unavailable — falling back to RandomForest.")
    return RandomForestClassifier(
        n_estimators=300, max_depth=6, random_state=42, n_jobs=-1
    )


def _find_best_threshold(
    y_true: np.ndarray,
    y_prob: np.ndarray,
    min_recall: float = MIN_RECALL_CONSTRAINT,
) -> float:
    """Select threshold that maximizes F1 while keeping recall >= min_recall."""
    precisions, recalls, thresholds = precision_recall_curve(y_true, y_prob)
    best_f1 = 0.0
    best_thr = DEFAULT_THRESHOLD
    for p, r, t in zip(precisions, recalls, thresholds):
        if r < min_recall:
            continue
        f1 = 2 * p * r / (p + r) if (p + r) > 0 else 0.0
        if f1 > best_f1:
            best_f1 = f1
            best_thr = float(t)
    return best_thr


def train(
    source: str = "db",
    csv_path: Path | None = None,
) -> TrainResult:
    """Run the full training pipeline.

    Args:
        source: ``"db"`` or ``"csv"``.
        csv_path: Path to CSV when ``source="csv"``.

    Returns:
        :class:`TrainResult` with metrics and artifact info.
    """
    # 1. Load raw data
    if source == "csv":
        if csv_path is None:
            raise ValueError("csv_path is required when source='csv'")
        raw_df = load_from_csv(csv_path)
    else:
        from app.db import SessionLocal
        with SessionLocal() as session:
            raw_df = load_from_db(session)

    logger.info("Loaded %d raw measurement rows.", len(raw_df))

    # 2. Feature engineering + target labelling
    feat_df = prepare_dataset(raw_df)
    if feat_df.empty:
        raise RuntimeError("Empty feature dataset — cannot train.")

    # 3. Time-based split
    train_df, val_df = time_split(feat_df)
    feature_cols = build_feature_names()

    X_train = train_df[feature_cols].values.astype(np.float32)
    y_train = train_df["target"].values.astype(int)
    X_val = val_df[feature_cols].values.astype(np.float32)
    y_val = val_df["target"].values.astype(int)

    # Replace any remaining NaN/inf
    X_train = np.nan_to_num(X_train, nan=0.0, posinf=0.0, neginf=0.0)
    X_val = np.nan_to_num(X_val, nan=0.0, posinf=0.0, neginf=0.0)

    logger.info("Train: %d rows | Val: %d rows", len(X_train), len(X_val))

    # 4. Train
    model = _get_classifier()
    model.fit(X_train, y_train)

    # 5. Evaluate
    y_prob = model.predict_proba(X_val)[:, 1]
    roc_auc = float(roc_auc_score(y_val, y_prob)) if len(np.unique(y_val)) > 1 else 0.0
    pr_auc = float(average_precision_score(y_val, y_prob)) if len(np.unique(y_val)) > 1 else 0.0

    threshold = _find_best_threshold(y_val, y_prob)
    y_pred = (y_prob >= threshold).astype(int)

    recall = float(recall_score(y_val, y_pred, zero_division=0))
    precision = float(precision_score(y_val, y_pred, zero_division=0))
    f1 = float(f1_score(y_val, y_pred, zero_division=0))

    logger.info("ROC-AUC=%.4f  PR-AUC=%.4f  Threshold=%.4f", roc_auc, pr_auc, threshold)
    logger.info("Recall=%.4f  Precision=%.4f  F1=%.4f", recall, precision, f1)
    logger.info("\n%s", classification_report(y_val, y_pred, zero_division=0))

    # 6. Save artifacts
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    model_version = f"risk_lgbm_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M')}"

    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    with open(FEATURE_SCHEMA_PATH, "w") as f:
        json.dump({"features": feature_cols}, f, indent=2)

    metadata = {
        "model_name": type(model).__name__.lower(),
        "model_version": model_version,
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "threshold": threshold,
        "metrics": {
            "roc_auc": roc_auc,
            "pr_auc": pr_auc,
            "recall": recall,
            "precision": precision,
            "f1": f1,
        },
        "features": feature_cols,
        "train_rows": int(len(X_train)),
        "val_rows": int(len(X_val)),
    }
    with open(METADATA_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    logger.info("Artifacts saved to %s", ARTIFACTS_DIR)

    return TrainResult(
        model_version=model_version,
        threshold=threshold,
        roc_auc=roc_auc,
        pr_auc=pr_auc,
        recall=recall,
        precision=precision,
        f1=f1,
        train_rows=len(X_train),
        val_rows=len(X_val),
    )


def main() -> None:
    """CLI entry-point."""
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    parser = argparse.ArgumentParser(description="Train ML risk-prediction model")
    parser.add_argument("--source", choices=["db", "csv"], default="db")
    parser.add_argument("--path", type=str, default=None, help="CSV path (required if source=csv)")
    args = parser.parse_args()

    result = train(
        source=args.source,
        csv_path=Path(args.path) if args.path else None,
    )
    print(f"\nTraining complete: {result}")


if __name__ == "__main__":
    main()
