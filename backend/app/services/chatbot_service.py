"""
Predefined-knowledge-base chatbot. No external/paid AI text-generation API
is used - answers come only from data/chatbot_qa.json.
"""
import json
import re
from difflib import SequenceMatcher
from typing import List, Optional

from app.config import get_settings
from app.schemas.chatbot import ChatQuestion

FALLBACK_ANSWER = (
    "I don't have a verified answer for that question yet. "
    "Please select one of the available agriculture questions, "
    "or upload a leaf image for disease analysis."
)

MATCH_THRESHOLD = 0.55


def _load_qa() -> List[dict]:
    settings = get_settings()
    if not settings.chatbot_qa_path.exists():
        return []
    with open(settings.chatbot_qa_path, "r", encoding="utf-8") as f:
        return json.load(f)


def _normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9\s]", "", text.lower()).strip()


def list_questions(crop: Optional[str] = None) -> List[ChatQuestion]:
    qa = _load_qa()
    if crop:
        qa = [item for item in qa if item["crop"].lower() == crop.lower() or item["crop"].lower() == "general"]
    return [ChatQuestion(id=item["id"], crop=item["crop"], category=item["category"], question=item["question"]) for item in qa]


def get_answer_by_id(question_id: int) -> Optional[dict]:
    qa = _load_qa()
    return next((item for item in qa if item["id"] == question_id), None)


def find_answer(question: str, crop: Optional[str] = None) -> dict:
    qa = _load_qa()
    if crop:
        candidates = [item for item in qa if item["crop"].lower() in (crop.lower(), "general")]
        if not candidates:
            candidates = qa
    else:
        candidates = qa

    normalized_query = _normalize(question)

    best_item = None
    best_score = 0.0
    for item in candidates:
        score = SequenceMatcher(None, normalized_query, _normalize(item["question"])).ratio()
        if score > best_score:
            best_score = score
            best_item = item

    if best_item and best_score >= MATCH_THRESHOLD:
        return {"question": question, "answer": best_item["answer"], "matched": True, "crop": best_item["crop"]}

    return {"question": question, "answer": FALLBACK_ANSWER, "matched": False, "crop": crop}


def list_crops() -> List[str]:
    qa = _load_qa()
    crops = sorted({item["crop"] for item in qa if item["crop"] != "general"})
    return crops
