"""Merges the scanned image inventory with the CSV labels."""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from backend.utils.logger import get_logger

logger = get_logger(__name__)

MERGED_COLUMNS = ["filename", "image_path", "label", "width", "height", "format", "filesize", "corrupted", "phash"]


@dataclass
class MergeResult:
    merged_df: pd.DataFrame
    missing_images: list[str]
    missing_labels: list[str]


class DatasetMerger:
    def merge(self, images_df: pd.DataFrame, labels_df: pd.DataFrame) -> MergeResult:
        if images_df.empty:
            logger.warning("No scanned images to merge.")
        if labels_df.empty:
            logger.warning("No labels loaded to merge.")

        deduped_labels = labels_df.drop_duplicates(subset="filename", keep="first")
        dropped = len(labels_df) - len(deduped_labels)
        if dropped:
            logger.warning(
                "%d duplicate CSV row(s) collapsed to their first occurrence for merging "
                "(still reported separately as a data-quality issue).", dropped,
            )

        outer = images_df.merge(deduped_labels, on="filename", how="outer", indicator=True)

        missing_images = sorted(outer.loc[outer["_merge"] == "right_only", "filename"].tolist())
        missing_labels = sorted(outer.loc[outer["_merge"] == "left_only", "filename"].tolist())

        matched = outer.loc[outer["_merge"] == "both"].drop(columns="_merge")
        merged_df = matched.reindex(columns=MERGED_COLUMNS).reset_index(drop=True)
        merged_df["corrupted"] = merged_df["corrupted"].astype(bool)

        logger.info(
            "Merge complete: %d matched, %d missing images (in CSV, no file), %d missing labels (file, no CSV row).",
            len(merged_df), len(missing_images), len(missing_labels),
        )
        return MergeResult(merged_df=merged_df, missing_images=missing_images, missing_labels=missing_labels)
