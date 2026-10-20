"""Image classification model: pretrained backbone + classification head."""

from __future__ import annotations

import torch
import torch.nn as nn
import torchvision.models as tv_models

SUPPORTED_BACKBONES = ("mobilenet_v3_small", "resnet18")


class ImageSentimentClassifier(nn.Module):
    def __init__(
        self, num_classes: int, backbone_name: str = "mobilenet_v3_small",
        pretrained: bool = True, freeze_backbone: bool = False, dropout: float = 0.2,
    ) -> None:
        super().__init__()
        if backbone_name not in SUPPORTED_BACKBONES:
            raise ValueError(f"Unsupported backbone '{backbone_name}'. Choose from {SUPPORTED_BACKBONES}.")

        self.backbone_name = backbone_name
        self.num_classes = num_classes
        self.backbone, self.feature_dim = self._build_backbone(backbone_name, pretrained)

        if freeze_backbone:
            for param in self.backbone.parameters():
                param.requires_grad = False

        self.classifier = nn.Sequential(nn.Dropout(dropout), nn.Linear(self.feature_dim, num_classes))

    @staticmethod
    def _build_backbone(name: str, pretrained: bool) -> tuple[nn.Module, int]:
        if name == "mobilenet_v3_small":
            weights = tv_models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
            net = tv_models.mobilenet_v3_small(weights=weights)
            feature_dim = net.classifier[0].in_features
            net.classifier = nn.Identity()
            return net, feature_dim
        if name == "resnet18":
            weights = tv_models.ResNet18_Weights.DEFAULT if pretrained else None
            net = tv_models.resnet18(weights=weights)
            feature_dim = net.fc.in_features
            net.fc = nn.Identity()
            return net, feature_dim
        raise ValueError(f"Unsupported backbone: {name}")

    def extract_features(self, x: torch.Tensor) -> torch.Tensor:
        return self.backbone(x)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.extract_features(x)
        return self.classifier(features)
