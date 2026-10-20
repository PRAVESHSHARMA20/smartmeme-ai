"""A minimal, JSON-serializable label encoder."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable, Sequence


class LabelEncoder:
    def __init__(self) -> None:
        self.classes_: list[str] = []
        self._label_to_index: dict[str, int] = {}

    def fit(self, labels: Iterable[str]) -> "LabelEncoder":
        unique_labels = sorted(set(labels))
        self.classes_ = unique_labels
        self._label_to_index = {label: idx for idx, label in enumerate(unique_labels)}
        return self

    def transform(self, labels: Sequence[str]) -> list[int]:
        if not self._label_to_index:
            raise RuntimeError("LabelEncoder must be fit() before calling transform().")
        try:
            return [self._label_to_index[label] for label in labels]
        except KeyError as exc:
            raise ValueError(f"Label {exc} was not seen during fit(). Known labels: {self.classes_}") from exc

    def fit_transform(self, labels: Sequence[str]) -> list[int]:
        self.fit(labels)
        return self.transform(labels)

    def inverse_transform(self, indices: Sequence[int]) -> list[str]:
        return [self.classes_[i] for i in indices]

    @property
    def num_classes(self) -> int:
        return len(self.classes_)

    def to_dict(self) -> dict:
        return {"classes": self.classes_, "label_to_index": self._label_to_index}

    def save(self, path: Path) -> None:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_dict(), indent=2))

    @staticmethod
    def load(path: Path) -> "LabelEncoder":
        data = json.loads(Path(path).read_text())
        encoder = LabelEncoder()
        encoder.classes_ = data["classes"]
        encoder._label_to_index = {k: int(v) for k, v in data["label_to_index"].items()}
        return encoder
