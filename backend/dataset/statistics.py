"""Descriptive statistics over a scanned dataset."""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from backend.dataset.config import DatasetConfig
from backend.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ImbalanceResult:
    ratio: float
    is_imbalanced: bool
    largest_class: str
    smallest_class: str
    threshold: float


class DatasetStatistics:
    def __init__(self, config: DatasetConfig) -> None:
        self.config = config

    def class_counts(self, index) -> pd.Series:
        counts = {cls: len(paths) for cls, paths in index.classes.items()}
        return pd.Series(counts, name="image_count").sort_values(ascending=False)

    def class_imbalance(self, counts: pd.Series) -> ImbalanceResult:
        largest_class = str(counts.idxmax())
        smallest_class = str(counts.idxmin())
        ratio = float(counts.max() / counts.min()) if counts.min() > 0 else float("inf")
        return ImbalanceResult(
            ratio=ratio, is_imbalanced=ratio > self.config.imbalance_ratio_threshold,
            largest_class=largest_class, smallest_class=smallest_class,
            threshold=self.config.imbalance_ratio_threshold,
        )
