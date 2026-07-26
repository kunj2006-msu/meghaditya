"""
SQLAlchemy ORM models representing database tables in Supabase Postgres.
"""

from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from app.database import Base


class Location(Base):
    """
    ORM model for the 'locations' table.
    Stores Indian state and district location metadata.
    """

    __tablename__ = "locations"

    location_id = Column(Integer, primary_key=True, index=True)
    state = Column(String, nullable=False, index=True)
    district = Column(String, nullable=False, index=True)


class RainfallData(Base):
    """
    ORM model for the 'rainfall_data' table.
    Stores average annual rainfall (in mm) per district location.
    """

    __tablename__ = "rainfall_data"

    location_id = Column(
        Integer, ForeignKey("locations.location_id"), primary_key=True
    )
    avg_rainfall_mm = Column(Float, nullable=False)


class SolarIrradianceAnnual(Base):
    """
    ORM model for the 'solar_irradiance_annual' table.
    Stores average annual solar irradiance (in kWh/m²/day) per district location.
    """

    __tablename__ = "solar_irradiance_annual"

    location_id = Column(
        Integer, ForeignKey("locations.location_id"), primary_key=True
    )
    avg_annual_irradiance = Column(Float, nullable=False)


class SolarIrradianceMonthly(Base):
    """
    ORM model for the 'solar_irradiance_monthly' table.
    Stores monthly solar irradiance breakdown per district location.
    """

    __tablename__ = "solar_irradiance_monthly"

    id = Column(Integer, primary_key=True, autoincrement=True)
    location_id = Column(
        Integer, ForeignKey("locations.location_id"), nullable=False, index=True
    )
    month = Column(Integer, nullable=False)
    irradiance_kwh_m2_day = Column(Float, nullable=False)


class Subsidy(Base):
    """
    ORM model for the 'subsidies' table.
    Stores government scheme details for solar and rainwater harvesting.
    """

    __tablename__ = "subsidies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    state = Column(String, nullable=False, index=True)
    scheme_name = Column(String, nullable=False)
    scheme_type = Column(String, nullable=False, index=True)  # 'solar' or 'rainwater'
    subsidy_details = Column(Text, nullable=False)
    helpline_number = Column(String, nullable=True)
    website_url = Column(String, nullable=True)
