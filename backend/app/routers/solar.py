"""
API Router for rooftop solar potential assessment calculations.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SolarAssessmentRequest, SolarAssessmentResponse
import app.crud as crud

router = APIRouter(prefix="/assess", tags=["Solar Assessment"])


@router.post(
    "/solar",
    response_model=SolarAssessmentResponse,
    status_code=status.HTTP_200_OK,
)
def calculate_solar_potential(
    payload: SolarAssessmentRequest,
    db: Session = Depends(get_db),
):
    """
    Calculate rooftop solar potential capacity (kWp) and annual generation (kWh).

    - **location_id**: District location ID
    - **roof_area_m2**: Rooftop area in sq. meters (must be > 0)

    Falls back to state-level solar irradiance average if district-level data is missing.
    """
    # 1. Validate location existence
    location = crud.get_location_by_id(db, location_id=payload.location_id)
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location ID {payload.location_id} not found.",
        )

    # 2. Fetch annual irradiance data (with state-level fallback)
    avg_annual_irradiance, data_source = crud.get_solar_annual_data(
        db, location_id=payload.location_id, state=location.state
    )

    if avg_annual_irradiance is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No solar irradiance data available for location_id {payload.location_id} or state '{location.state}'.",
        )

    # 3. Calculation logic
    capacity_kwp = round(payload.roof_area_m2 / 10.0, 2)
    performance_ratio = 0.75
    annual_generation_kwh = round(
        capacity_kwp * avg_annual_irradiance * 365.0 * performance_ratio, 2
    )

    return SolarAssessmentResponse(
        location_id=location.location_id,
        state=location.state,
        district=location.district,
        roof_area_m2=payload.roof_area_m2,
        avg_annual_irradiance=round(avg_annual_irradiance, 2),
        data_source=data_source,
        capacity_kwp=capacity_kwp,
        annual_generation_kwh=annual_generation_kwh,
    )
