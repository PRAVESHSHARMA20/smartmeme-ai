"""Orchestrates the full preprocessing pipeline (Phase 11)."""

from __future__ import annotations

from backend.dataset.csv_loader import CSVLoader
from backend.dataset.merger import DatasetMerger
from backend.dataset.scanner import ImageScanner
from backend.dataset.validator import DatasetValidator
from backend.preprocessing.config import PreprocessingConfig
from backend.preprocessing.encoder import LabelEncoder
from backend.preprocessing.splitter import DatasetSplitter
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class PreprocessingPipeline:
    def __init__(self, config: PreprocessingConfig) -> None:
        self.config = config
        self.csv_loader = CSVLoader(config.csv_path, config.filename_column, config.label_column)
        self.scanner = ImageScanner(config.dataset_root, hash_size=8, exclude_paths={config.csv_path})
        self.merger = DatasetMerger()
        self.validator = DatasetValidator()
        self.splitter = DatasetSplitter(config.train_ratio, config.val_ratio, config.test_ratio, config.random_seed)
        self.encoder = LabelEncoder()
