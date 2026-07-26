"""
Pydantic schemas for request and response validation.
"""

from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class LocationSchema(BaseModel):
    """
    Schema representing district location information.
    """

    location_id: int
    state: str
    district: str

    class Config:
        from_attributes = True


class RainwaterAssessmentRequest(BaseModel):
    """
    Request payload schema for rainwater harvesting potential assessment.
    """

    location_id: int = Field(..., description="Target location ID")
    roof_area_m2: float = Field(
        ..., gt=0, description="Rooftop surface area in square meters (must be > 0)"
    )
    roof_type: str = Field(
        ..., description="Rooftop material type ('rcc', 'tiled', or 'green')"
    )
    household_size: int = Field(
        default=4, gt=0, description="Household member count for water demand estimation"
    )

    @field_validator("roof_type")
    @classmethod
    def validate_roof_type(cls, value: str) -> str:
        """Ensure roof_type is one of the allowed categories."""
        cleaned = value.lower().strip()
        if cleaned not in ["rcc", "tiled", "green"]:
            raise ValueError(
                "Invalid roof_type. Must be one of: 'rcc', 'tiled', or 'green'."
            )
        return cleaned


class RainwaterAssessmentResponse(BaseModel):
    """
    Response schema for rainwater harvesting assessment.
    """

    location_id: int
    state: str
    district: str
    roof_area_m2: float
    roof_type: str
    avg_rainfall_mm: float
    data_source: str = Field(
        ..., description="'district_exact' or 'state_average'"
    )
    harvestable_liters_per_year: float
    suggested_tank_size_liters: float


class SolarAssessmentRequest(BaseModel):
    """
    Request payload schema for rooftop solar potential assessment.
    """

    location_id: int = Field(..., description="Target location ID")
    roof_area_m2: float = Field(
        ..., gt=0, description="Rooftop surface area in square meters (must be > 0)"
    )


class SolarAssessmentResponse(BaseModel):
    """
    Response schema for rooftop solar potential assessment.
    """

    location_id: int
    state: str
    district: str
    roof_area_m2: float
    avg_annual_irradiance: float
    data_source: str = Field(
        ..., description="'district_exact' or 'state_average'"
    )
    capacity_kwp: float
    annual_generation_kwh: float


class MonthlyIrradianceItem(BaseModel):
    """
    Schema for a single month's solar irradiance metric.
    """

    month: int
    irradiance_kwh_m2_day: float

    class Config:
        from_attributes = True


class MonthlySolarResponse(BaseModel):
    """
    Response schema for 12-month solar irradiance breakdown.
    """

    location_id: int
    state: str
    district: str
    data_source: str
    monthly_data: List[MonthlyIrradianceItem]


class SubsidyResponse(BaseModel):
    """
    Response schema for government subsidy scheme details.
    """

    id: int
    state: str
    scheme_name: str
    scheme_type: str
    subsidy_details: str
    helpline_number: Optional[str] = None
    website_url: Optional[str] = None

    class Config:
        from_attributes = True


class HomepageSummaryResponse(BaseModel):
    """
    Minimal summary response for homepage preview cards.
    """

    location_id: int
    state: str
    district: str
    roof_area_m2: float
    rainwater_liters_per_year: float
    solar_generation_kwh_per_year: float
