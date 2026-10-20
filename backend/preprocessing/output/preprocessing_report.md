# SmartMeme AI — Preprocessing Report (Phase 11)

Generated: 2026-08-07T09:57:52.760094+00:00
Dataset folder: `C:\Users\prave\OneDrive\Desktop\6992 Meme Images Dataset with Labels\images`
Labels CSV: `C:\Users\prave\OneDrive\Desktop\6992 Meme Images Dataset with Labels\labels.csv`

## Pipeline summary
- **Original CSV records:** 6992
- **Images scanned on disk:** 6991
- **Matched (image + label):** 6991
- **Missing images** (in CSV, file not found): 1
- **Missing labels** (file found, not in CSV): 0
- **Corrupted (excluded):** 1
- **Duplicate groups (excluded, kept 1 each):** 67 (109 redundant images removed)
- **Final usable images:** 6881

## Class distribution (final usable dataset)
| Class | Images |
| --- | --- |
| positive | 3068 |
| neutral | 2173 |
| very_positive | 1018 |
| negative | 473 |
| very_negative | 149 |

## Splits (5 classes: negative, neutral, positive, very_negative, very_positive)
- **Train:** 4817
- **Validation:** 1032
- **Test:** 1032

### Class distribution per split
| Class | Train | Validation | Test |
| --- | --- | --- | --- |
| negative | 331 | 71 | 71 |
| neutral | 1521 | 326 | 326 |
| positive | 2148 | 460 | 460 |
| very_negative | 104 | 22 | 23 |
| very_positive | 713 | 153 | 152 |

## Data leakage check
- **Passed:** Yes
- Filenames appearing in more than one split: 0
- Duplicate-hash groups spanning more than one split: 0

## Transform verification
- **Passed:** Yes
- Sample images checked: 5
- Visual proof: `backend\preprocessing\output\preprocessing_sample_proof.png`

## Configuration
- Image size: 224x224
- Pad color: (0, 0, 0)
- Normalization mean/std: (0.485, 0.456, 0.406) / (0.229, 0.224, 0.225)
- Batch size: 32
- Split ratios: 0.7 / 0.15 / 0.15 (train/val/test)
- Random seed: 42

## Recommendations
- 1 corrupted image(s) were excluded — no action needed, already handled.
- 109 redundant duplicate image(s) across 67 group(s) were excluded before splitting — no action needed.
- 1 CSV row(s) referenced an image file that doesn't exist.
- Class imbalance is present (see class_distribution). Not corrected at this stage per design — address later via class-weighted loss, oversampling, or augmentation during training, not by duplicating images here.