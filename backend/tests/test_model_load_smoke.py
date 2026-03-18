"""Smoke tests — model artifact loading and predict_proba output range."""

import json
import pickle
from pathlib import Path

import numpy as np
import pytest
from sklearn.ensemble import RandomForestClassifier

from ml.config import ARTIFACTS_DIR, FEATURE_SCHEMA_PATH, METADATA_PATH, MODEL_PATH
from ml.features import build_feature_names
from ml.infer import is_loaded, load_artifacts, predict


@pytest.fixture(autouse=True)
def _reset_infer_cache():
    """Reset module-level cache before/after each test."""
    import ml.infer as mod
    mod._model = None
    mod._feature_names = None
    mod._metadata = None
    yield
    mod._model = None
    mod._feature_names = None
    mod._metadata = None


def _create_artifacts() -> None:
    feature_names = build_feature_names()
    n = 50
    X = np.random.rand(n, len(feature_names)).astype(np.float32)
    y = (np.random.rand(n) > 0.5).astype(int)
    model = RandomForestClassifier(n_estimators=5, random_state=42)
    model.fit(X, y)

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    with open(FEATURE_SCHEMA_PATH, "w") as f:
        json.dump({"features": feature_names}, f)
    with open(METADATA_PATH, "w") as f:
        json.dump(
            {
                "model_name": "randomforestclassifier",
                "model_version": "smoke_test",
                "trained_at": "2026-01-01T00:00:00",
                "threshold": 0.5,
                "metrics": {},
                "features": feature_names,
                "train_rows": 40,
                "val_rows": 10,
            },
            f,
        )


@pytest.fixture()
def _with_artifacts():
    _create_artifacts()
    yield
    for p in (MODEL_PATH, FEATURE_SCHEMA_PATH, METADATA_PATH):
        p.unlink(missing_ok=True)


class TestLoadArtifacts:
    def test_load_success(self, _with_artifacts: None) -> None:
        load_artifacts()
        assert is_loaded()

    def test_load_missing_raises(self) -> None:
        for p in (MODEL_PATH, FEATURE_SCHEMA_PATH, METADATA_PATH):
            p.unlink(missing_ok=True)
        with pytest.raises(FileNotFoundError):
            load_artifacts()

    def test_idempotent(self, _with_artifacts: None) -> None:
        load_artifacts()
        load_artifacts()
        assert is_loaded()


class TestPredict:
    def test_probability_range(self, _with_artifacts: None) -> None:
        load_artifacts()
        feature_names = build_feature_names()
        dummy_features = {name: float(np.random.rand()) for name in feature_names}
        result = predict(dummy_features)
        assert 0.0 <= result.risk_probability <= 1.0
        assert result.risk_level in ("low", "medium", "high")

    def test_predict_without_load_raises(self) -> None:
        feature_names = build_feature_names()
        dummy_features = {name: 0.0 for name in feature_names}
        with pytest.raises(RuntimeError, match="not loaded"):
            predict(dummy_features)
