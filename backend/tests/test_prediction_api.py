"""Integration tests for the prediction API endpoint."""

import json
import os
import pickle
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
import pytest
from fastapi.testclient import TestClient
from sklearn.ensemble import RandomForestClassifier
from sqlalchemy import create_engine, event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.main import app
from app.models.patient import HealthMeasurement, Patient
from app.models.user import User, UserRole
from ml.config import ARTIFACTS_DIR, FEATURE_SCHEMA_PATH, METADATA_PATH, MODEL_PATH
from ml.features import build_feature_names

# ── Test DB setup (in-memory SQLite with shared connection) ──────────────
_test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


# Enable foreign keys for SQLite
@event.listens_for(_test_engine, "connect")
def _set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


_TestSession = sessionmaker(bind=_test_engine, autocommit=False, autoflush=False)


def _override_get_db():
    db = _TestSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def _setup_db():
    """Create tables before each test, drop after."""
    Base.metadata.create_all(bind=_test_engine)
    yield
    Base.metadata.drop_all(bind=_test_engine)


def _seed_patient(patient_id: int = 1, n_measurements: int = 30) -> None:
    """Insert a patient and N measurement rows spanning the last 20 days."""
    db = _TestSession()
    doctor = User(
        email=f"doc{patient_id}@test.com",
        password_hash="x",
        role=UserRole.DOCTOR,
        full_name="Dr Test",
    )
    db.add(doctor)
    db.flush()

    patient = Patient(id=patient_id, doctor_id=doctor.id, full_name="Test Patient")
    db.add(patient)
    db.flush()

    now = datetime.utcnow()
    for i in range(n_measurements):
        dt = now - timedelta(days=20) + timedelta(hours=i * 16)
        m = HealthMeasurement(
            patient_id=patient_id,
            measured_at=dt,
            heart_rate=70.0 + i % 10,
            bp_systolic=120.0 + i % 5,
            bp_diastolic=80.0,
            spo2=97.0,
            glucose=5.5,
            stress_level=3.0,
            sleep_hours=7.0,
        )
        db.add(m)
    db.commit()
    db.close()


def _create_dummy_model() -> None:
    """Train a tiny RF on random data and save artifacts."""
    feature_names = build_feature_names()
    n = 50
    rng = np.random.RandomState(42)
    X = rng.rand(n, len(feature_names)).astype(np.float32)
    y = (rng.rand(n) > 0.5).astype(int)
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
                "model_version": "test_v1",
                "trained_at": "2026-01-01T00:00:00",
                "threshold": 0.5,
                "metrics": {},
                "features": feature_names,
                "train_rows": 40,
                "val_rows": 10,
            },
            f,
        )


def _reset_infer_cache() -> None:
    import ml.infer as infer_mod
    infer_mod._model = None
    infer_mod._feature_names = None
    infer_mod._metadata = None


@pytest.fixture()
def _with_model():
    """Ensure dummy model artifacts exist and reset infer cache."""
    _reset_infer_cache()
    _create_dummy_model()
    yield
    _reset_infer_cache()
    for p in (MODEL_PATH, FEATURE_SCHEMA_PATH, METADATA_PATH):
        p.unlink(missing_ok=True)


class TestHappyPath:
    def test_200(self, _with_model: None) -> None:
        _seed_patient(patient_id=1)
        resp = client.get("/api/v1/prediction/1")
        assert resp.status_code == 200
        body = resp.json()
        assert body["patient_id"] == 1
        assert 0.0 <= body["risk_probability"] <= 1.0
        assert body["risk_level"] in ("low", "medium", "high")
        assert "threshold" in body
        assert "model_version" in body
        assert isinstance(body["top_factors"], list)


class TestErrorCases:
    def test_404_patient_not_found(self, _with_model: None) -> None:
        resp = client.get("/api/v1/prediction/9999")
        assert resp.status_code == 404

    def test_422_insufficient_data(self, _with_model: None) -> None:
        _seed_patient(patient_id=2, n_measurements=1)
        resp = client.get("/api/v1/prediction/2")
        assert resp.status_code == 422

    def test_503_model_not_loaded(self) -> None:
        _reset_infer_cache()
        for p in (MODEL_PATH, FEATURE_SCHEMA_PATH, METADATA_PATH):
            p.unlink(missing_ok=True)

        _seed_patient(patient_id=3)
        resp = client.get("/api/v1/prediction/3")
        assert resp.status_code == 503
