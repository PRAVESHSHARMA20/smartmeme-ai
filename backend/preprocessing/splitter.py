"""Stratified train/validation/test splitting."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from backend.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class SplitResult:
    train_df: pd.DataFrame
    val_df: pd.DataFrame
    test_df: pd.DataFrame


class DatasetSplitter:
    def __init__(self, train_ratio: float, val_ratio: float, test_ratio: float, random_seed: int = 42) -> None:
        self.train_ratio = train_ratio
        self.val_ratio = val_ratio
        self.test_ratio = test_ratio
        self.random_seed = random_seed

    def split(self, df: pd.DataFrame, label_column: str = "label") -> SplitResult:
        rng = np.random.default_rng(self.random_seed)
        train_parts, val_parts, test_parts = [], [], []

        for label, group in df.groupby(label_column):
            shuffled = group.sample(frac=1.0, random_state=rng.integers(0, 2**31 - 1)).reset_index(drop=True)
            n = len(shuffled)
            n_train = round(n * self.train_ratio)
            n_val = round(n * self.val_ratio)
            n_test = n - n_train - n_val
            if n_train == 0 or n_val == 0 or n_test == 0:
                logger.warning("Label '%s' has only %d image(s) — one or more splits will be empty.", label, n)
            train_parts.append(shuffled.iloc[:n_train])
            val_parts.append(shuffled.iloc[n_train:n_train + n_val])
            test_parts.append(shuffled.iloc[n_train + n_val:])

        def _combine(parts):
            if not parts:
                return pd.DataFrame(columns=df.columns)
            return pd.concat(parts, ignore_index=True).sample(frac=1.0, random_state=self.random_seed).reset_index(drop=True)

        result = SplitResult(train_df=_combine(train_parts), val_df=_combine(val_parts), test_df=_combine(test_parts))
        logger.info("Split complete: train=%d, validation=%d, test=%d", len(result.train_df), len(result.val_df), len(result.test_df))
        return result
