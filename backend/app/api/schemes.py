"""
Farmer Schemes & Loss-Claim Assistant API Router.
Endpoints:
- GET /api/schemes/list (consumed by frontend src/services/api.ts)
- POST /api/schemes/search (master prompt Section 9)
- POST /api/schemes/draft-claim (PMFBY legal letter generator)
"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from app.schemas import (
    SchemeInfoSchema,
    LossClaimInputSchema,
    LossClaimDraftSchema,
)
from app.services.schemes_service import get_all_schemes, generate_pmfby_loss_draft

router = APIRouter(prefix="/api/schemes", tags=["Tool 5: Schemes & Loss-Claim Assistant"])


class SchemeSearchPayload(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    requirement: Optional[str] = None
    crop: Optional[str] = None


@router.get("/list")
def list_schemes():
    """
    Returns verified welfare schemes (PMFBY, PM-KISAN, Soil Health Card, etc.).
    Matches frontend expectation: { schemes: SchemeInfo[] }.
    """
    try:
        schemes = get_all_schemes()
        return {"schemes": schemes}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Schemes retrieval error: {str(exc)}"
        )


@router.post("/search")
def search_schemes(payload: SchemeSearchPayload):
    """
    Searches official schemes database by farmer requirement or category.
    """
    try:
        schemes = get_all_schemes()
        if payload.requirement:
            q = payload.requirement.lower()
            filtered = [
                s for s in schemes
                if q in s.name.lower() or q in s.briefDescription.lower() or q in s.category.lower()
            ]
            return {"schemes": filtered or schemes}
        return {"schemes": schemes}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Scheme search failed: {str(exc)}"
        )


@router.post("/draft-claim", response_model=LossClaimDraftSchema)
def draft_loss_claim(payload: LossClaimInputSchema):
    """
    Generates a formal legal crop loss intimation letter compliant with PMFBY
    72-hour reporting requirements.
    """
    try:
        draft = generate_pmfby_loss_draft(payload)
        return draft
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Claim letter drafting error: {str(exc)}"
        )

