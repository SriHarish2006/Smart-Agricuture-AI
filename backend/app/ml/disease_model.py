"""
Leaf disease inference.

Loads the trained Keras model and class-name mapping ONCE at import time and
reuses them for every request. If the trained model file is not present, the
service raises a clear, explicit error instead of silently returning a fake
or random prediction (see requirement: never fake AI predictions).
"""
import json
import logging
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
from PIL import Image

from app.config import get_settings

logger = logging.getLogger(__name__)

IMAGE_SIZE = (224, 224)  # EfficientNetB0 default input size


class ModelNotAvailableError(Exception):
    """Raised when the trained model or class map has not been produced yet."""


class DiseaseModel:
    _instance: "DiseaseModel | None" = None

    def __init__(self):
        settings = get_settings()
        self.model_path: Path = settings.model_path
        self.class_names_path: Path = settings.class_names_path
        self._model = None
        self._class_names: List[str] | None = None
        self._load_error: str | None = None
        self._try_load()

    def _try_load(self) -> None:
        if not self.model_path.exists():
            self._load_error = (
                f"Trained model not found at '{self.model_path}'. "
                "Run 'python backend/ml/train_model.py' after preparing a labeled "
                "leaf-disease image dataset, or place a pre-trained "
                "'leaf_disease_model.keras' file at that path."
            )
            return

        if not self.class_names_path.exists():
            self._load_error = (
                f"Class-name mapping not found at '{self.class_names_path}'. "
                "This file is produced automatically by the training script."
            )
            return

        try:
            # Imported lazily so the API can start even without TensorFlow
            # installed in environments that only need the /health endpoint.
            import tensorflow as tf

            self._model = tf.keras.models.load_model(self.model_path)
            with open(self.class_names_path, "r", encoding="utf-8") as f:
                self._class_names = json.load(f)
            logger.info("Leaf disease model loaded from %s", self.model_path)
        except Exception as exc:  # noqa: BLE001
            self._model = None
            self._load_error = f"Failed to load the trained model: {exc}"

    @property
    def is_available(self) -> bool:
        return self._model is not None and self._class_names is not None

    @property
    def load_error(self) -> str | None:
        return self._load_error

    def predict(self, image_bytes: bytes) -> Tuple[str, float]:
        if not self.is_available:
            raise ModelNotAvailableError(self._load_error or "Model is not available.")

        try:
            image = Image.open(__import__("io").BytesIO(image_bytes))
            image = image.convert("RGB")
            image = image.resize(IMAGE_SIZE)
        except Exception:
            raise ValueError("Unable to read the uploaded file as an image.")

        array = np.asarray(image, dtype=np.float32)
        array = np.expand_dims(array, axis=0)

        import tensorflow as tf

        array = tf.keras.applications.efficientnet.preprocess_input(array)

        predictions = self._model.predict(array, verbose=0)[0]
        top_index = int(np.argmax(predictions))
        confidence = float(predictions[top_index])
        class_name = self._class_names[top_index] if 0 <= top_index < len(self._class_names) else "Unknown"
        return class_name, confidence

    @classmethod
    def get_instance(cls) -> "DiseaseModel":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
