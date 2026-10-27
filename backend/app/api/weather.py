"""
Weather & Disaster Guardian API Router.
Endpoints:
- GET /api/weather/lookup (consumed by frontend src/services/api.ts)
- POST /api/weather/check (master prompt Section 6)
"""

from fastapi import APIRouter, Query, HTTPException
from app.schemas import WeatherRiskResultSchema, WeatherCheckInputSchema
from app.services.weather_service import fetch_weather_advisory

router = APIRouter(prefix="/api/weather", tags=["Tool 2: Weather & Disaster Guardian"])


@router.get("/lookup", response_model=WeatherRiskResultSchema)
async def lookup_weather(
    state: str = Query(default="Haryana", description="Indian State"),
    district: str = Query(default="Karnal", description="District Name"),
    crop: str = Query(default="Wheat", description="Target Crop"),
):
    """
    Retrieves real-time meteorological metrics and 5-day advisories for spraying,
    irrigation, and harvesting using Open-Meteo live feeds.
    """
    try:
        result = await fetch_weather_advisory(state=state, district=district, crop=crop)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Meteorological service unavailable: {str(exc)}"
        )


@router.post("/check", response_model=WeatherRiskResultSchema)
async def check_weather(payload: WeatherCheckInputSchema):
    """
    JSON POST variant for weather check specified by master prompt Section 6.
    """
    try:
        result = await fetch_weather_advisory(
            state=payload.state,
            district=payload.district,
            crop=payload.crop or "Wheat"
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Weather inspection error: {str(exc)}"
        )

