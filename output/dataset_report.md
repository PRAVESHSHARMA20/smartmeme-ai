# SmartMeme AI — Dataset Report

Generated: 2026-08-06T09:34:04.930919+00:00
Dataset folder: `C:\Users\prave\OneDrive\Desktop\6992 Meme Images Dataset with Labels\images`
Labels CSV: `C:\Users\prave\OneDrive\Desktop\6992 Meme Images Dataset with Labels\labels.csv`

## Dataset summary
- **Images scanned:** 6991
- **Images matched to a label:** 6991
- **Labels:** 5
- **Average file size:** 102.96 KB

## Label distribution
| Label | Images |
| --- | --- |
| positive | 3126 |
| neutral | 2201 |
| very_positive | 1033 |
| negative | 480 |
| very_negative | 151 |

## Class imbalance
- Largest label: **positive**
- Smallest label: **very_negative**
- Ratio: **20.70x** (flag threshold: 3.0x)
- Flagged as imbalanced: **Yes**

## Duplicate analysis
- Duplicate image groups (perceptual hash): **67** (109 redundant images)
- Duplicate CSV rows (same filename): **0**

## Corruption analysis
- Corrupted files: **1**
  - `image_5119.png`

## Missing file analysis
- Missing images (in CSV, file not found): **1**
- Missing labels (file found, not in CSV): **0**
- Unsupported-extension files skipped: **1**

## Image dimensions
```
{
  "width": {
    "count": 6990.0,
    "mean": 587.05,
    "std": 256.86,
    "min": 100.0,
    "25%": 480.0,
    "50%": 500.0,
    "75%": 640.0,
    "max": 4961.0
  },
  "height": {
    "count": 6990.0,
    "mean": 546.48,
    "std": 250.06,
    "min": 123.0,
    "25%": 391.25,
    "50%": 500.0,
    "75%": 648.0,
    "max": 5553.0
  },
  "aspect_ratio": {
    "count": 6990.0,
    "mean": 1.14,
    "std": 0.36,
    "min": 0.33,
    "25%": 0.88,
    "50%": 1.01,
    "75%": 1.35,
    "max": 4.35
  }
}
```

## Recommendations
- 1 corrupted image(s) found — remove or re-export them before training; a corrupted file will crash a naive data loader.
- 67 duplicate image group(s) found (109 redundant files) — de-duplicate before splitting into train/validation/test to avoid leakage across splits.
- 1 filename(s) in the CSV have no matching image file — these rows can't be used and should be removed from the label set.
- 1 file(s) in the dataset folder have unsupported extensions and were skipped entirely — confirm they aren't images in disguise.
- Class imbalance detected (20.7x between 'positive' and 'very_negative') — consider class weighting, oversampling the minority class, or augmentation.

## Charts
- Class distribution: `output\class_distribution.png`
- Dimension distribution: `output\dimension_distribution.png`
- Sample images: `output\sample_images.png`