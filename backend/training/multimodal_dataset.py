"""Multimodal Dataset: joins a Phase 11 split CSV with the original
labels.csv for text (Phase 13)."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset

from backend.preprocessing.transforms import preprocess_image
from backend.utils.logger import get_logger

logger = get_logger(__name__)


def _resolve_text(row: pd.Series) -> str:
    corrected = row.get("text_corrected")
    if isinstance(corrected, str) and corrected.strip():
        return corrected.strip()
    ocr = row.get("text_ocr")
    if isinstance(ocr, str) and ocr.strip():
        return ocr.strip()
    return ""



def load_multimodal_split(
    split_csv_path,
    original_labels_csv_path,
    filename_column,
    max_samples=None,
    random_seed=42,
) -> pd.DataFrame:
    split_df = pd.read_csv(split_csv_path)

    text_source = pd.read_csv(original_labels_csv_path)
    text_source = text_source.rename(columns={filename_column: "filename"})

    keep_cols = [
        column
        for column in ("filename", "text_ocr", "text_corrected")
        if column in text_source.columns
    ]
    text_source = text_source[keep_cols]

    merged = split_df.merge(text_source, on="filename", how="left")

    text_columns = [
        column
        for column in ("text_ocr", "text_corrected")
        if column in merged.columns
    ]

    if text_columns:
        no_usable_text = merged[text_columns].fillna("").apply(
            lambda column: column.astype(str).str.strip().eq("")
        ).all(axis=1).sum()
    else:
        no_usable_text = len(merged)

    if no_usable_text:
        logger.warning(
            "%d row(s) in %s have no usable text in either text field.",
            no_usable_text,
            split_csv_path.name
            if hasattr(split_csv_path, "name")
            else split_csv_path,
        )

    merged["text"] = merged.apply(_resolve_text, axis=1)

    if max_samples is not None and len(merged) > max_samples:
        merged = merged.sample(
            n=max_samples,
            random_state=random_seed,
        ).reset_index(drop=True)

    return merged

class MultimodalMemeDataset(Dataset):
    def __init__(self, split_csv_path, original_labels_csv_path, filename_column, tokenizer, max_text_length, image_size, normalize_mean, normalize_std, max_samples=None, random_seed=42) -> None:
        self.df = load_multimodal_split(split_csv_path, original_labels_csv_path, filename_column, max_samples=max_samples, random_seed=random_seed)
        self.tokenizer = tokenizer
        self.max_text_length = max_text_length
        self.image_size = image_size
        self.normalize_mean = normalize_mean
        self.normalize_std = normalize_std
        logger.info("Loaded %d multimodal rows from %s", len(self.df), split_csv_path)

    def __len__(self) -> int:
        return len(self.df)

    def __getitem__(self, index: int) -> dict:
        row = self.df.iloc[index]

        image_array = preprocess_image(Path(row["image_path"]), target_size=self.image_size, mean=self.normalize_mean, std=self.normalize_std)
        if image_array is None:
            logger.warning("Failed to load image for row %d (%s) — using a blank frame.", index, row["filename"])
            image_array = np.zeros((self.image_size, self.image_size, 3), dtype=np.float32)
        image_tensor = torch.from_numpy(image_array).permute(2, 0, 1).contiguous()

        encoding = self.tokenizer(row["text"], truncation=True, padding="max_length", max_length=self.max_text_length, return_tensors="pt")
        input_ids = encoding["input_ids"].squeeze(0)
        attention_mask = encoding["attention_mask"].squeeze(0)

        return {
            "image": image_tensor, "input_ids": input_ids, "attention_mask": attention_mask,
            "label": int(row["label_id"]), "filename": row["filename"],
        }
