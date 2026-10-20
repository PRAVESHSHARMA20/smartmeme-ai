"""Image transform functions: resize+pad, RGB conversion, normalization."""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

from backend.utils.image_utils import safe_open_image


def to_rgb(image: Image.Image) -> Image.Image:
    if image.mode == "RGB":
        return image
    return image.convert("RGB")


def resize_with_padding(image: Image.Image, target_size: int, pad_color: tuple[int, int, int] = (0, 0, 0)) -> Image.Image:
    width, height = image.size
    if width == 0 or height == 0:
        raise ValueError(f"Cannot resize a zero-dimension image ({width}x{height}).")
    scale = target_size / max(width, height)
    new_width = max(1, round(width * scale))
    new_height = max(1, round(height * scale))
    resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (target_size, target_size), pad_color)
    offset = ((target_size - new_width) // 2, (target_size - new_height) // 2)
    canvas.paste(resized, offset)
    return canvas


def normalize_pixels(array: np.ndarray, mean=None, std=None) -> np.ndarray:
    normalized = array.astype(np.float32) / 255.0
    if mean is not None and std is not None:
        normalized = (normalized - np.array(mean, dtype=np.float32)) / np.array(std, dtype=np.float32)
    return normalized


def preprocess_image(path: Path, target_size: int, pad_color=(0, 0, 0), mean=None, std=None) -> np.ndarray | None:
    image = safe_open_image(path)
    if image is None:
        return None
    try:
        image = to_rgb(image)
        image = resize_with_padding(image, target_size, pad_color)
        array = np.asarray(image)
        return normalize_pixels(array, mean, std)
    finally:
        image.close()
