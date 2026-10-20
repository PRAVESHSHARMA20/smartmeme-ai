"""Configuration for multimodal (image + text) training (Phase 13)."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from backend.dataset.config import CSV_PATH as ORIGINAL_LABELS_CSV_PATH
from backend.dataset.config import CSV_FILENAME_COLUMN
from backend.preprocessing.config import IMAGE_SIZE, NORMALIZE_MEAN, NORMALIZE_STD
from backend.preprocessing.config import OUTPUT_DIR as PREPROCESSING_OUTPUT_DIR
from backend.training.config import CHECKPOINT_DIR as IMAGE_CHECKPOINT_DIR

CHECKPOINT_DIR = Path("backend/training/checkpoints_multimodal")
OUTPUT_DIR = Path("backend/training/output_multimodal")

TEXT_MODEL_NAME = "distilbert-base-uncased"
MAX_TEXT_LENGTH = 64
TEXT_POOLING = "mean"
FREEZE_TEXT_BACKBONE = False
FREEZE_IMAGE_BACKBONE = True

IMAGE_BACKBONE = "mobilenet_v3_small"
IMAGE_PRETRAINED_CHECKPOINT: Path | None = IMAGE_CHECKPOINT_DIR / "best_model.pt"

FUSION_HIDDEN_DIM = 256
DROPOUT = 0.5

BATCH_SIZE = 16
NUM_EPOCHS = 15
LEARNING_RATE = 1e-5
WEIGHT_DECAY = 1e-3
NUM_WORKERS = 2
USE_CLASS_WEIGHTS = True
EARLY_STOPPING_PATIENCE = 5
RANDOM_SEED = 42


@dataclass(frozen=True)
class MultimodalConfig:
    train_csv: Path
    val_csv: Path
    test_csv: Path
    label_encoder_path: Path
    original_labels_csv: Path
    filename_column: str
    checkpoint_dir: Path = CHECKPOINT_DIR
    output_dir: Path = OUTPUT_DIR
    image_size: int = IMAGE_SIZE
    normalize_mean: tuple = NORMALIZE_MEAN
    normalize_std: tuple = NORMALIZE_STD
    image_backbone: str = IMAGE_BACKBONE
    image_pretrained_checkpoint: Path | None = IMAGE_PRETRAINED_CHECKPOINT
    freeze_image_backbone: bool = FREEZE_IMAGE_BACKBONE
    text_model_name: str = TEXT_MODEL_NAME
    max_text_length: int = MAX_TEXT_LENGTH
    text_pooling: str = TEXT_POOLING
    freeze_text_backbone: bool = FREEZE_TEXT_BACKBONE
    fusion_hidden_dim: int = FUSION_HIDDEN_DIM
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
        object.__setattr__(self, "original_labels_csv", Path(self.original_labels_csv))
        object.__setattr__(self, "checkpoint_dir", Path(self.checkpoint_dir))
        object.__setattr__(self, "output_dir", Path(self.output_dir))
        if self.image_pretrained_checkpoint is not None:
            object.__setattr__(self, "image_pretrained_checkpoint", Path(self.image_pretrained_checkpoint))


def default_config(*, smoke_test: bool = False) -> MultimodalConfig:
    base = MultimodalConfig(
        train_csv=PREPROCESSING_OUTPUT_DIR / "train.csv",
        val_csv=PREPROCESSING_OUTPUT_DIR / "validation.csv",
        test_csv=PREPROCESSING_OUTPUT_DIR / "test.csv",
        label_encoder_path=PREPROCESSING_OUTPUT_DIR / "label_encoder.json",
        original_labels_csv=ORIGINAL_LABELS_CSV_PATH,
        filename_column=CSV_FILENAME_COLUMN,
    )
    if not smoke_test:
        return base
    return MultimodalConfig(
        train_csv=base.train_csv, val_csv=base.val_csv, test_csv=base.test_csv,
        label_encoder_path=base.label_encoder_path, original_labels_csv=base.original_labels_csv,
        filename_column=base.filename_column,
        checkpoint_dir=Path("backend/training/checkpoints_multimodal_tuned"),
        output_dir=Path("backend/training/output_multimodal_tuned"),
        num_epochs=1, batch_size=2, num_workers=0, max_samples=8,
        image_pretrained_checkpoint=None,
    )
