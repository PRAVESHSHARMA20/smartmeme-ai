"""Phase 12 smoke test — verifies the full pipeline works end-to-end on a
tiny slice of data before committing to a full training run.

Run with:
    python -m backend.training.smoke_test

This does NOT train on the full dataset. It uses config.default_config(
smoke_test=True): 40 samples, batch_size=4, 1 epoch, separate output dirs
(backend/training/checkpoints_smoke_test/, output_smoke_test/) so it can
never be confused with or overwrite a real training run's output.

Each of the 20 required checks is a separate, explicitly reported step —
if something fails, this tells you exactly which step, rather than one
opaque stack trace.
"""

from __future__ import annotations

import sys
import traceback

from backend.utils.logger import get_logger

logger = get_logger(__name__)

results: dict[str, bool] = {}
report: dict[str, object] = {}


def step(number: int, description: str):
    """Decorator-ish helper: prints a clear PASS/FAIL per numbered check."""

    def wrapper(fn):
        try:
            value = fn()
            results[f"{number}. {description}"] = True
            print(f"  [PASS] {number}. {description}")
            return value
        except Exception as exc:  # noqa: BLE001 - intentionally broad, this is a diagnostic script
            results[f"{number}. {description}"] = False
            print(f"  [FAIL] {number}. {description}")
            print(f"         {type(exc).__name__}: {exc}")
            traceback.print_exc(limit=3)
            return None

    return wrapper


def main() -> int:
    print("=" * 70)
    print("PHASE 12 SMOKE TEST")
    print("=" * 70)

    # --- 1 & 2: imports -----------------------------------------------
    torch = step(1, "PyTorch imports successfully")(lambda: __import__("torch"))
    if torch is None:
        print("\nCannot continue without torch. Install it first — see the exact")
        print("command in this script's final report / the chat response.")
        return 1
    report["torch_version"] = torch.__version__

    torchvision = step(2, "torchvision imports successfully")(lambda: __import__("torchvision"))
    if torchvision is None:
        return 1
    report["torchvision_version"] = torchvision.__version__

    # Imports below are safe now that we know torch/torchvision exist.
    from backend.models.image_model import ImageSentimentClassifier
    from backend.preprocessing.encoder import LabelEncoder
    from backend.training.class_weights import compute_class_weights
    from backend.training.config import default_config
    from backend.training.dataset import MemeImageDataset
    from backend.training.metrics import compute_metrics
    from torch.utils.data import DataLoader
    import numpy as np

    config = default_config(smoke_test=True)
    print(f"\nSmoke-test config: max_samples={config.max_samples}, batch_size={config.batch_size}, "
          f"epochs={config.num_epochs}, backbone={config.backbone}")
    print(f"Reading Phase 11 output from: {config.train_csv.parent}\n")

    # --- 3 & 4: model construction --------------------------------------
    encoder = step(5, "Phase 11 train.csv can be loaded (via label_encoder + dataset)")(
        lambda: LabelEncoder.load(config.label_encoder_path)
    )
    if encoder is None:
        return 1
    report["num_classes"] = encoder.num_classes
    report["class_names"] = encoder.classes_

    model = step(3, "The selected pretrained model can be constructed")(
        lambda: ImageSentimentClassifier(
            num_classes=encoder.num_classes,
            backbone_name=config.backbone,
            pretrained=config.pretrained,
            freeze_backbone=config.freeze_backbone,
            dropout=config.dropout,
        )
    )
    if model is None:
        return 1
    report["backbone"] = config.backbone

    step(4, "The classifier has exactly 5 output classes")(
        lambda: (_ for _ in ()).throw(AssertionError(f"expected 5, got {model.num_classes}"))
        if model.num_classes != 5 else True
    )

    # --- 5, 6, 7: load the three split CSVs -----------------------------
    train_dataset = step(5, "Phase 11 train.csv loads via MemeImageDataset")(
        lambda: MemeImageDataset(
            config.train_csv, config.image_size, config.normalize_mean, config.normalize_std,
            max_samples=config.max_samples, random_seed=config.random_seed,
        )
    )
    val_dataset = step(6, "Phase 11 validation.csv loads via MemeImageDataset")(
        lambda: MemeImageDataset(
            config.val_csv, config.image_size, config.normalize_mean, config.normalize_std,
            max_samples=config.max_samples, random_seed=config.random_seed,
        )
    )
    test_dataset = step(7, "Phase 11 test.csv loads via MemeImageDataset")(
        lambda: MemeImageDataset(
            config.test_csv, config.image_size, config.normalize_mean, config.normalize_std,
            max_samples=config.max_samples, random_seed=config.random_seed,
        )
    )
    if train_dataset is None or val_dataset is None or test_dataset is None:
        return 1

    # --- 8 & 9: open a real image, verify shape -------------------------
    sample = step(8, "Dataset loader can open a real image from the dataset")(
        lambda: train_dataset[0]
    )
    if sample is None:
        return 1
    sample_image, sample_label = sample
    report["sample_image_shape"] = tuple(sample_image.shape)

    step(9, f"Image is transformed to expected ({config.image_size}x{config.image_size}) format")(
        lambda: (_ for _ in ()).throw(
            AssertionError(f"expected (3, {config.image_size}, {config.image_size}), got {tuple(sample_image.shape)}")
        )
        if tuple(sample_image.shape) != (3, config.image_size, config.image_size) else True
    )

    # --- 10 & 11: DataLoader produces a batch ---------------------------
    train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=config.batch_size, shuffle=False, num_workers=0)

    batch = step(10, "A DataLoader can produce a batch")(lambda: next(iter(train_loader)))
    if batch is None:
        return 1
    images, labels = batch
    report["batch_shape"] = tuple(images.shape)

    step(11, "The batch has the expected tensor shape")(
        lambda: (_ for _ in ()).throw(AssertionError(f"got {tuple(images.shape)}"))
        if tuple(images.shape)[1:] != (3, config.image_size, config.image_size)
        else True
    )

    # --- 12 & 13: forward pass -------------------------------------------
    logits = step(12, "A forward pass through the model works")(lambda: model(images))
    if logits is None:
        return 1
    report["model_output_shape"] = tuple(logits.shape)

    step(13, f"Output tensor has shape [batch_size, {encoder.num_classes}]")(
        lambda: (_ for _ in ()).throw(AssertionError(f"got {tuple(logits.shape)}"))
        if tuple(logits.shape) != (images.shape[0], encoder.num_classes) else True
    )

    # --- 14 & 15: class weights + weighted loss ---------------------------
    import torch.nn as nn

    weights = step(14, "Class weights can be calculated correctly")(
        lambda: compute_class_weights(train_dataset.df["label_id"].tolist(), encoder.num_classes)
    )
    if weights is None:
        return 1

    loss = step(15, "The weighted loss can be calculated")(
        lambda: nn.CrossEntropyLoss(weight=torch.tensor(weights, dtype=torch.float32))(logits, labels)
    )
    if loss is None:
        return 1
    report["loss_value"] = float(loss.item())

    # --- 16: one full training step ---------------------------------------
    def one_training_step():
        optimizer = torch.optim.AdamW(model.parameters(), lr=config.learning_rate)
        model.train()
        optimizer.zero_grad()
        out = model(images)
        step_loss = nn.CrossEntropyLoss()(out, labels)
        step_loss.backward()
        optimizer.step()
        return True

    backward_ok = step(16, "One training step executes (forward -> loss -> backward -> optimizer.step)")(
        one_training_step
    )
    report["backward_pass_succeeded"] = bool(backward_ok)

    # --- 17: validation on a couple of batches -----------------------------
    def run_small_validation():
        model.eval()
        with torch.no_grad():
            all_preds, all_labels = [], []
            for i, (val_images, val_labels) in enumerate(val_loader):
                if i >= 2:  # only a couple of batches — this is a smoke test
                    break
                val_logits = model(val_images)
                all_preds.extend(val_logits.argmax(dim=1).tolist())
                all_labels.extend(val_labels.tolist())
        return all_preds, all_labels

    val_result = step(17, "Validation can execute on a small number of batches")(run_small_validation)
    if val_result is None:
        return 1
    val_preds, val_labels = val_result

    # --- 18: metrics --------------------------------------------------------
    metrics = step(18, "Metrics can be calculated")(
        lambda: compute_metrics(np.array(val_labels), np.array(val_preds), encoder.classes_)
    )
    report["metrics_succeeded"] = metrics is not None

    # --- 19: checkpoint saving ------------------------------------------------
    def save_checkpoint():
        config.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        path = config.checkpoint_dir / "smoke_test_checkpoint.pt"
        torch.save({"model_state_dict": model.state_dict(), "smoke_test": True}, path)
        assert path.exists(), "checkpoint file was not created"
        return path

    checkpoint_path = step(19, "Checkpoint saving works")(save_checkpoint)
    report["checkpoint_saving_succeeded"] = checkpoint_path is not None

    # --- 20: training history saving --------------------------------------
    def save_history():
        import json

        config.output_dir.mkdir(parents=True, exist_ok=True)
        path = config.output_dir / "smoke_test_history.json"
        path.write_text(json.dumps([{"epoch": 1, "loss": report["loss_value"]}], indent=2))
        assert path.exists()
        return path

    step(20, "Training history saving works")(save_history)

    # --- Final report ---------------------------------------------------------
    print("\n" + "=" * 70)
    print("SMOKE TEST REPORT")
    print("=" * 70)
    print(f"PyTorch version:              {report.get('torch_version')}")
    print(f"torchvision version:          {report.get('torchvision_version')}")
    print(f"Backbone:                     {report.get('backbone')}")
    print(f"Number of classes:            {report.get('num_classes')} {report.get('class_names')}")
    print(f"Sample image shape:           {report.get('sample_image_shape')}")
    print(f"Batch shape:                  {report.get('batch_shape')}")
    print(f"Model output shape:           {report.get('model_output_shape')}")
    print(f"Loss value:                   {report.get('loss_value')}")
    print(f"Backward pass succeeded:      {report.get('backward_pass_succeeded')}")
    print(f"Checkpoint saving succeeded:  {report.get('checkpoint_saving_succeeded')}")
    print(f"Metrics succeeded:            {report.get('metrics_succeeded')}")

    passed = sum(results.values())
    total = len(results)
    print(f"\n{passed}/{total} checks passed.")

    if passed == total:
        print("\nALL CHECKS PASSED. Safe to proceed to full training.")
        return 0
    else:
        print("\nSOME CHECKS FAILED. Do not proceed to full training until these are fixed:")
        for name, ok in results.items():
            if not ok:
                print(f"  - {name}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
