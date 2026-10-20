"""Low-level image helpers shared by the dataset analysis modules."""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import numpy as np
from PIL import Image, UnidentifiedImageError

from backend.utils.logger import get_logger

logger = get_logger(__name__)

SUPPORTED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif"}


def is_image_file(path: Path) -> bool:
    return path.suffix.lower() in SUPPORTED_EXTENSIONS


def verify_image(path: Path) -> tuple[bool, Optional[str]]:
    try:
        with Image.open(path) as img:
            img.verify()
        return True, None
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        return False, str(exc)


def safe_open_image(path: Path) -> Optional[Image.Image]:
    try:
        img = Image.open(path)
        img.load()
        return img
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        logger.warning("Failed to open image %s: %s", path, exc)
        return None


def average_hash(image: Image.Image, hash_size: int = 8) -> str:
    small = image.convert("L").resize((hash_size, hash_size), Image.Resampling.LANCZOS)
    pixels = np.asarray(small, dtype=np.float64)
    mean = pixels.mean()
    bits = (pixels > mean).flatten()
    bit_string = "".join("1" if b else "0" for b in bits)
    return f"{int(bit_string, 2):0{hash_size * hash_size // 4}x}"
