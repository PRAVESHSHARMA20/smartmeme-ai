"""Leakage checks specific to the multimodal setting (Phase 13).

Note: identical text across splits is reported as a data point, not
automatically treated as a defect. Meme templates naturally recur with
the same caption text across many different images — that is a real,
legitimate property of meme datasets, not necessarily leakage. Only
identical FILENAMES or identical IMAGE HASHES across splits represent an
actual leaked sample; identical text is surfaced separately so a human
can judge whether a given case is genuine leakage (e.g., the exact same
post duplicated) or expected repetition (a popular template reused by
different posters).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

import pandas as pd

from backend.utils.image_utils import average_hash, safe_open_image
from backend.utils.logger import get_logger
from backend.utils.progress import progress_iter

logger = get_logger(__name__)


@dataclass
class MultimodalLeakageReport:
    filename_overlaps: list = field(default_factory=list)
    image_hash_overlaps: list = field(default_factory=list)
    text_overlaps: list = field(default_factory=list)

    @property
    def passed(self) -> bool:
        # Text overlaps are informational, not a pass/fail leakage signal —
        # see module docstring. Only filename/image-hash overlaps are real
        # leakage.
        return not self.filename_overlaps and not self.image_hash_overlaps

    def to_dict(self) -> dict:
        return {
            "passed": self.passed,
            "filename_overlap_count": len(self.filename_overlaps),
            "filename_overlaps": self.filename_overlaps,
            "image_hash_overlap_count": len(self.image_hash_overlaps),
            "image_hash_overlaps": self.image_hash_overlaps,
            "text_overlap_count": len(self.text_overlaps),
            "text_overlaps": self.text_overlaps,
            "text_overlap_note": (
                "Identical text across splits is reported for visibility only — it is NOT treated as a "
                "leakage failure, since meme templates legitimately reuse the same caption across many "
                "different images. Review text_overlaps manually if the count is unexpectedly high."
            ),
        }


def check_filename_overlap(splits: dict) -> list:
    combined = pd.concat([df.assign(_split=name) for name, df in splits.items()], ignore_index=True)
    counts = combined.groupby("filename")["_split"].nunique()
    return sorted(counts[counts > 1].index.tolist())


def check_image_hash_overlap(splits: dict, hash_size: int = 8) -> list:
    hash_to_split_files: dict = {}
    all_rows = [
        (split_name, row["filename"], row["image_path"])
        for split_name, df in splits.items() for _, row in df.iterrows()
    ]
    for split_name, filename, image_path in progress_iter(all_rows, desc="Re-hashing images for leakage check"):
        image = safe_open_image(Path(image_path))
        if image is None:
            continue
        try:
            digest = average_hash(image, hash_size=hash_size)
        finally:
            image.close()
        hash_to_split_files.setdefault(digest, []).append((split_name, filename))

    overlaps = []
    for digest, entries in hash_to_split_files.items():
        splits_involved = {s for s, _ in entries}
        if len(splits_involved) > 1:
            overlaps.append({"hash": digest, "entries": [{"split": s, "filename": f} for s, f in entries]})
    return overlaps


def check_text_overlap(splits: dict, text_column: str = "text") -> list:
    combined = pd.concat([df.assign(_split=name) for name, df in splits.items()], ignore_index=True)
    combined["_norm_text"] = combined[text_column].astype(str).str.strip().str.lower()
    non_empty = combined[combined["_norm_text"] != ""]

    overlaps = []
    for text, group in non_empty.groupby("_norm_text"):
        splits_involved = group["_split"].unique()
        if len(splits_involved) > 1:
            overlaps.append({
                "text": text,
                "entries": [{"split": row["_split"], "filename": row["filename"]} for _, row in group.iterrows()],
            })
    return overlaps


def run_all_leakage_checks(splits: dict, text_column: str = "text", hash_size: int = 8, check_image_hashes: bool = True) -> MultimodalLeakageReport:
    logger.info("Running multimodal leakage checks across %d splits...", len(splits))

    filename_overlaps = check_filename_overlap(splits)
    image_hash_overlaps = check_image_hash_overlap(splits, hash_size=hash_size) if check_image_hashes else []
    text_overlaps = check_text_overlap(splits, text_column=text_column)

    report = MultimodalLeakageReport(filename_overlaps=filename_overlaps, image_hash_overlaps=image_hash_overlaps, text_overlaps=text_overlaps)

    if report.passed:
        logger.info(
            "Leakage checks passed: no filename or image-hash overlap across splits. "
            "(%d identical-text case(s) found — informational only, not a failure; see report.)",
            len(text_overlaps),
        )
    else:
        logger.error(
            "LEAKAGE DETECTED: %d filename overlap(s), %d image-hash overlap(s). "
            "(%d identical-text case(s) also found, reported separately.)",
            len(filename_overlaps), len(image_hash_overlaps), len(text_overlaps),
        )
    return report
