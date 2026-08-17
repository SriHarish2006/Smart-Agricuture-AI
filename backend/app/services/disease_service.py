"""
Business logic for leaf disease analysis: validates uploads, calls the ML
model, and enriches the raw prediction with symptoms / recommended actions
from data/disease_classes.json.
"""
import json
from typing import Dict

from app.config import get_settings
from app.ml.disease_model import DiseaseModel, ModelNotAvailableError
from app.schemas.disease import DiseasePrediction

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024  # 8 MB


class DiseaseServiceError(Exception):
    """User-facing error for the disease detection flow."""


def _load_class_metadata() -> Dict[str, dict]:
    settings = get_settings()
    if not settings.disease_classes_path.exists():
        return {}
    with open(settings.disease_classes_path, "r", encoding="utf-8") as f:
        return json.load(f)


def validate_upload(content_type: str, size: int) -> None:
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise DiseaseServiceError("Unsupported file type. Please upload a JPG, JPEG, PNG, or WEBP image.")
    if size > MAX_UPLOAD_BYTES:
        raise DiseaseServiceError("Image is too large. Please upload an image smaller than 8 MB.")
    if size == 0:
        raise DiseaseServiceError("The uploaded file appears to be empty.")


def analyze_leaf(crop: str, image_bytes: bytes) -> DiseasePrediction:
    model = DiseaseModel.get_instance()

    try:
        class_name, confidence = model.predict(image_bytes)
    except ModelNotAvailableError as exc:
        raise DiseaseServiceError(str(exc))
    except ValueError as exc:
        raise DiseaseServiceError(str(exc))

    settings = get_settings()
    metadata = _load_class_metadata()
    class_info = next(
        (info for info in metadata.values() if info.get("name") == class_name),
        None,
    )

    is_low_confidence = confidence < settings.disease_confidence_threshold

    if class_info:
        symptoms = class_info.get("symptoms", "No description available.")
        actions = class_info.get("recommended_actions", [])
        display_name = class_info.get("display_name", class_name)
        detected_crop = class_info.get("crop", crop)
    else:
        symptoms = "No description available for this class."
        actions = ["Consult a local agricultural extension officer for further guidance."]
        display_name = class_name.replace("_", " ").replace("__", " ").strip()
        detected_crop = crop

    return DiseasePrediction(
        crop=detected_crop,
        disease=display_name,
        confidence=round(confidence * 100, 1),
        is_low_confidence=is_low_confidence,
        symptoms=symptoms,
        recommended_actions=actions,
    )
