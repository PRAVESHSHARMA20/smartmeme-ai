"""Evaluates a trained multimodal checkpoint on the test set (Phase 13).
NOT run until after training + validation-based model selection."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import DataLoader
from transformers import AutoTokenizer

from backend.models.image_model import ImageSentimentClassifier
from backend.models.multimodal_model import MultimodalSentimentClassifier
from backend.models.text_encoder import TextEncoder
from backend.preprocessing.encoder import LabelEncoder
from backend.training.metrics import EvaluationMetrics, compute_metrics
from backend.training.multimodal_config import MultimodalConfig
from backend.training.multimodal_dataset import MultimodalMemeDataset
from backend.training.train import get_device
from backend.utils.logger import get_logger
from backend.utils.progress import progress_iter

logger = get_logger(__name__)


def load_multimodal_model_from_checkpoint(checkpoint_path: Path, num_classes: int, device: torch.device):
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    image_encoder = ImageSentimentClassifier(num_classes=checkpoint["num_classes"], backbone_name=checkpoint["image_backbone"], pretrained=False)
    text_encoder = TextEncoder(model_name=checkpoint["text_model_name"], pooling=checkpoint.get("text_pooling", "mean"))
    model = MultimodalSentimentClassifier(num_classes=checkpoint["num_classes"], image_encoder=image_encoder, text_encoder=text_encoder, fusion_hidden_dim=checkpoint.get("fusion_hidden_dim", 256))
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    if checkpoint.get("num_classes") != num_classes:
        raise ValueError(f"Checkpoint mismatch: expected {num_classes} classes, found {checkpoint.get('num_classes')}.")
    return model, checkpoint


def evaluate_multimodal(config: MultimodalConfig, checkpoint_path: Path, split: str = "test") -> EvaluationMetrics:
    device = get_device()
    encoder = LabelEncoder.load(config.label_encoder_path)
    model, checkpoint = load_multimodal_model_from_checkpoint(checkpoint_path, encoder.num_classes, device)
    tokenizer = AutoTokenizer.from_pretrained(checkpoint["text_model_name"])
    csv_path = {"train": config.train_csv, "validation": config.val_csv, "test": config.test_csv}[split]

    dataset = MultimodalMemeDataset(
        csv_path, config.original_labels_csv, config.filename_column, tokenizer,
        checkpoint.get("max_text_length", config.max_text_length), checkpoint.get("image_size", config.image_size),
        checkpoint.get("normalize_mean", config.normalize_mean), checkpoint.get("normalize_std", config.normalize_std),
        max_samples=config.max_samples, random_seed=config.random_seed,
    )
    loader = DataLoader(dataset, batch_size=config.batch_size, shuffle=False, num_workers=config.num_workers)

    all_preds, all_labels = [], []
    with torch.no_grad():
        for batch in progress_iter(loader, desc=f"Evaluating multimodal model on {split}", total=len(loader)):
            images = batch["image"].to(device)
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            logits = model(images, input_ids, attention_mask)
            all_preds.extend(logits.argmax(dim=1).cpu().tolist())
            all_labels.extend(batch["label"].tolist())

    metrics = compute_metrics(np.array(all_labels), np.array(all_preds), encoder.classes_)
    _save_metrics(config, metrics, split, checkpoint, len(dataset))
    return metrics


def _save_metrics(config, metrics, split, checkpoint, n) -> Path:
    config.output_dir.mkdir(parents=True, exist_ok=True)
    path = config.output_dir / f"{split}_metrics.json"
    payload = {"split": split, "sample_count": n, "checkpoint_epoch": checkpoint.get("epoch"), **metrics.to_dict()}
    path.write_text(json.dumps(payload, indent=2))
    return path



def run_test_evaluation() -> EvaluationMetrics:
    from backend.training.multimodal_config import default_config

    config = default_config(smoke_test=False)

    # Use Experiment 2's isolated checkpoint and output folders.
    config = MultimodalConfig(
        **{
            field_name: getattr(config, field_name)
            for field_name in config.__dataclass_fields__
        }
    )
    from dataclasses import replace

    config = replace(
        config,
        checkpoint_dir=Path("backend/training/checkpoints_multimodal_exp2"),
        output_dir=Path("backend/training/output_multimodal_exp2"),
    )

    checkpoint_path = config.checkpoint_dir / "best_model.pt"

    if not checkpoint_path.exists():
        raise FileNotFoundError(
            f"Experiment 2 checkpoint not found: {checkpoint_path}"
        )

    print(f"Evaluating checkpoint: {checkpoint_path}")
    print(f"Saving metrics to: {config.output_dir}")

    metrics = evaluate_multimodal(config, checkpoint_path, split="test")
    print(json.dumps(metrics.to_dict(), indent=2))
    return metrics


if __name__ == "__main__":
    run_test_evaluation()
