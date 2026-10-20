"""Loads a saved checkpoint and evaluates it on the test set (Phase 12)."""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import torch
from torch.utils.data import DataLoader

from backend.models.image_model import ImageSentimentClassifier
from backend.preprocessing.encoder import LabelEncoder
from backend.training.config import TrainingConfig
from backend.training.dataset import MemeImageDataset
from backend.training.metrics import EvaluationMetrics, compute_metrics
from backend.training.train import get_device
from backend.utils.logger import get_logger
from backend.utils.progress import progress_iter

logger = get_logger(__name__)


def load_model_from_checkpoint(checkpoint_path: Path, device: torch.device):
    checkpoint = torch.load(checkpoint_path, map_location=device, weights_only=False)
    model = ImageSentimentClassifier(num_classes=checkpoint["num_classes"], backbone_name=checkpoint["backbone"], pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()
    _verify_architecture(checkpoint, "mobilenet_v3_small", 5)
    return model, checkpoint


def _verify_architecture(checkpoint: dict, expected_backbone: str, expected_num_classes: int) -> None:
    if checkpoint.get("backbone") != expected_backbone:
        raise ValueError(f"Checkpoint backbone mismatch: expected {expected_backbone}, found {checkpoint.get('backbone')}")
    if checkpoint.get("num_classes") != expected_num_classes:
        raise ValueError(f"Checkpoint class count mismatch: expected {expected_num_classes}, found {checkpoint.get('num_classes')}")


def evaluate(config: TrainingConfig, checkpoint_path: Path, split: str = "test") -> EvaluationMetrics:
    device = get_device()
    model, checkpoint = load_model_from_checkpoint(checkpoint_path, device)
    encoder = LabelEncoder.load(config.label_encoder_path)
    csv_path = {"train": config.train_csv, "validation": config.val_csv, "test": config.test_csv}[split]
    dataset = MemeImageDataset(csv_path, config.image_size, config.normalize_mean, config.normalize_std, max_samples=config.max_samples, random_seed=config.random_seed)
    loader = DataLoader(dataset, batch_size=config.batch_size, shuffle=False, num_workers=config.num_workers)

    all_preds, all_labels = [], []
    with torch.no_grad():
        for images, labels in progress_iter(loader, desc=f"Evaluating on {split}", total=len(loader)):
            images = images.to(device)
            logits = model(images)
            all_preds.extend(logits.argmax(dim=1).cpu().tolist())
            all_labels.extend(labels.tolist())

    metrics = compute_metrics(np.array(all_labels), np.array(all_preds), encoder.classes_)
    _save_metrics(config, metrics, split, checkpoint)
    return metrics


def _save_metrics(config, metrics, split, checkpoint) -> Path:
    config.output_dir.mkdir(parents=True, exist_ok=True)
    path = config.output_dir / f"{split}_metrics.json"
    payload = {"split": split, "checkpoint_epoch": checkpoint.get("epoch"), **metrics.to_dict()}
    path.write_text(json.dumps(payload, indent=2))
    return path
