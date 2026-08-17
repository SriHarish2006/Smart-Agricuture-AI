from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.history import DiseaseAnalysis
from app.schemas.disease import DiseasePrediction
from app.services.disease_service import DiseaseServiceError, analyze_leaf, validate_upload

router = APIRouter(prefix="/api/disease", tags=["Disease"])


@router.post("/predict", response_model=DiseasePrediction, summary="Predict leaf disease from an uploaded image")
async def predict_disease(
    crop: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    contents = await file.read()

    try:
        validate_upload(file.content_type or "", len(contents))
        result = analyze_leaf(crop, contents)
    except DiseaseServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to analyze the image. Please try again with a clear leaf photo.")

    record = DiseaseAnalysis(
        crop=result.crop,
        disease=result.disease,
        confidence=result.confidence,
        image_name=file.filename or "unknown",
    )
    db.add(record)
    db.commit()

    return result
