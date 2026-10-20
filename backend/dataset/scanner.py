"""Scans a single flat folder of images."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

from backend.utils.image_utils import average_hash, is_image_file, safe_open_image, verify_image
from backend.utils.logger import get_logger
from backend.utils.progress import progress_iter

logger = get_logger(__name__)


class DatasetScanError(Exception):
    pass


@dataclass
class ScanResult:
    images_df: pd.DataFrame
    invalid_extension_files: list[str] = field(default_factory=list)


class ImageScanner:
    def __init__(self, dataset_root: Path, hash_size: int = 8, exclude_paths: set[Path] | None = None) -> None:
        self.dataset_root = Path(dataset_root)
        self.hash_size = hash_size
        self.exclude_paths = {p.resolve() for p in (exclude_paths or set())}

    def scan(self) -> ScanResult:
        if not self.dataset_root.exists():
            raise DatasetScanError(f"Dataset folder does not exist: {self.dataset_root}")
        if not self.dataset_root.is_dir():
            raise DatasetScanError(f"Dataset path is not a directory: {self.dataset_root}")

        all_files = sorted(
            p for p in self.dataset_root.iterdir() if p.is_file() and p.resolve() not in self.exclude_paths
        )
        if not all_files:
            raise DatasetScanError(f"No files found in {self.dataset_root}")

        rows: list[dict] = []
        invalid_extension_files: list[str] = []

        for path in progress_iter(all_files, desc="Scanning images", total=len(all_files)):
            if not is_image_file(path):
                invalid_extension_files.append(path.name)
                continue
            rows.append(self._inspect(path))

        images_df = pd.DataFrame(rows)
        logger.info(
            "Scanned %d image files (%d file(s) skipped for unsupported extensions).",
            len(images_df), len(invalid_extension_files),
        )
        return ScanResult(images_df=images_df, invalid_extension_files=invalid_extension_files)

    def _inspect(self, path: Path) -> dict:
        filesize = path.stat().st_size
        is_valid, error = verify_image(path)
        width = height = img_format = phash = None

        if is_valid:
            image = safe_open_image(path)
            if image is None:
                is_valid = False
            else:
                try:
                    width, height = image.size
                    img_format = image.format
                    phash = average_hash(image, hash_size=self.hash_size)
                finally:
                    image.close()
        else:
            logger.warning("Corrupted image: %s (%s)", path, error)

        return {
            "filename": path.name, "image_path": str(path), "width": width, "height": height,
            "format": img_format, "filesize": filesize, "corrupted": not is_valid, "phash": phash,
        }
