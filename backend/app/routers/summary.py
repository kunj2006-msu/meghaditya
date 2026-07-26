"""
API Router for minimal homepage assessment summary preview.
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import HomepageSummaryResponse
import app.crud as crud

router = APIRouter(prefix="/assess", tags=["Homepage Summary"])


@router.get(
    "/summary",
    response_model=HomepageSummaryResponse,
    status_code=status.HTTP_200_OK,
)
def get_homepage_assessment_summary(
    location_id: int = Query(..., description="Target location ID"),
    roof_area_m2: float = Query(
        default=100.0, gt=0, description="Rooftop area in square meters (default: 100)"
    ),
    db: Session = Depends(get_db),
):
    """
    Lightweight summary endpoint designed for the HOMEPAGE.
    Returns headline estimates for both Rainwater harvesting and Solar potential
    to populate preview cards.
    """
    # 1. Validate location existence
    location = crud.get_location_by_id(db, location_id=location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location ID {location_id} not found.",
        )

    # 2. Fetch rainfall & solar data
    avg_rainfall_mm, _ = crud.get_rainfall_data(
        db, location_id=location_id, state=location.state
    )
    avg_annual_irradiance, _ = crud.get_solar_annual_data(
        db, location_id=location_id, state=location.state
    )

    rainfall_val = avg_rainfall_mm if avg_rainfall_mm is not None else 0.0
    irradiance_val = avg_annual_irradiance if avg_annual_irradiance is not None else 0.0

    # 3. Calculate headline numbers
    rainwater_liters = round(rainfall_val * roof_area_m2 * 0.85, 2)
    capacity_kwp = roof_area_m2 / 10.0
    solar_kwh = round(capacity_kwp * irradiance_val * 365.0 * 0.75, 2)

    return HomepageSummaryResponse(
        location_id=location.location_id,
        state=location.state,
        district=location.district,
        roof_area_m2=roof_area_m2,
        rainwater_liters_per_year=rainwater_liters,
        solar_generation_kwh_per_year=solar_kwh,
    )
