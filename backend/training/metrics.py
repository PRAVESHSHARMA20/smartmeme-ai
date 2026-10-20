"""Evaluation metrics: accuracy, precision, recall, F1, confusion matrix."""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score


@dataclass
class EvaluationMetrics:
    accuracy: float
    precision_macro: float
    recall_macro: float
    f1_macro: float
    f1_weighted: float
    precision_weighted: float
    recall_weighted: float
    precision_per_class: dict = field(default_factory=dict)
    recall_per_class: dict = field(default_factory=dict)
    f1_per_class: dict = field(default_factory=dict)
    support_per_class: dict = field(default_factory=dict)
    confusion_matrix: list = field(default_factory=list)
    class_names: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "accuracy": self.accuracy, "precision_macro": self.precision_macro,
            "recall_macro": self.recall_macro, "f1_macro": self.f1_macro,
            "f1_weighted": self.f1_weighted, "precision_weighted": self.precision_weighted,
            "recall_weighted": self.recall_weighted, "precision_per_class": self.precision_per_class,
            "recall_per_class": self.recall_per_class, "f1_per_class": self.f1_per_class,
            "support_per_class": self.support_per_class, "confusion_matrix": self.confusion_matrix,
            "class_names": self.class_names,
        }


def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray, class_names: list) -> EvaluationMetrics:
    labels = list(range(len(class_names)))

    accuracy = accuracy_score(y_true, y_pred)
    precision_macro = precision_score(y_true, y_pred, labels=labels, average="macro", zero_division=0)
    recall_macro = recall_score(y_true, y_pred, labels=labels, average="macro", zero_division=0)
    f1_macro = f1_score(y_true, y_pred, labels=labels, average="macro", zero_division=0)

    precision_weighted = precision_score(y_true, y_pred, labels=labels, average="weighted", zero_division=0)
    recall_weighted = recall_score(y_true, y_pred, labels=labels, average="weighted", zero_division=0)
    f1_weighted = f1_score(y_true, y_pred, labels=labels, average="weighted", zero_division=0)

    precision_per_class = precision_score(y_true, y_pred, labels=labels, average=None, zero_division=0)
    recall_per_class = recall_score(y_true, y_pred, labels=labels, average=None, zero_division=0)
    f1_per_class = f1_score(y_true, y_pred, labels=labels, average=None, zero_division=0)
    support_per_class = np.bincount(np.asarray(y_true), minlength=len(class_names))

    cm = confusion_matrix(y_true, y_pred, labels=labels)

    return EvaluationMetrics(
        accuracy=float(accuracy), precision_macro=float(precision_macro), recall_macro=float(recall_macro),
        f1_macro=float(f1_macro), f1_weighted=float(f1_weighted), precision_weighted=float(precision_weighted),
        recall_weighted=float(recall_weighted),
        precision_per_class=dict(zip(class_names, precision_per_class.tolist())),
        recall_per_class=dict(zip(class_names, recall_per_class.tolist())),
        f1_per_class=dict(zip(class_names, f1_per_class.tolist())),
        support_per_class=dict(zip(class_names, support_per_class.tolist())),
        confusion_matrix=cm.tolist(), class_names=class_names,
    )
