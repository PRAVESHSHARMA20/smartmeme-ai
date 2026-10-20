# SmartMeme AI — Backend

## Phase 10: Dataset Analysis (single folder + CSV labels)

Tested end-to-end against a synthetic 20-image flat-folder + CSV dataset before delivery, covering every edge case: corrupted file, true duplicate image, duplicate CSV row, missing image, missing label, invalid-extension file, and renamed CSV columns. See "Verified" below.

### Setup
```bash
cd backend
pip install -r requirements.txt
```

### Configure
Open `backend/dataset/config.py` and set:
```python
DATASET_ROOT = Path(r"C:\Users\prave\OneDrive\Desktop\6992 Meme Images Dataset with Labels")
CSV_PATH = Path(r"C:\Users\prave\OneDrive\Desktop\6992 Meme Images Dataset with Labels\labels.csv")
OUTPUT_DIR = Path("./output")

CSV_FILENAME_COLUMN = "filename"  # change if your CSV header differs
CSV_LABEL_COLUMN = "label"        # change if your CSV header differs
```
That's the only file you need to edit for your dataset.

### Run
```bash
python -m backend.dataset
```
No arguments required — everything comes from `config.py`. (Optional overrides exist for convenience: `--dataset-root`, `--csv-path`, `--output-dir`.)

### Expected output
Console:
```
Dataset root: C:\Users\prave\...\6992 Meme Images Dataset with Labels
Labels CSV:   C:\Users\prave\...\labels.csv
Output dir:   output
Loaded 6992 label rows from ...\labels.csv
Scanning images: 100%|██████████| 6992/6992 [00:XX<00:00, XXXimg/s]
Scanned 6992 image files (0 file(s) skipped for unsupported extensions).
Merge complete: 6990 matched, 1 missing images (in CSV, no file), 1 missing labels (file, no CSV row).
Validation complete: 3 corrupted, 2 duplicate image groups (2 redundant), ...
Dataset analysis complete.
Matched images: 6990 across 2 labels
Report written to: /path/to/backend/dataset/output
```
Files written to `backend/dataset/output/`:
- `dataset_report.md` — dataset summary, label distribution, class imbalance, duplicate analysis, corruption analysis, missing-file analysis, and auto-generated recommendations
- `dataset_report.json` — same data, structured, for the future preprocessing/API phases to consume directly
- `class_distribution.png`, `dimension_distribution.png`, `sample_images.png`

### Verified
Ran the full pipeline against a generated 20-image flat-folder dataset with a CSV using **renamed columns** (to confirm the config-only fix works and produces a clear error when columns don't match), containing: one corrupted file, one true duplicate image, one duplicate CSV row, one CSV row with no matching image, one image with no CSV row, and one non-image file. All were correctly detected. One real bug was found and fixed during this testing — see below.

## Structure (only `dataset/` changed from Phase 10 v1)
```
backend/
  dataset/
    config.py         Paths + CSV column names — the only file you edit per-dataset
    csv_loader.py       Reads the labels CSV (new)
    scanner.py           Flat-folder scan; one open() per image collects
                          dimensions/format/filesize/corruption/hash together
    merger.py             Joins images with labels, surfaces missing rows (new)
    validator.py           Corruption, duplicates (image + CSV row), missing data
    statistics.py            Label counts, file size, resolution, imbalance
    visualizer.py             class_distribution.png / dimension_distribution.png / sample_images.png
    report.py                 Orchestrates all of the above -> .md + .json
    __main__.py                CLI — zero arguments required
  utils/              unchanged (logger, image_utils, progress)
  preprocessing/ models/ training/ api/    unchanged placeholders
  requirements.txt    unchanged
```

## What changed and why
- **Single-pass scanning:** each image is opened exactly once. Dimensions, format, corruption status, and the duplicate-detection hash are all read from that one `Image.open()` call in `scanner.py`, instead of three separate passes each re-reading the same file. At ~7,000 images this is the difference between ~7,000 and ~21,000 disk reads.
- **CSV-driven, not folder-driven:** labels come entirely from the CSV via `csv_loader.py`; column names are the only thing that needs to change if your CSV headers differ.
- **A real bug found by testing, not assumed away:** when a CSV had two rows for the same filename, a naive join multiplied that image into two rows — which then falsely looked like a *duplicate image* even though it was really a *duplicate label row*. Fixed in `merger.py` by deduplicating on filename before the join, while `validator.py` still reports the duplicate CSV row itself as its own, separate issue.
- **The CSV is no longer mistaken for a stray file:** since your `CSV_PATH` sits inside the same folder as `DATASET_ROOT`, the scanner now explicitly excludes it from the file listing — otherwise your own labels file would show up in the report as an "invalid extension" file.

---

## Phase 11: Preprocessing

Builds on Phase 10 — reuses `CSVLoader`, `ImageScanner`, `DatasetMerger`, `DatasetValidator` directly rather than re-implementing scanning/validation, so there's one source of truth for what counts as a valid image.

### Configure
`backend/dataset/config.py` already has your real paths and CSV columns (`image_name` / `overall_sentiment`) set as the defaults. `backend/preprocessing/config.py` controls image size (224 default), batch size, normalization, and split ratios (70/15/15 default) — edit if needed, no code changes required.

### Run
```bash
python -m backend.preprocessing
```
No arguments required.

### Output
`backend/preprocessing/output/`:
- `train.csv`, `validation.csv`, `test.csv` — columns: `filename, image_path, label, label_id`
- `label_encoder.json` — `{"classes": [...], "label_to_index": {...}}`
- `preprocessing_report.md` / `.json` — full breakdown: counts at every stage, class distribution overall and per-split, data-leakage check, transform verification, configuration, recommendations
- `preprocessing_sample_proof.png` — 3 real sample images, before/after the resize+pad transform (visual proof it works, not a claim)

### Design decisions
- **No materialized resized image files.** `transforms.py` provides tested, reusable functions (`preprocess_image`, `resize_with_padding`, `normalize_pixels`) applied on-the-fly during training in Phase 12+, rather than pre-computing and saving ~7,000 resized copies. Verified against real sample images from the dataset (not synthetic placeholders) each run, with a saved before/after proof image.
- **Duplicates and corrupted images are removed before splitting, never after** — this is structural, not a step someone could accidentally reorder, because `PreprocessingPipeline.run()` only calls the splitter after both removal steps.
- **A real bug was found and fixed during testing:** pandas promotes boolean columns to `object` dtype across an outer merge (NaN on unmatched rows). `~column` on an object-dtype column silently does Python bitwise-NOT on booleans instead of logical negation. Fixed in `backend/dataset/merger.py` by restoring proper `bool` dtype immediately after the merge — this was a latent issue in Phase 10 as well, now fixed at the source both phases share.
