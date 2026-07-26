"""
API Router for location search and monthly solar breakdown endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import LocationSchema, MonthlySolarResponse
import app.crud as crud

router = APIRouter(prefix="/locations", tags=["Locations"])


@router.get("/search", response_model=List[LocationSchema])
def search_locations_endpoint(
    q: str = Query(default="", description="Search query for state or district name"),
    db: Session = Depends(get_db),
):
    """
    Shared autocomplete search across Indian states and districts.
    Performs case-insensitive partial match search.
    """
    return crud.search_locations(db, query=q)


@router.get("/{location_id}/solar-monthly", response_model=MonthlySolarResponse)
def get_solar_monthly_endpoint(
    location_id: int,
    db: Session = Depends(get_db),
):
    """
    Retrieve 12-month solar irradiance breakdown for a specified location_id.
    Used for seasonal solar generation charts on the solar dashboard.
    Falls back to state monthly average if direct district data is unavailable.
    """
    location = crud.get_location_by_id(db, location_id=location_id)
    if not location:
        raise HTTPException(
            status_code=404,
            detail=f"Location ID {location_id} not found."
        )

    monthly_items, data_source = crud.get_solar_monthly_data(
        db, location_id=location_id, state=location.state
    )

    return MonthlySolarResponse(
        location_id=location.location_id,
        state=location.state,
        district=location.district,
        data_source=data_source,
        monthly_data=monthly_items,
    )
