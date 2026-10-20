"""Training loop for the image sentiment classifier (Phase 12)."""

from __future__ import annotations

import json
import time
from dataclasses import asdict
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader

from backend.models.image_model import ImageSentimentClassifier
from backend.preprocessing.encoder import LabelEncoder
from backend.training.class_weights import compute_class_weights
from backend.training.config import TrainingConfig
from backend.training.dataset import MemeImageDataset
from backend.training.metrics import compute_metrics
from backend.utils.logger import get_logger
from backend.utils.progress import progress_iter

logger = get_logger(__name__)


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")
    if torch.backends.mps.is_available():
        return torch.device("mps")
    return torch.device("cpu")


class Trainer:
    def __init__(self, config: TrainingConfig) -> None:
        self.config = config
        self.device = get_device()
        torch.manual_seed(config.random_seed)
        self.config.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.config.output_dir.mkdir(parents=True, exist_ok=True)

        self.encoder = LabelEncoder.load(config.label_encoder_path)
        self.class_names = self.encoder.classes_
        self.num_classes = self.encoder.num_classes
        logger.info("Device: %s", self.device)
        logger.info("Classes (%d): %s", self.num_classes, self.class_names)

        self.train_dataset = MemeImageDataset(
            config.train_csv, config.image_size, config.normalize_mean, config.normalize_std,
            max_samples=config.max_samples, random_seed=config.random_seed,
        )
        self.val_dataset = MemeImageDataset(
            config.val_csv, config.image_size, config.normalize_mean, config.normalize_std,
            max_samples=config.max_samples, random_seed=config.random_seed,
        )
        self.train_loader = DataLoader(self.train_dataset, batch_size=config.batch_size, shuffle=True, num_workers=config.num_workers)
        self.val_loader = DataLoader(self.val_dataset, batch_size=config.batch_size, shuffle=False, num_workers=config.num_workers)

        self.model = ImageSentimentClassifier(
            num_classes=self.num_classes, backbone_name=config.backbone,
            pretrained=config.pretrained, freeze_backbone=config.freeze_backbone, dropout=config.dropout,
        ).to(self.device)

        if config.use_class_weights:
            weights = compute_class_weights(self.train_dataset.df["label_id"].tolist(), self.num_classes)
            weight_tensor = torch.tensor(weights, dtype=torch.float32, device=self.device)
        else:
            weight_tensor = None

        self.criterion = nn.CrossEntropyLoss(weight=weight_tensor)
        self.optimizer = torch.optim.AdamW(self.model.parameters(), lr=config.learning_rate, weight_decay=config.weight_decay)
        self.history: list = []

    def train(self) -> dict:
        best_val_f1 = -1.0
        epochs_without_improvement = 0
        for epoch in range(1, self.config.num_epochs + 1):
            start = time.time()
            train_loss = self._train_one_epoch()
            val_loss, val_metrics = self._validate()
            elapsed = time.time() - start
            record = {
                "epoch": epoch, "train_loss": train_loss, "val_loss": val_loss,
                "val_accuracy": val_metrics.accuracy, "val_f1_macro": val_metrics.f1_macro,
                "val_precision_macro": val_metrics.precision_macro, "val_recall_macro": val_metrics.recall_macro,
                "elapsed_seconds": round(elapsed, 1),
            }
            self.history.append(record)
            logger.info("Epoch %d/%d | train_loss=%.4f | val_f1=%.3f", epoch, self.config.num_epochs, train_loss, val_metrics.f1_macro)

            if val_metrics.f1_macro > best_val_f1:
                best_val_f1 = val_metrics.f1_macro
                epochs_without_improvement = 0
                self._save_checkpoint("best_model.pt", epoch, val_metrics.f1_macro)
            else:
                epochs_without_improvement += 1
            if epochs_without_improvement >= self.config.early_stopping_patience:
                break

        self._save_checkpoint("last_model.pt", epoch, val_metrics.f1_macro)
        self._save_history()
        return {"best_val_f1_macro": best_val_f1, "epochs_trained": epoch, "history": self.history}

    def _train_one_epoch(self) -> float:
        self.model.train()
        total_loss = 0.0
        for images, labels in progress_iter(self.train_loader, desc="Training", total=len(self.train_loader)):
            images, labels = images.to(self.device), labels.to(self.device)
            self.optimizer.zero_grad()
            logits = self.model(images)
            loss = self.criterion(logits, labels)
            loss.backward()
            self.optimizer.step()
            total_loss += loss.item() * images.size(0)
        return total_loss / len(self.train_dataset)

    @torch.no_grad()
    def _validate(self):
        self.model.eval()
        total_loss = 0.0
        all_preds, all_labels = [], []
        for images, labels in progress_iter(self.val_loader, desc="Validating", total=len(self.val_loader)):
            images, labels = images.to(self.device), labels.to(self.device)
            logits = self.model(images)
            loss = self.criterion(logits, labels)
            total_loss += loss.item() * images.size(0)
            preds = logits.argmax(dim=1)
            all_preds.extend(preds.cpu().tolist())
            all_labels.extend(labels.cpu().tolist())
        val_loss = total_loss / len(self.val_dataset)
        metrics = compute_metrics(np.array(all_labels), np.array(all_preds), self.class_names)
        return val_loss, metrics

    def _save_checkpoint(self, filename: str, epoch: int, val_f1_macro: float) -> None:
        path = self.config.checkpoint_dir / filename
        torch.save({
            "model_state_dict": self.model.state_dict(), "epoch": epoch, "val_f1_macro": val_f1_macro,
            "num_classes": self.num_classes, "class_names": self.class_names, "backbone": self.config.backbone,
            "image_size": self.config.image_size, "normalize_mean": self.config.normalize_mean,
            "normalize_std": self.config.normalize_std, "config": asdict(self.config),
        }, path)
        logger.info("Saved checkpoint: %s", path)

    def _save_history(self) -> Path:
        path = self.config.output_dir / "training_history.json"
        path.write_text(json.dumps(self.history, indent=2))
        return path
