"""Validates the merged dataset: corruption, duplicates, and missing data."""

from __future__ import annotations

from dataclasses import dataclass, field

import pandas as pd

from backend.utils.logger import get_logger

logger = get_logger(__name__)


@dataclass
class ValidationReport:
    corrupted_files: list[str] = field(default_factory=list)
    duplicate_label_rows: pd.DataFrame = field(default_factory=pd.DataFrame)
    duplicate_image_groups: dict[str, list[str]] = field(default_factory=dict)
    missing_images: list[str] = field(default_factory=list)
    missing_labels: list[str] = field(default_factory=list)
    invalid_extension_files: list[str] = field(default_factory=list)

    @property
    def corrupted_count(self) -> int:
        return len(self.corrupted_files)

    @property
    def duplicate_image_group_count(self) -> int:
        return len(self.duplicate_image_groups)

    @property
    def duplicate_image_redundant_count(self) -> int:
        return sum(len(files) - 1 for files in self.duplicate_image_groups.values())


class DatasetValidator:
    def validate(self, merged_df, labels_df, missing_images, missing_labels, invalid_extension_files) -> ValidationReport:
        corrupted_files = sorted(merged_df.loc[merged_df["corrupted"], "filename"].tolist())
        duplicate_label_rows = self._find_duplicate_label_rows(labels_df)
        duplicate_image_groups = self._find_duplicate_images(merged_df)

        report = ValidationReport(
            corrupted_files=corrupted_files, duplicate_label_rows=duplicate_label_rows,
            duplicate_image_groups=duplicate_image_groups, missing_images=missing_images,
            missing_labels=missing_labels, invalid_extension_files=invalid_extension_files,
        )
        logger.info(
            "Validation complete: %d corrupted, %d duplicate CSV rows, %d duplicate image groups "
            "(%d redundant), %d missing images, %d missing labels, %d invalid-extension files.",
            report.corrupted_count, len(duplicate_label_rows), report.duplicate_image_group_count,
            report.duplicate_image_redundant_count, len(missing_images), len(missing_labels),
            len(invalid_extension_files),
        )
        return report

    def _find_duplicate_label_rows(self, labels_df: pd.DataFrame) -> pd.DataFrame:
        if labels_df.empty:
            return labels_df
        dup_mask = labels_df["filename"].duplicated(keep=False)
        return labels_df.loc[dup_mask].sort_values("filename").reset_index(drop=True)

    def _find_duplicate_images(self, merged_df: pd.DataFrame) -> dict[str, list[str]]:
        hashed = merged_df.dropna(subset=["phash"])
        if hashed.empty:
            return {}
        groups = hashed.groupby("phash")["filename"].apply(list)
        return {str(h): files for h, files in groups.items() if len(files) > 1}
