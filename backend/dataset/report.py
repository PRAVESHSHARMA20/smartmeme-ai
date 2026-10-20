"""Orchestrates the full dataset analysis pipeline (Phase 10 CLI report)."""

from __future__ import annotations

from backend.dataset.config import DatasetConfig
from backend.dataset.csv_loader import CSVLoader
from backend.dataset.merger import DatasetMerger
from backend.dataset.scanner import ImageScanner
from backend.dataset.validator import DatasetValidator
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class DatasetReport:
    def __init__(self, config: DatasetConfig) -> None:
        self.config = config
        self.csv_loader = CSVLoader(config.csv_path, config.filename_column, config.label_column)
        self.scanner = ImageScanner(config.dataset_root, hash_size=config.hash_size, exclude_paths={config.csv_path})
        self.merger = DatasetMerger()
        self.validator = DatasetValidator()
