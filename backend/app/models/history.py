"""
SQLAlchemy ORM models for history tables.
"""
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class WeatherAnalysis(Base):
    __tablename__ = "weather_analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    location: Mapped[str] = mapped_column(String(120))
    crop: Mapped[str] = mapped_column(String(60))
    temperature: Mapped[float] = mapped_column(Float)
    humidity: Mapped[float] = mapped_column(Float)
    rainfall: Mapped[float] = mapped_column(Float, default=0.0)
    weather_condition: Mapped[str] = mapped_column(String(120))
    recommendation: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DiseaseAnalysis(Base):
    __tablename__ = "disease_analysis"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    crop: Mapped[str] = mapped_column(String(60))
    disease: Mapped[str] = mapped_column(String(120))
    confidence: Mapped[float] = mapped_column(Float)
    image_name: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ChatInteraction(Base):
    __tablename__ = "chat_interaction"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    crop: Mapped[str] = mapped_column(String(60), nullable=True)
    question: Mapped[str] = mapped_column(Text)
    answer: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
