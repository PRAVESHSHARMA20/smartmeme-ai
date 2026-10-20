# Phase 12 Test Evaluation

## Model
- Backbone: mobilenet_v3_small
- Number of classes: 5
- Checkpoint used: `backend\training\checkpoints\best_model.pt` (epoch 2, validation macro-F1 at save time: 0.2043)

## Dataset
- Test sample count: 1032
- Class names: negative, neutral, positive, very_negative, very_positive

## Overall Metrics
- Accuracy: 0.3052
- Macro Precision: 0.2064
- Macro Recall: 0.2095
- Macro F1: 0.2032
- Weighted F1: 0.3173

## Per-Class Metrics
| Class | Precision | Recall | F1 | Support |
| --- | --- | --- | --- | --- |
| negative | 0.0556 | 0.0845 | 0.0670 | 71 |
| neutral | 0.3490 | 0.3190 | 0.3333 | 326 |
| positive | 0.4469 | 0.3478 | 0.3912 | 460 |
| very_negative | 0.0000 | 0.0000 | 0.0000 | 23 |
| very_positive | 0.1807 | 0.2961 | 0.2244 | 152 |

## Confusion Matrix
Saved to: `backend\training\output\test_confusion_matrix.png`

## Conclusion
On the held-out test set, the model reached 30.5% accuracy and a macro F1 of 0.2032 across 5 classes. Weighted F1 was 0.3173. Performance was uneven across classes: 'positive' had the highest F1 (0.3912) and 'very_negative' the lowest (0.0000). This report states the measured numbers only; interpretation and any model or training changes are addressed separately.