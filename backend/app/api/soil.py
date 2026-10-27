"""
Soil & Water Advisor API Router.
Endpoint: POST /api/soil/analyze
"""

from fastapi import APIRouter, HTTPException
from app.schemas import SoilParameterInputSchema, SoilAnalysisResultSchema
from app.services.soil_service import evaluate_soil_parameters

router = APIRouter(prefix="/api/soil", tags=["Tool 3: Soil & Water Advisor"])


@router.post("/analyze", response_model=SoilAnalysisResultSchema)
def analyze_soil(payload: SoilParameterInputSchema):
    """
    Evaluates soil parameters (pH, EC, Organic Carbon, NPK, Zinc), benchmarks
    against ICAR standards, and delivers specific reclamation and dosage plans.
    """
    try:
        result = evaluate_soil_parameters(payload)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Soil analysis computation failed: {str(exc)}"
        )

