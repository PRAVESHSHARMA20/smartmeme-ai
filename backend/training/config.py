"""Training configuration (Phase 12)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from backend.preprocessing.config import IMAGE_SIZE, NORMALIZE_MEAN, NORMALIZE_STD
from backend.preprocessing.config import OUTPUT_DIR as PREPROCESSING_OUTPUT_DIR

CHECKPOINT_DIR = Path("backend/training/checkpoints")
OUTPUT_DIR = Path("backend/training/output")

BACKBONE = "mobilenet_v3_small"
PRETRAINED = True
FREEZE_BACKBONE = False
DROPOUT = 0.2

BATCH_SIZE = 32
NUM_EPOCHS = 15
LEARNING_RATE = 1e-4
WEIGHT_DECAY = 1e-4
NUM_WORKERS = 2
USE_CLASS_WEIGHTS = True
EARLY_STOPPING_PATIENCE = 5
RANDOM_SEED = 42


@dataclass(frozen=True)
class TrainingConfig:
    train_csv: Path
    val_csv: Path
    test_csv: Path
    label_encoder_path: Path
    checkpoint_dir: Path = CHECKPOINT_DIR
    output_dir: Path = OUTPUT_DIR
    image_size: int = IMAGE_SIZE
    normalize_mean: tuple[float, float, float] = NORMALIZE_MEAN
    normalize_std: tuple[float, float, float] = NORMALIZE_STD
    backbone: str = BACKBONE
    pretrained: bool = PRETRAINED
    freeze_backbone: bool = FREEZE_BACKBONE
    dropout: float = DROPOUT
    batch_size: int = BATCH_SIZE
    num_epochs: int = NUM_EPOCHS
    learning_rate: float = LEARNING_RATE
    weight_decay: float = WEIGHT_DECAY
    num_workers: int = NUM_WORKERS
    use_class_weights: bool = USE_CLASS_WEIGHTS
    early_stopping_patience: int = EARLY_STOPPING_PATIENCE
    random_seed: int = RANDOM_SEED
    max_samples: int | None = None

    def __post_init__(self) -> None:
        object.__setattr__(self, "train_csv", Path(self.train_csv))
        object.__setattr__(self, "val_csv", Path(self.val_csv))
        object.__setattr__(self, "test_csv", Path(self.test_csv))
        object.__setattr__(self, "label_encoder_path", Path(self.label_encoder_path))
        object.__setattr__(self, "checkpoint_dir", Path(self.checkpoint_dir))
        object.__setattr__(self, "output_dir", Path(self.output_dir))


def default_config(*, smoke_test: bool = False) -> TrainingConfig:
    base = TrainingConfig(
        train_csv=PREPROCESSING_OUTPUT_DIR / "train.csv",
        val_csv=PREPROCESSING_OUTPUT_DIR / "validation.csv",
        test_csv=PREPROCESSING_OUTPUT_DIR / "test.csv",
        label_encoder_path=PREPROCESSING_OUTPUT_DIR / "label_encoder.json",
    )
    if not smoke_test:
        return base
    return TrainingConfig(
        train_csv=base.train_csv, val_csv=base.val_csv, test_csv=base.test_csv,
        label_encoder_path=base.label_encoder_path,
        checkpoint_dir=Path("backend/training/checkpoints_smoke_test"),
        output_dir=Path("backend/training/output_smoke_test"),
        num_epochs=1, batch_size=4, num_workers=0, max_samples=40,
    )
