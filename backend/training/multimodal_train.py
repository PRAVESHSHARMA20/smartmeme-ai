"""Training loop for the multimodal (image + text) sentiment classifier (Phase 13)."""

from __future__ import annotations

import json
import time
from dataclasses import asdict
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from transformers import AutoTokenizer

from backend.models.image_model import ImageSentimentClassifier
from backend.models.multimodal_model import MultimodalSentimentClassifier
from backend.models.text_encoder import TextEncoder
from backend.preprocessing.encoder import LabelEncoder
from backend.training.class_weights import compute_class_weights
from backend.training.leakage_checks import run_all_leakage_checks
from backend.training.metrics import compute_metrics
from backend.training.multimodal_config import MultimodalConfig, default_config
from backend.training.multimodal_dataset import MultimodalMemeDataset, load_multimodal_split
from backend.training.train import get_device
from backend.utils.logger import get_logger
from backend.utils.progress import progress_iter

logger = get_logger(__name__)


class MultimodalTrainer:
    def __init__(self, config: MultimodalConfig, skip_image_hash_leakage_check: bool = False) -> None:
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
        logger.info("Text model: %s | Image backbone: %s", config.text_model_name, config.image_backbone)

        self._run_leakage_checks(skip_image_hash_leakage_check)

        self.tokenizer = AutoTokenizer.from_pretrained(config.text_model_name)

        self.train_dataset = MultimodalMemeDataset(
            config.train_csv, config.original_labels_csv, config.filename_column, self.tokenizer,
            config.max_text_length, config.image_size, config.normalize_mean, config.normalize_std,
            max_samples=config.max_samples, random_seed=config.random_seed,
        )
        self.val_dataset = MultimodalMemeDataset(
            config.val_csv, config.original_labels_csv, config.filename_column, self.tokenizer,
            config.max_text_length, config.image_size, config.normalize_mean, config.normalize_std,
            max_samples=config.max_samples, random_seed=config.random_seed,
        )
        self.train_loader = DataLoader(self.train_dataset, batch_size=config.batch_size, shuffle=True, num_workers=config.num_workers)
        self.val_loader = DataLoader(self.val_dataset, batch_size=config.batch_size, shuffle=False, num_workers=config.num_workers)

        image_encoder = ImageSentimentClassifier(
            num_classes=self.num_classes, backbone_name=config.image_backbone,
            pretrained=(config.image_pretrained_checkpoint is None), freeze_backbone=config.freeze_image_backbone,
        )
        if config.image_pretrained_checkpoint is not None and config.image_pretrained_checkpoint.exists():
            self._warm_start_image_encoder(image_encoder, config.image_pretrained_checkpoint)

        text_encoder = TextEncoder(model_name=config.text_model_name, freeze=config.freeze_text_backbone, pooling=config.text_pooling)

        self.model = MultimodalSentimentClassifier(
            num_classes=self.num_classes, image_encoder=image_encoder, text_encoder=text_encoder,
            fusion_hidden_dim=config.fusion_hidden_dim, dropout=config.dropout,
        ).to(self.device)

        if config.use_class_weights:
            weights = compute_class_weights(self.train_dataset.df["label_id"].tolist(), self.num_classes)
            weight_tensor = torch.tensor(weights, dtype=torch.float32, device=self.device)
        else:
            weight_tensor = None

        self.criterion = nn.CrossEntropyLoss(weight=weight_tensor)
        self.optimizer = torch.optim.AdamW(self.model.parameters(), lr=config.learning_rate, weight_decay=config.weight_decay)
        self.history: list = []

    def _run_leakage_checks(self, skip_image_hash_check: bool) -> None:
        splits = {
            "train": load_multimodal_split(self.config.train_csv, self.config.original_labels_csv, self.config.filename_column, max_samples=self.config.max_samples, random_seed=self.config.random_seed),
            "validation": load_multimodal_split(self.config.val_csv, self.config.original_labels_csv, self.config.filename_column, max_samples=self.config.max_samples, random_seed=self.config.random_seed),
            "test": load_multimodal_split(self.config.test_csv, self.config.original_labels_csv, self.config.filename_column, max_samples=self.config.max_samples, random_seed=self.config.random_seed),
        }
        report = run_all_leakage_checks(splits, check_image_hashes=not skip_image_hash_check)
        report_path = self.config.output_dir / "leakage_check.json"
        report_path.write_text(json.dumps(report.to_dict(), indent=2))
        logger.info("Leakage check report written to %s", report_path)

        if not report.passed:
            raise RuntimeError(f"Leakage detected — stopping before training. See {report_path}.")

    def _warm_start_image_encoder(self, image_encoder: ImageSentimentClassifier, checkpoint_path: Path) -> None:
        checkpoint = torch.load(checkpoint_path, map_location="cpu", weights_only=False)
        if checkpoint.get("backbone") != image_encoder.backbone_name:
            logger.warning("Phase 12 checkpoint backbone mismatch — skipping warm start.")
            return
        image_encoder.load_state_dict(checkpoint["model_state_dict"])
        logger.info("Warm-started image encoder from %s (read-only load).", checkpoint_path)

    def train(self) -> dict:
        best_val_f1 = -1.0
        epochs_without_improvement = 0
        epoch = 0
        for epoch in range(1, self.config.num_epochs + 1):
            start = time.time()
            train_loss = self._train_one_epoch()
            val_loss, val_metrics = self._validate()
            elapsed = time.time() - start
            record = {
                "epoch": epoch, "train_loss": train_loss, "val_loss": val_loss,
                "val_accuracy": val_metrics.accuracy, "val_f1_macro": val_metrics.f1_macro,
                "val_f1_weighted": val_metrics.f1_weighted, "val_precision_macro": val_metrics.precision_macro,
                "val_recall_macro": val_metrics.recall_macro, "elapsed_seconds": round(elapsed, 1),
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
        for batch in progress_iter(self.train_loader, desc="Training", total=len(self.train_loader)):
            images = batch["image"].to(self.device)
            input_ids = batch["input_ids"].to(self.device)
            attention_mask = batch["attention_mask"].to(self.device)
            labels = batch["label"].to(self.device)
            self.optimizer.zero_grad()
            logits = self.model(images, input_ids, attention_mask)
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
        for batch in progress_iter(self.val_loader, desc="Validating", total=len(self.val_loader)):
            images = batch["image"].to(self.device)
            input_ids = batch["input_ids"].to(self.device)
            attention_mask = batch["attention_mask"].to(self.device)
            labels = batch["label"].to(self.device)
            logits = self.model(images, input_ids, attention_mask)
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
            "num_classes": self.num_classes, "class_names": self.class_names,
            "image_backbone": self.config.image_backbone, "text_model_name": self.config.text_model_name,
            "image_size": self.config.image_size, "normalize_mean": self.config.normalize_mean,
            "normalize_std": self.config.normalize_std, "max_text_length": self.config.max_text_length,
            "text_pooling": self.config.text_pooling, "fusion_hidden_dim": self.config.fusion_hidden_dim,
            "config": {k: str(v) for k, v in asdict(self.config).items()},
        }, path)
        logger.info("Saved checkpoint: %s", path)

    def _save_history(self) -> Path:
        path = self.config.output_dir / "training_history.json"
        path.write_text(json.dumps(self.history, indent=2))
        return path



def main():
    config = default_config()
    trainer = MultimodalTrainer(config)
    results = trainer.train()
    logger.info("Training completed: %s", results)


if __name__ == "__main__":
    main()