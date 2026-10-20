"""Multimodal sentiment classifier: image features + text features -> fusion -> 5-class head."""

from __future__ import annotations

import torch
import torch.nn as nn

from backend.models.image_model import ImageSentimentClassifier
from backend.models.text_encoder import TextEncoder


class MultimodalSentimentClassifier(nn.Module):
    def __init__(
        self, num_classes: int, image_encoder: ImageSentimentClassifier, text_encoder: TextEncoder,
        fusion_hidden_dim: int = 256, dropout: float = 0.3,
    ) -> None:
        super().__init__()
        self.image_encoder = image_encoder
        self.text_encoder = text_encoder
        self.num_classes = num_classes

        fusion_input_dim = image_encoder.feature_dim + text_encoder.feature_dim
        self.fusion = nn.Sequential(
            nn.Linear(fusion_input_dim, fusion_hidden_dim), nn.ReLU(), nn.Dropout(dropout),
        )
        self.classifier = nn.Linear(fusion_hidden_dim, num_classes)

    def extract_fused_features(self, images, input_ids, attention_mask) -> torch.Tensor:
        image_features = self.image_encoder.extract_features(images)
        text_features = self.text_encoder(input_ids, attention_mask)
        combined = torch.cat([image_features, text_features], dim=1)
        return self.fusion(combined)

    def forward(self, images, input_ids, attention_mask) -> torch.Tensor:
        fused = self.extract_fused_features(images, input_ids, attention_mask)
        return self.classifier(fused)
