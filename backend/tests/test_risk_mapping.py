"""Tests for risk-level classification boundaries."""

import pytest

from ml.infer import _classify_risk


class TestClassifyRisk:
    """Verify low / medium / high boundaries relative to threshold."""

    @pytest.mark.parametrize(
        "prob, threshold, expected",
        [
            # High: prob >= threshold
            (0.70, 0.65, "high"),
            (0.65, 0.65, "high"),
            (1.00, 0.50, "high"),
            # Medium: prob >= threshold * 0.7 and < threshold
            (0.50, 0.65, "medium"),  # 0.65*0.7 = 0.455
            (0.455, 0.65, "medium"),
            # Low: prob < threshold * 0.7
            (0.30, 0.65, "low"),
            (0.00, 0.50, "low"),
            (0.34, 0.50, "low"),  # 0.5*0.7 = 0.35
        ],
    )
    def test_boundary(self, prob: float, threshold: float, expected: str) -> None:
        assert _classify_risk(prob, threshold) == expected

    def test_exact_medium_boundary(self) -> None:
        """prob exactly at threshold*0.7 should be medium."""
        threshold = 0.60
        boundary = threshold * 0.7  # 0.42
        assert _classify_risk(boundary, threshold) == "medium"

    def test_just_below_medium(self) -> None:
        threshold = 0.60
        just_below = threshold * 0.7 - 0.001
        assert _classify_risk(just_below, threshold) == "low"
