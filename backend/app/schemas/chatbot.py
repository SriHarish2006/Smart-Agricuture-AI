from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ChatQuestion(BaseModel):
    id: int
    crop: str
    category: str
    question: str


class ChatAskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=300)
    crop: Optional[str] = None


class ChatAskResponse(BaseModel):
    question: str
    answer: str
    matched: bool
    crop: Optional[str] = None


class ChatHistoryItem(BaseModel):
    id: int
    crop: Optional[str] = None
    question: str
    answer: str
    created_at: datetime

    class Config:
        from_attributes = True
