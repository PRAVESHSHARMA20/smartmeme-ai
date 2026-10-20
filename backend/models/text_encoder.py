"""Text encoder: pretrained transformer -> pooled feature vector."""

from __future__ import annotations

import torch
import torch.nn as nn
from transformers import AutoModel

DEFAULT_MODEL_NAME = "distilbert-base-uncased"


class TextEncoder(nn.Module):
    def __init__(self, model_name: str = DEFAULT_MODEL_NAME, freeze: bool = False, pooling: str = "mean") -> None:
        super().__init__()
        if pooling not in ("mean", "cls"):
            raise ValueError(f"pooling must be 'mean' or 'cls', got '{pooling}'")

        self.model_name = model_name
        self.pooling = pooling
        self.backbone = AutoModel.from_pretrained(model_name)
        self.feature_dim = self.backbone.config.hidden_size

        if freeze:
            for param in self.backbone.parameters():
                param.requires_grad = False

    def forward(self, input_ids: torch.Tensor, attention_mask: torch.Tensor) -> torch.Tensor:
        outputs = self.backbone(input_ids=input_ids, attention_mask=attention_mask)
        hidden_states = outputs.last_hidden_state

        if self.pooling == "cls":
            return hidden_states[:, 0]

        mask = attention_mask.unsqueeze(-1).to(hidden_states.dtype)
        summed = (hidden_states * mask).sum(dim=1)
        token_counts = mask.sum(dim=1).clamp(min=1e-9)
        return summed / token_counts
