"""
AI Smart Agriculture - FastAPI application entrypoint.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chatbot, disease, history, weather
from app.config import get_settings
from app.database import init_db

settings = get_settings()

app = FastAPI(
    title="AI Smart Agriculture API",
    description="Weather analysis, AI leaf disease detection, and an agriculture chatbot for farmers.",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/api/health", tags=["Health"], summary="Health check")
def health_check():
    return {"status": "ok"}


app.include_router(weather.router)
app.include_router(disease.router)
app.include_router(chatbot.router)
app.include_router(history.router)
