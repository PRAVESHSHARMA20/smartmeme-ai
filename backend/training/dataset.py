"""PyTorch Dataset for the Phase 11 train/validation/test CSVs (Phase 12)."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset

from backend.preprocessing.transforms import preprocess_image
from backend.utils.logger import get_logger

logger = get_logger(__name__)


class MemeImageDataset(Dataset):
    def __init__(self, csv_path, image_size, normalize_mean, normalize_std, max_samples=None, random_seed=42) -> None:
        self.csv_path = Path(csv_path)
        if not self.csv_path.exists():
            raise FileNotFoundError(f"Split CSV not found: {self.csv_path}. Run Phase 11 preprocessing first.")

        df = pd.read_csv(self.csv_path)
        if max_samples is not None and len(df) > max_samples:
            df = df.sample(n=max_samples, random_state=random_seed).reset_index(drop=True)

        self.df = df
        self.image_size = image_size
        self.normalize_mean = normalize_mean
        self.normalize_std = normalize_std
        logger.info("Loaded %d rows from %s", len(self.df), self.csv_path)

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, index: int):
        row = self.df.iloc[index]
        array = preprocess_image(
            Path(row["image_path"]), target_size=self.image_size,
            mean=self.normalize_mean, std=self.normalize_std,
        )
        if array is None:
            logger.warning("Failed to load image for row %d (%s) — using a blank frame.", index, row["filename"])
            array = np.zeros((self.image_size, self.image_size, 3), dtype=np.float32)

        tensor = torch.from_numpy(array).permute(2, 0, 1).contiguous()
        label = int(row["label_id"])
        return tensor, label

    @property
    def label_counts(self) -> dict:
        return self.df["label"].value_counts().to_dict()
