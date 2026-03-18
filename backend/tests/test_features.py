"""Tests for ml.features — aggregation correctness, ordering, missing handling."""

from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import pytest

from ml.config import MIN_MEASUREMENTS, SIGNAL_COLUMNS
from ml.features import build_feature_names, build_features_for_patient


def _make_df(n: int = 20, days_back: int = 14) -> pd.DataFrame:
    """Create synthetic measurement DataFrame for a single patient."""
    now = datetime(2026, 3, 18, 12, 0, 0)
    records = []
    for i in range(n):
        dt = now - timedelta(days=days_back) + timedelta(days=i * days_back / n)
        records.append(
            {
                "measured_at": dt,
                "heart_rate": 70.0 + i,
                "bp_systolic": 120.0 + i * 0.5,
                "bp_diastolic": 80.0 - i * 0.2,
                "spo2": 97.0 - i * 0.1,
                "glucose": 5.0 + i * 0.05,
                "stress_level": 3.0 + i * 0.1,
                "sleep_hours": 7.0 + (i % 3) * 0.5,
            }
        )
    return pd.DataFrame(records)


class TestBuildFeatureNames:
    def test_count(self) -> None:
        names = build_feature_names()
        # 7 signals × 11 features each = 77
        assert len(names) == 7 * 11

    def test_unique(self) -> None:
        names = build_feature_names()
        assert len(names) == len(set(names))

    def test_contains_expected(self) -> None:
        names = build_feature_names()
        assert "hr_mean_7d" in names
        assert "spo2_last_value" in names
        assert "bp_sys_trend_14d" in names
        assert "sleep_missing_count_14d" in names


class TestBuildFeaturesForPatient:
    def test_returns_all_features(self) -> None:
        df = _make_df()
        ref = datetime(2026, 3, 18, 12, 0, 0)
        feats = build_features_for_patient(df, ref)
        expected_names = build_feature_names()
        assert set(feats.keys()) == set(expected_names)

    def test_mean_values_reasonable(self) -> None:
        df = _make_df()
        ref = datetime(2026, 3, 18, 12, 0, 0)
        feats = build_features_for_patient(df, ref)
        # HR ranges from 70..89 → mean should be in that range
        assert 60.0 < feats["hr_mean_14d"] < 100.0

    def test_trend_sign(self) -> None:
        df = _make_df()
        ref = datetime(2026, 3, 18, 12, 0, 0)
        feats = build_features_for_patient(df, ref)
        # HR increases over time in our synthetic data
        assert feats["hr_trend_14d"] > 0

    def test_no_nan_or_inf(self) -> None:
        df = _make_df()
        ref = datetime(2026, 3, 18, 12, 0, 0)
        feats = build_features_for_patient(df, ref)
        for k, v in feats.items():
            assert np.isfinite(v), f"{k} is not finite: {v}"

    def test_insufficient_data_raises(self) -> None:
        df = _make_df(n=1)
        ref = datetime(2026, 3, 18, 12, 0, 0)
        with pytest.raises(ValueError, match="Insufficient data"):
            build_features_for_patient(df, ref)

    def test_missing_signal_columns_handled(self) -> None:
        """If a signal column is absent, features should be 0.0."""
        df = _make_df()
        df = df.drop(columns=["glucose"])
        ref = datetime(2026, 3, 18, 12, 0, 0)
        feats = build_features_for_patient(df, ref)
        assert feats["glucose_mean_7d"] == 0.0
        assert feats["glucose_last_value"] == 0.0

    def test_all_nulls_handled(self) -> None:
        """Signal column present but all NaN should produce 0.0 features."""
        df = _make_df()
        df["heart_rate"] = np.nan
        ref = datetime(2026, 3, 18, 12, 0, 0)
        feats = build_features_for_patient(df, ref)
        assert feats["hr_mean_7d"] == 0.0
        assert feats["hr_missing_count_14d"] == float(len(df[
            (df["measured_at"] >= ref - timedelta(days=14)) &
            (df["measured_at"] <= ref)
        ]))
