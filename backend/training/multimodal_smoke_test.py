"""Phase 13 multimodal smoke test — verifies the full image+text pipeline
works end-to-end on a tiny slice of data before any real training.

Run with:
    python -m backend.training.multimodal_smoke_test

Uses multimodal_config.default_config(smoke_test=True): 8 samples,
batch_size=2, 1 epoch, separate checkpoint/output directories. Never
touches backend/training/checkpoints/best_model.pt (Phase 12) or any
Phase 11 output CSVs.
"""

from __future__ import annotations

import sys
import traceback

from backend.utils.logger import get_logger

logger = get_logger(__name__)

results: dict = {}
report: dict = {}


def step(number: int, description: str):
    def wrapper(fn):
        try:
            value = fn()
            results[f"{number}. {description}"] = True
            print(f"  [PASS] {number}. {description}")
            return value
        except Exception as exc:
            results[f"{number}. {description}"] = False
            print(f"  [FAIL] {number}. {description}")
            print(f"         {type(exc).__name__}: {exc}")
            traceback.print_exc(limit=3)
            return None
    return wrapper


def main() -> int:
    print("=" * 70)
    print("PHASE 13 MULTIMODAL SMOKE TEST")
    print("=" * 70)

    torch = step(1, "PyTorch imports successfully")(lambda: __import__("torch"))
    if torch is None:
        print("\nCannot continue without torch.")
        return 1
    report["torch_version"] = torch.__version__

    transformers = step(2, "Transformers imports successfully")(lambda: __import__("transformers"))
    if transformers is None:
        return 1
    report["transformers_version"] = transformers.__version__

    from backend.models.image_model import ImageSentimentClassifier
    from backend.models.multimodal_model import MultimodalSentimentClassifier
    from backend.models.text_encoder import TextEncoder
    from backend.preprocessing.encoder import LabelEncoder
    from backend.training.class_weights import compute_class_weights
    from backend.training.metrics import compute_metrics
    from backend.training.multimodal_config import default_config
    from backend.training.multimodal_dataset import MultimodalMemeDataset
    from torch.utils.data import DataLoader
    from transformers import AutoTokenizer
    import numpy as np
    import torch.nn as nn

    config = default_config(smoke_test=True)
    print(f"\nSmoke-test config: max_samples={config.max_samples}, batch_size={config.batch_size}, "
          f"epochs={config.num_epochs}, image_backbone={config.image_backbone}, text_model={config.text_model_name}")
    print(f"Output directories: {config.checkpoint_dir}, {config.output_dir}")
    print(f"(Phase 12 checkpoint NOT touched: image_pretrained_checkpoint={config.image_pretrained_checkpoint})\n")

    encoder = step(0, "Label encoder loads (prerequisite)")(lambda: LabelEncoder.load(config.label_encoder_path))
    if encoder is None:
        return 1
    report["num_classes"] = encoder.num_classes

    tokenizer = step(3, "Tokenizer loads")(lambda: AutoTokenizer.from_pretrained(config.text_model_name))
    if tokenizer is None:
        return 1

    text_encoder = step(4, "Text model loads")(lambda: TextEncoder(model_name=config.text_model_name, pooling=config.text_pooling))
    if text_encoder is None:
        return 1

    image_encoder = step(5, "Image model loads")(lambda: ImageSentimentClassifier(num_classes=encoder.num_classes, backbone_name=config.image_backbone))
    if image_encoder is None:
        return 1

    model = step(6, "Multimodal model constructs successfully")(
        lambda: MultimodalSentimentClassifier(num_classes=encoder.num_classes, image_encoder=image_encoder, text_encoder=text_encoder, fusion_hidden_dim=config.fusion_hidden_dim, dropout=config.dropout)
    )
    if model is None:
        return 1

    train_dataset = step(7, "Phase 11 train.csv loads (joined with text)")(
        lambda: MultimodalMemeDataset(config.train_csv, config.original_labels_csv, config.filename_column, tokenizer, config.max_text_length, config.image_size, config.normalize_mean, config.normalize_std, max_samples=config.max_samples, random_seed=config.random_seed)
    )
    val_dataset = step(8, "Phase 11 validation.csv loads (joined with text)")(
        lambda: MultimodalMemeDataset(config.val_csv, config.original_labels_csv, config.filename_column, tokenizer, config.max_text_length, config.image_size, config.normalize_mean, config.normalize_std, max_samples=config.max_samples, random_seed=config.random_seed)
    )
    if train_dataset is None or val_dataset is None:
        return 1

    sample = step(9, "A real image loads")(lambda: train_dataset[0])
    if sample is None:
        return 1
    report["sample_image_shape"] = tuple(sample["image"].shape)

    step(10, "Real text loads")(lambda: (_ for _ in ()).throw(AssertionError("text field missing")) if "input_ids" not in sample else True)
    step(11, "Tokenization works (produces input_ids)")(
        lambda: (_ for _ in ()).throw(AssertionError(f"unexpected input_ids shape {tuple(sample['input_ids'].shape)}"))
        if tuple(sample["input_ids"].shape) != (config.max_text_length,) else True
    )

    step(12, f"Image tensor shape is correct (3, {config.image_size}, {config.image_size})")(
        lambda: (_ for _ in ()).throw(AssertionError(f"got {tuple(sample['image'].shape)}"))
        if tuple(sample["image"].shape) != (3, config.image_size, config.image_size) else True
    )
    step(13, f"Text tensor shape is correct ({config.max_text_length},)")(
        lambda: (_ for _ in ()).throw(AssertionError(f"got {tuple(sample['input_ids'].shape)}"))
        if tuple(sample["input_ids"].shape) != (config.max_text_length,) else True
    )
    step(14, f"Attention mask shape is correct ({config.max_text_length},)")(
        lambda: (_ for _ in ()).throw(AssertionError(f"got {tuple(sample['attention_mask'].shape)}"))
        if tuple(sample["attention_mask"].shape) != (config.max_text_length,) else True
    )

    train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=config.batch_size, shuffle=False, num_workers=0)

    batch = step(9, "A batch can be produced")(lambda: next(iter(train_loader)))
    if batch is None:
        return 1
    report["batch_image_shape"] = tuple(batch["image"].shape)

    logits = step(15, "Multimodal forward pass works")(lambda: model(batch["image"], batch["input_ids"], batch["attention_mask"]))
    if logits is None:
        return 1
    report["output_shape"] = tuple(logits.shape)

    step(16, f"Output shape is [batch_size, {encoder.num_classes}]")(
        lambda: (_ for _ in ()).throw(AssertionError(f"got {tuple(logits.shape)}"))
        if tuple(logits.shape) != (batch["image"].shape[0], encoder.num_classes) else True
    )

    weights = step(17, "Class weights calculate")(lambda: compute_class_weights(train_dataset.df["label_id"].tolist(), encoder.num_classes))
    loss = step(17, "Loss calculation works")(lambda: nn.CrossEntropyLoss(weight=torch.tensor(weights, dtype=torch.float32))(logits, batch["label"]))
    if loss is None:
        return 1
    report["loss_value"] = float(loss.item())

    def one_training_step():
        optimizer = torch.optim.AdamW(model.parameters(), lr=config.learning_rate)
        model.train()
        optimizer.zero_grad()
        out = model(batch["image"], batch["input_ids"], batch["attention_mask"])
        step_loss = nn.CrossEntropyLoss()(out, batch["label"])
        step_loss.backward()
        optimizer.step()
        return True

    backward_ok = step(18, "Backward pass works")(one_training_step)
    step(19, "One optimizer step works")(lambda: True if backward_ok else (_ for _ in ()).throw(AssertionError()))
    report["backward_pass_succeeded"] = bool(backward_ok)

    def run_small_validation_and_metrics():
        model.eval()
        with torch.no_grad():
            all_preds, all_labels = [], []
            for i, val_batch in enumerate(val_loader):
                if i >= 2:
                    break
                val_logits = model(val_batch["image"], val_batch["input_ids"], val_batch["attention_mask"])
                all_preds.extend(val_logits.argmax(dim=1).tolist())
                all_labels.extend(val_batch["label"].tolist())
        return compute_metrics(np.array(all_labels), np.array(all_preds), encoder.classes_)

    metrics = step(20, "Metrics work")(run_small_validation_and_metrics)
    report["metrics_succeeded"] = metrics is not None

    def save_checkpoint():
        config.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        path = config.checkpoint_dir / "smoke_test_checkpoint.pt"
        torch.save({"model_state_dict": model.state_dict(), "smoke_test": True}, path)
        assert path.exists()
        return path

    checkpoint_path = step(21, "Checkpoint saving works")(save_checkpoint)
    report["checkpoint_saving_succeeded"] = checkpoint_path is not None

    print("\n" + "=" * 70)
    print("SMOKE TEST REPORT")
    print("=" * 70)
    print(f"PyTorch version:              {report.get('torch_version')}")
    print(f"Transformers version:         {report.get('transformers_version')}")
    print(f"Number of classes:            {report.get('num_classes')}")
    print(f"Sample image shape:           {report.get('sample_image_shape')}")
    print(f"Batch image shape:            {report.get('batch_image_shape')}")
    print(f"Model output shape:           {report.get('output_shape')}")
    print(f"Loss value:                   {report.get('loss_value')}")
    print(f"Backward pass succeeded:      {report.get('backward_pass_succeeded')}")
    print(f"Checkpoint saving succeeded:  {report.get('checkpoint_saving_succeeded')}")
    print(f"Metrics succeeded:            {report.get('metrics_succeeded')}")

    passed = sum(results.values())
    total = len(results)
    print(f"\n{passed}/{total} checks passed.")

    if passed == total:
        print("\nALL CHECKS PASSED.")
        return 0
    else:
        print("\nSOME CHECKS FAILED:")
        for name, ok in results.items():
            if not ok:
                print(f"  - {name}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
