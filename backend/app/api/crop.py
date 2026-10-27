"""
Crop Health Intelligence API Router.
Endpoint: POST /api/crop/analyze
"""

from fastapi import APIRouter, HTTPException
from app.schemas import CropHealthInputSchema, CropHealthAnalysisResultSchema
from app.services.crop_service import analyze_crop_health

router = APIRouter(prefix="/api/crop", tags=["Tool 1: Crop Health Intelligence"])


@router.post("/analyze", response_model=CropHealthAnalysisResultSchema)
def analyze_crop(payload: CropHealthInputSchema):
    """
    Analyzes crop symptoms, integrates growth stage and meteorological context,
    and returns ICAR-grounded diagnoses with IPM organic/chemical recommendations.
    """
    try:
        result = analyze_crop_health(payload)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Crop pathology engine encountered an error: {str(exc)}"
        )

