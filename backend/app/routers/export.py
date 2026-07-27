"""
API Router for PDF Report Export Endpoints.
Reuses CRUD operations to calculate resource potential and streams branded PDF reports.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import RainwaterAssessmentRequest, SolarAssessmentRequest
import app.crud as crud
from app.pdf_generator import generate_rainwater_pdf, generate_solar_pdf

router = APIRouter(prefix="/export/pdf", tags=["PDF Export"])

# Runoff coefficients mapping matching /assess/rainwater
RUNOFF_COEFFICIENTS = {
    "rcc": 0.85,
    "tiled": 0.80,
    "green": 0.40,
}


@router.post(
    "/rainwater",
    response_class=StreamingResponse,
    status_code=status.HTTP_200_OK,
    summary="Export Rainwater Assessment PDF Report",
)
def export_rainwater_pdf(
    payload: RainwaterAssessmentRequest,
    db: Session = Depends(get_db),
):
    """
    Generate and stream a branded PDF assessment report for rooftop rainwater harvesting.
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

    # 3. Calculation logic (reused from rainwater assessment)
    coeff = RUNOFF_COEFFICIENTS.get(payload.roof_type, 0.85)
    harvestable_liters = round(avg_rainfall_mm * payload.roof_area_m2 * coeff, 2)

    daily_domestic_demand = payload.household_size * 135.0
    recommended_tank_capacity = round(
        min(daily_domestic_demand * 15.0, harvestable_liters), 2
    )

    # 4. Fetch relevant government subsidies
    subsidies_orm = crud.get_subsidies(db, scheme_type="rainwater", state=location.state)
    subsidies_data = [
        {
            "scheme_name": sub.scheme_name,
            "subsidy_details": sub.subsidy_details,
            "helpline_number": sub.helpline_number,
            "website_url": sub.website_url,
        }
        for sub in subsidies_orm
    ]

    # 5. Build PDF data payload
    report_data = {
        "location_id": location.location_id,
        "state": location.state,
        "district": location.district,
        "roof_area_m2": payload.roof_area_m2,
        "roof_type": payload.roof_type,
        "household_size": payload.household_size,
        "avg_rainfall_mm": round(avg_rainfall_mm, 2),
        "data_source": data_source,
        "harvestable_liters_per_year": harvestable_liters,
        "suggested_tank_size_liters": recommended_tank_capacity,
        "subsidies": subsidies_data,
        "generation_date": datetime.now().strftime("%d %b %Y"),
    }

    # 6. Generate PDF BytesIO stream
    pdf_buffer = generate_rainwater_pdf(report_data)

    filename = "meghaditya-rainwater-report.pdf"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}",
        "Access-Control-Expose-Headers": "Content-Disposition",
    }

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers=headers,
    )


@router.post(
    "/solar",
    response_class=StreamingResponse,
    status_code=status.HTTP_200_OK,
    summary="Export Solar Potential Assessment PDF Report",
)
def export_solar_pdf(
    payload: SolarAssessmentRequest,
    db: Session = Depends(get_db),
):
    """
    Generate and stream a branded PDF assessment report for rooftop solar potential.
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

    # 3. Calculation logic (reused from solar assessment)
    capacity_kwp = round(payload.roof_area_m2 / 10.0, 2)
    performance_ratio = 0.75
    annual_generation_kwh = round(
        capacity_kwp * avg_annual_irradiance * 365.0 * performance_ratio, 2
    )

    # 4. Fetch 12-month monthly solar irradiance breakdown
    monthly_data_orm, _ = crud.get_solar_monthly_data(
        db, location_id=payload.location_id, state=location.state
    )
    monthly_list = [
        {
            "month": item.month,
            "irradiance_kwh_m2_day": item.irradiance_kwh_m2_day,
        }
        for item in monthly_data_orm
    ]

    # 5. Fetch relevant government subsidies
    subsidies_orm = crud.get_subsidies(db, scheme_type="solar", state=location.state)
    subsidies_data = [
        {
            "scheme_name": sub.scheme_name,
            "subsidy_details": sub.subsidy_details,
            "helpline_number": sub.helpline_number,
            "website_url": sub.website_url,
        }
        for sub in subsidies_orm
    ]

    # 6. Build PDF data payload
    report_data = {
        "location_id": location.location_id,
        "state": location.state,
        "district": location.district,
        "roof_area_m2": payload.roof_area_m2,
        "avg_annual_irradiance": round(avg_annual_irradiance, 2),
        "data_source": data_source,
        "capacity_kwp": capacity_kwp,
        "annual_generation_kwh": annual_generation_kwh,
        "monthly_data": monthly_list,
        "subsidies": subsidies_data,
        "generation_date": datetime.now().strftime("%d %b %Y"),
    }

    # 6. Generate PDF BytesIO stream
    pdf_buffer = generate_solar_pdf(report_data)

    filename = "meghaditya-solar-report.pdf"
    headers = {
        "Content-Disposition": f"attachment; filename={filename}",
        "Access-Control-Expose-Headers": "Content-Disposition",
    }

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers=headers,
    )
