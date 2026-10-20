"""Configuration for the dataset analysis module."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

DATASET_ROOT = Path(r"C:\Users\Pravesh Kumar\Desktop\6992 Meme Images Dataset with Labels\images")
CSV_PATH = Path(r"C:\Users\Pravesh Kumar\Desktop\6992 Meme Images Dataset with Labels\labels.csv")
OUTPUT_DIR = Path("./output")

CSV_FILENAME_COLUMN = "image_name"
CSV_LABEL_COLUMN = "overall_sentiment"


@dataclass(frozen=True)
class DatasetConfig:
    dataset_root: Path
    csv_path: Path
    output_dir: Path = Path("./output")
    filename_column: str = "filename"
    label_column: str = "label"
    imbalance_ratio_threshold: float = 3.0
    samples_per_label: int = 4
    hash_size: int = 8

    def __post_init__(self) -> None:
        object.__setattr__(self, "dataset_root", Path(self.dataset_root))
        object.__setattr__(self, "csv_path", Path(self.csv_path))
        object.__setattr__(self, "output_dir", Path(self.output_dir))


def default_config() -> DatasetConfig:
    return DatasetConfig(
        dataset_root=DATASET_ROOT,
        csv_path=CSV_PATH,
        output_dir=OUTPUT_DIR,
        filename_column=CSV_FILENAME_COLUMN,
        label_column=CSV_LABEL_COLUMN,
    )
