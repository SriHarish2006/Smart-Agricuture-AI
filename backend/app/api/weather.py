from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.history import WeatherAnalysis
from app.schemas.weather import WeatherHistoryItem, WeatherRequest, WeatherResponse
from app.services.weather_service import WeatherServiceError, fetch_weather

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.post("/analyze", response_model=WeatherResponse, summary="Analyze current weather and get a farming recommendation")
async def analyze_weather(payload: WeatherRequest, db: Session = Depends(get_db)):
    try:
        result = await fetch_weather(payload.location, payload.crop)
    except WeatherServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve weather information. Please check the location and try again.")

    record = WeatherAnalysis(
        location=result.location,
        crop=result.crop,
        temperature=result.temperature,
        humidity=result.humidity,
        rainfall=result.rainfall,
        weather_condition=result.condition,
        recommendation=result.recommendation.summary,
    )
    db.add(record)
    db.commit()

    return result
