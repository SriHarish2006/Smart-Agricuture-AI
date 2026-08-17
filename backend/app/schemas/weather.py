from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class WeatherRequest(BaseModel):
    location: str = Field(..., min_length=1, max_length=120, description="City or place name")
    crop: str = Field(..., min_length=1, max_length=60, description="Crop the farmer is growing")


class ForecastDay(BaseModel):
    date: str
    min_temp: float
    max_temp: float
    condition: str
    rain_probability: Optional[float] = None


class FarmingRecommendation(BaseModel):
    summary: str
    irrigation_advice: str
    spraying_advice: str
    general_advice: str


class WeatherResponse(BaseModel):
    location: str
    crop: str
    temperature: float
    feels_like: float
    humidity: float
    rainfall: float
    wind_speed: float
    condition: str
    cloud_coverage: Optional[float] = None
    rain_probability: Optional[float] = None
    forecast: List[ForecastDay] = []
    recommendation: FarmingRecommendation


class WeatherHistoryItem(BaseModel):
    id: int
    location: str
    crop: str
    temperature: float
    weather_condition: str
    recommendation: str
    created_at: datetime

    class Config:
        from_attributes = True
