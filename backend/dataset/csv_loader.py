"""Loads the labels CSV."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from backend.utils.logger import get_logger

logger = get_logger(__name__)


class CSVLoadError(Exception):
    pass


class CSVLoader:
    def __init__(self, csv_path: Path, filename_column: str, label_column: str) -> None:
        self.csv_path = Path(csv_path)
        self.filename_column = filename_column
        self.label_column = label_column

    def load(self) -> pd.DataFrame:
        if not self.csv_path.exists():
            raise CSVLoadError(f"Labels CSV not found: {self.csv_path}")
        try:
            df = pd.read_csv(self.csv_path)
        except Exception as exc:
            raise CSVLoadError(f"Failed to read CSV at {self.csv_path}: {exc}") from exc

        missing = [c for c in (self.filename_column, self.label_column) if c not in df.columns]
        if missing:
            raise CSVLoadError(
                f"CSV is missing expected column(s): {missing}. Found columns: {list(df.columns)}. "
                "Update CSV_FILENAME_COLUMN / CSV_LABEL_COLUMN in backend/dataset/config.py."
            )

        result = df[[self.filename_column, self.label_column]].rename(
            columns={self.filename_column: "filename", self.label_column: "label"}
        )
        result["filename"] = result["filename"].astype(str).str.strip()
        result["label"] = result["label"].astype(str).str.strip()
        logger.info("Loaded %d label rows from %s", len(result), self.csv_path)
        return result
