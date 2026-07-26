"""
API Router for rainwater harvesting potential calculations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import RainwaterAssessmentRequest, RainwaterAssessmentResponse
import app.crud as crud

router = APIRouter(prefix="/assess", tags=["Rainwater Assessment"])

# Runoff coefficients mapping for roof types
RUNOFF_COEFFICIENTS = {
    "rcc": 0.85,
    "tiled": 0.80,
    "green": 0.40,
}


@router.post(
    "/rainwater",
    response_model=RainwaterAssessmentResponse,
    status_code=status.HTTP_200_OK,
)
def calculate_rainwater_harvesting(
    payload: RainwaterAssessmentRequest,
    db: Session = Depends(get_db),
):
    """
    Calculate rainwater harvesting potential and suggested storage tank size.

    - **location_id**: District location ID
    - **roof_area_m2**: Rooftop area in sq. meters (must be > 0)
    - **roof_type**: Material type ('rcc', 'tiled', 'green')
    - **household_size**: Optional member count (default: 4)

    Falls back to state-wide rainfall average if district-level data is missing.
    """
    # 1. Validate location existence
    location = crud.get_location_by_id(db, location_id=payload.location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location ID {payload.location_id} not found.",
        )

    # 2. Fetch rainfall data (with state-level fallback)
    avg_rainfall_mm, data_source = crud.get_rainfall_data(
        db, location_id=payload.location_id, state=location.state
    )

    if avg_rainfall_mm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No rainfall data available for location_id {payload.location_id} or state '{location.state}'.",
        )

    # 3. Calculation logic
    coeff = RUNOFF_COEFFICIENTS.get(payload.roof_type, 0.85)
    harvestable_liters = round(
        avg_rainfall_mm * payload.roof_area_m2 * coeff, 2
    )

    # Tank sizing: 15 days of domestic water requirement (135 L/person/day), capped by annual harvestable yield
    daily_domestic_demand = payload.household_size * 135.0
    recommended_tank_capacity = round(
        min(daily_domestic_demand * 15.0, harvestable_liters), 2
    )

    return RainwaterAssessmentResponse(
        location_id=location.location_id,
        state=location.state,
        district=location.district,
        roof_area_m2=payload.roof_area_m2,
        roof_type=payload.roof_type,
        avg_rainfall_mm=round(avg_rainfall_mm, 2),
        data_source=data_source,
        harvestable_liters_per_year=harvestable_liters,
        suggested_tank_size_liters=recommended_tank_capacity,
    )
