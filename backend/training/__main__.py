"""CLI entry point for FULL training.

Usage:
    python -m backend.training

This trains on the complete train.csv (4,817 images per your Phase 11
run) for config.NUM_EPOCHS epochs. Run the smoke test first:
    python -m backend.training.smoke_test
"""

from __future__ import annotations

import sys

from backend.training.config import default_config
from backend.training.evaluate import evaluate
from backend.training.train import Trainer
from backend.utils.logger import get_logger

logger = get_logger(__name__)


def main() -> int:
    config = default_config(smoke_test=False)

    logger.info("Starting FULL training run.")
    logger.info("Train CSV: %s", config.train_csv)
    logger.info("Batch size: %d | Epochs: %d | Backbone: %s", config.batch_size, config.num_epochs, config.backbone)

    trainer = Trainer(config)
    result = trainer.train()

    logger.info("Training complete. Best val_f1_macro: %.4f", result["best_val_f1_macro"])
    logger.info("Running final evaluation on the TEST set (untouched until now)...")

    best_checkpoint = config.checkpoint_dir / "best_model.pt"
    evaluate(config, best_checkpoint, split="test")

    logger.info("Phase 12 training + evaluation complete. See %s for all outputs.", config.output_dir.resolve())
    return 0


if __name__ == "__main__":
    sys.exit(main())
