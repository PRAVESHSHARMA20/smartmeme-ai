from pathlib import Path
import io
import sys

import torch
from PIL import Image
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from torchvision import transforms
from transformers import AutoTokenizer

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from backend.models.image_model import ImageSentimentClassifier
from backend.models.text_encoder import TextEncoder
from backend.models.multimodal_model import MultimodalSentimentClassifier

CHECKPOINT = ROOT / "backend" / "training" / "checkpoints_multimodal_exp3" / "best_model.pt"
DEVICE = torch.device("cpu")

app = FastAPI(title="SmartMeme AI Inference API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = None
tokenizer = None
class_names = ["negative", "neutral", "positive", "very_negative", "very_positive"]

image_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=(0.485, 0.456, 0.406),
        std=(0.229, 0.224, 0.225),
    ),
])


@app.on_event("startup")
def load_model():
    global model, tokenizer, class_names

    if not CHECKPOINT.exists():
        raise RuntimeError(f"Checkpoint not found: {CHECKPOINT}")

    checkpoint = torch.load(CHECKPOINT, map_location=DEVICE, weights_only=False)

    class_names = checkpoint.get("class_names", class_names)
    config = checkpoint.get("config", {})

    def get_config(key, default):
        value = config.get(key, default)
        if isinstance(value, str):
            return value.strip().strip('"').strip("'")
        return value

    image_backbone = checkpoint.get(
        "image_backbone", get_config("image_backbone", "mobilenet_v3_small")
    )
    text_model_name = checkpoint.get(
        "text_model_name", get_config("text_model_name", "distilbert-base-uncased")
    )
    num_classes = int(checkpoint.get("num_classes", len(class_names)))
    pooling = get_config("text_pooling", "mean")
    fusion_dim = int(get_config("fusion_hidden_dim", 256))
    max_length = int(checkpoint.get("max_text_length", get_config("max_text_length", 64)))

    image_encoder = ImageSentimentClassifier(
        num_classes=num_classes,
        backbone_name=image_backbone,
        pretrained=False,
        freeze_backbone=False,
        dropout=0.2,
    )

    text_encoder = TextEncoder(
        model_name=text_model_name,
        freeze=False,
        pooling=pooling,
    )

    model = MultimodalSentimentClassifier(
        num_classes=num_classes,
        image_encoder=image_encoder,
        text_encoder=text_encoder,
        fusion_hidden_dim=fusion_dim,
        dropout=0.5,
    )

    model.load_state_dict(checkpoint["model_state_dict"], strict=True)
    model.to(DEVICE)
    model.eval()

    tokenizer = AutoTokenizer.from_pretrained(text_model_name)
    app.state.max_text_length = max_length
    print("SmartMeme AI model loaded successfully.")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "task": "five-class meme sentiment classification",
    }


@app.post("/analyze")
async def analyze(
    image: UploadFile = File(...),
    caption: str = Form(""),
):
    if model is None or tokenizer is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload an image file.")

    try:
        contents = await image.read()
        if len(contents) > 15 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image must be 15 MB or smaller.")

        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_tensor = image_transform(pil_image).unsqueeze(0)

        encoded = tokenizer(
            caption or "",
            max_length=app.state.max_text_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt",
        )

        with torch.inference_mode():
            logits = model(
                image_tensor.to(DEVICE),
                encoded["input_ids"].to(DEVICE),
                encoded["attention_mask"].to(DEVICE),
            )
            probabilities = torch.softmax(logits, dim=1)[0]
            predicted_index = int(probabilities.argmax().item())

        return {
            "task": "sentiment",
            "sentiment": class_names[predicted_index],
            "confidence": round(float(probabilities[predicted_index].item()), 4),
            "probabilities": {
                name: round(float(probabilities[i].item()), 4)
                for i, name in enumerate(class_names)
            },
            "safety_status": "not_assessed",
            "message": "This model predicts sentiment only; it does not verify whether a meme is safe or harmful.",
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {exc}") from exc
