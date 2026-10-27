"""
Mandi Price & Profit Advisor API Router.
Endpoints:
- GET /api/mandi/prices (frontend query)
- POST /api/mandi/prices (master prompt Section 8)
- POST /api/mandi/calculate (frontend profit engine)
- POST /api/mandi/profit (master prompt Section 8)
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from app.schemas import (
    MandiPriceRecordSchema,
    MandiCalculationInputSchema,
    MandiProfitResultSchema,
)
from app.services.mandi_service import query_mandi_prices, calculate_mandi_net_profit

router = APIRouter(prefix="/api/mandi", tags=["Tool 4: Mandi Price & Profit Advisor"])


class MandiPriceQueryPayload(BaseModel):
    commodity: str = "Wheat"
    state: Optional[str] = "Haryana"
    district: Optional[str] = "Karnal"


@router.get("/prices")
def get_mandi_prices(
    commodity: str = Query(default="Wheat", description="Crop / Commodity"),
    state: str = Query(default="Haryana", description="State"),
    district: str = Query(default="Karnal", description="District"),
):
    """
    Returns real-time and verified AGMARKNET APMC yard prices.
    Matches frontend expectation: { records: MandiPriceRecord[] }.
    """
    try:
        records = query_mandi_prices(commodity=commodity, state=state, district=district)
        return {"records": records}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Mandi price lookup error: {str(exc)}"
        )


@router.post("/prices")
def post_mandi_prices(payload: MandiPriceQueryPayload):
    """
    JSON POST variant for Mandi price inquiry (master prompt Section 8).
    """
    try:
        records = query_mandi_prices(
            commodity=payload.commodity,
            state=payload.state or "",
            district=payload.district or ""
        )
        return {"records": records}
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Mandi price lookup error: {str(exc)}"
        )


@router.post("/calculate", response_model=MandiProfitResultSchema)
def calculate_profit(payload: MandiCalculationInputSchema):
    """
    Performs deterministic arithmetic on gross revenue, transport freight,
    mandi cess, and net in-hand realization per quintal.
    """
    try:
        result = calculate_mandi_net_profit(payload)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Profit calculation arithmetic error: {str(exc)}"
        )


@router.post("/profit", response_model=MandiProfitResultSchema)
def profit_alias(payload: MandiCalculationInputSchema):
    """Alias for POST /api/mandi/calculate matching Section 8."""
    return calculate_profit(payload)

