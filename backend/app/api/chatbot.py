from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.history import ChatInteraction
from app.schemas.chatbot import ChatAskRequest, ChatAskResponse, ChatQuestion
from app.services import chatbot_service

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


@router.get("/questions", response_model=List[ChatQuestion], summary="List predefined agriculture questions")
def get_questions(crop: Optional[str] = Query(default=None)):
    return chatbot_service.list_questions(crop)


@router.get("/crops", response_model=List[str], summary="List crops with predefined questions")
def get_crops():
    return chatbot_service.list_crops()


@router.post("/ask", response_model=ChatAskResponse, summary="Ask a free-text or predefined agriculture question")
def ask_question(payload: ChatAskRequest, db: Session = Depends(get_db)):
    result = chatbot_service.find_answer(payload.question, payload.crop)

    record = ChatInteraction(
        crop=result.get("crop"),
        question=result["question"],
        answer=result["answer"],
    )
    db.add(record)
    db.commit()

    return result
