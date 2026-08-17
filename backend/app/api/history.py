from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.history import ChatInteraction, DiseaseAnalysis, WeatherAnalysis
from app.schemas.chatbot import ChatHistoryItem
from app.schemas.disease import DiseaseHistoryItem
from app.schemas.weather import WeatherHistoryItem

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("/weather", response_model=List[WeatherHistoryItem])
def weather_history(db: Session = Depends(get_db)):
    return db.query(WeatherAnalysis).order_by(WeatherAnalysis.created_at.desc()).limit(50).all()


@router.get("/disease", response_model=List[DiseaseHistoryItem])
def disease_history(db: Session = Depends(get_db)):
    return db.query(DiseaseAnalysis).order_by(DiseaseAnalysis.created_at.desc()).limit(50).all()


@router.get("/chat", response_model=List[ChatHistoryItem])
def chat_history(db: Session = Depends(get_db)):
    return db.query(ChatInteraction).order_by(ChatInteraction.created_at.desc()).limit(50).all()


@router.delete("/clear", summary="Clear all history (requires explicit confirmation on the frontend)")
def clear_history(db: Session = Depends(get_db)):
    db.execute(delete(WeatherAnalysis))
    db.execute(delete(DiseaseAnalysis))
    db.execute(delete(ChatInteraction))
    db.commit()
    return {"status": "cleared"}
