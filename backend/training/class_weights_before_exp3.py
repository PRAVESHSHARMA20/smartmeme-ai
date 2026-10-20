"""Computes class weights for a weighted loss function."""

from __future__ import annotations

import numpy as np


def compute_class_weights(label_ids: list, num_classes: int) -> np.ndarray:
    counts = np.bincount(label_ids, minlength=num_classes).astype(np.float64)
    total = counts.sum()
    weights = np.ones(num_classes, dtype=np.float64)
    nonzero = counts > 0
    weights[nonzero] = total / (num_classes * counts[nonzero])
    return weights
