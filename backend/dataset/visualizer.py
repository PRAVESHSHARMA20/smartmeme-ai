"""Generates charts for the dataset report."""

from __future__ import annotations

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from backend.dataset.config import DatasetConfig
from backend.utils.logger import get_logger

logger = get_logger(__name__)
sns.set_theme(style="whitegrid")


class DatasetVisualizer:
    def __init__(self, config: DatasetConfig) -> None:
        self.config = config
        self.config.output_dir.mkdir(parents=True, exist_ok=True)
