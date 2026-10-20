"""Configuration for the preprocessing pipeline."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from backend.dataset.config import default_config as dataset_default_config

IMAGE_SIZE = 224
PAD_COLOR = (0, 0, 0)
NORMALIZE_MEAN: tuple[float, float, float] | None = (0.485, 0.456, 0.406)
NORMALIZE_STD: tuple[float, float, float] | None = (0.229, 0.224, 0.225)

BATCH_SIZE = 32
TRAIN_RATIO = 0.70
VAL_RATIO = 0.15
TEST_RATIO = 0.15
RANDOM_SEED = 42

OUTPUT_DIR = Path("backend/preprocessing/output")


@dataclass(frozen=True)
class PreprocessingConfig:
    dataset_root: Path
    csv_path: Path
    filename_column: str
    label_column: str
    output_dir: Path = OUTPUT_DIR
    image_size: int = IMAGE_SIZE
    pad_color: tuple[int, int, int] = PAD_COLOR
    normalize_mean: tuple[float, float, float] | None = NORMALIZE_MEAN
    normalize_std: tuple[float, float, float] | None = NORMALIZE_STD
    batch_size: int = BATCH_SIZE
    train_ratio: float = TRAIN_RATIO
    val_ratio: float = VAL_RATIO
    test_ratio: float = TEST_RATIO
    random_seed: int = RANDOM_SEED

    def __post_init__(self) -> None:
        object.__setattr__(self, "dataset_root", Path(self.dataset_root))
        object.__setattr__(self, "csv_path", Path(self.csv_path))
        object.__setattr__(self, "output_dir", Path(self.output_dir))
        ratio_sum = round(self.train_ratio + self.val_ratio + self.test_ratio, 6)
        if ratio_sum != 1.0:
            raise ValueError(f"train/val/test ratios must sum to 1.0, got {ratio_sum}")


def default_config() -> PreprocessingConfig:
    ds = dataset_default_config()
    return PreprocessingConfig(
        dataset_root=ds.dataset_root, csv_path=ds.csv_path,
        filename_column=ds.filename_column, label_column=ds.label_column,
    )
