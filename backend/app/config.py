"""
Central application configuration.

All secrets and environment-dependent values are loaded from environment
variables / a local .env file. Nothing sensitive is hard-coded here.
"""
from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent  # backend/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(BASE_DIR / ".env"), extra="ignore")

    # Weather
    weather_api_key: str = ""
    weather_api_base_url: str = "https://api.openweathermap.org/data/2.5"

    # CORS
    cors_origins: str = "http://localhost:5173"

    # Database
    database_url: str = f"sqlite:///{BASE_DIR / 'agriculture.db'}"

    # ML
    disease_confidence_threshold: float = 0.60
    model_path: Path = BASE_DIR.parent / "models" / "leaf_disease_model.keras"
    class_names_path: Path = BASE_DIR.parent / "models" / "class_names.json"

    # Data
    chatbot_qa_path: Path = BASE_DIR.parent / "data" / "chatbot_qa.json"
    disease_classes_path: Path = BASE_DIR.parent / "data" / "disease_classes.json"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
