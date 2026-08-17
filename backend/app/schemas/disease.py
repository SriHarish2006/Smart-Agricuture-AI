from datetime import datetime
from typing import List

from pydantic import BaseModel


class DiseasePrediction(BaseModel):
    crop: str
    disease: str
    confidence: float
    is_low_confidence: bool
    symptoms: str
    recommended_actions: List[str]


class DiseaseHistoryItem(BaseModel):
    id: int
    crop: str
    disease: str
    confidence: float
    image_name: str
    created_at: datetime

    class Config:
        from_attributes = True
