"""
Database query CRUD operations for locations, rainfall, solar, and subsidies.
Separated from FastAPI router handlers for clean architecture.
"""

from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.database import Base, engine
from app.models import (
    Location,
    RainfallData,
    SolarIrradianceAnnual,
    SolarIrradianceMonthly,
    Subsidy,
)
from app.schemas import MonthlyIrradianceItem


def search_locations(db: Session, query: str) -> List[Location]:
    """
    Perform a case-insensitive partial match search for locations across state and district.

    :param db: Database session instance.
    :param query: Search string query.
    :return: List of Location ORM objects matching the search criteria.
    """
    query_str = query.strip() if query else ""
    if not query_str:
        return db.query(Location).order_by(Location.state, Location.district).limit(50).all()

    pattern = f"%{query_str}%"
    return (
        db.query(Location)
        .filter(
            or_(
                Location.state.ilike(pattern),
                Location.district.ilike(pattern),
            )
        )
        .order_by(Location.state, Location.district)
        .limit(50)
        .all()
    )


def get_location_by_id(db: Session, location_id: int) -> Optional[Location]:
    """
    Fetch a single Location record by its primary key ID.

    :param db: Database session instance.
    :param location_id: Target location ID.
    :return: Location object if found, otherwise None.
    """
    return db.query(Location).filter(Location.location_id == location_id).first()


def get_rainfall_data(
    db: Session, location_id: int, state: str
) -> Tuple[Optional[float], str]:
    """
    Fetch rainfall data for a given location ID with state-level fallback.

    :param db: Database session instance.
    :param location_id: Location ID to query directly.
    :param state: State name to compute average fallback if district data is missing.
    :return: Tuple of (avg_rainfall_mm, data_source_flag).
    """
    # 1. Try district exact match
    exact_data = (
        db.query(RainfallData)
        .filter(RainfallData.location_id == location_id)
        .first()
    )
    if exact_data and exact_data.avg_rainfall_mm is not None:
        return float(exact_data.avg_rainfall_mm), "district_exact"

    # 2. State-level average fallback
    state_avg = (
        db.query(func.avg(RainfallData.avg_rainfall_mm))
        .join(Location, RainfallData.location_id == Location.location_id)
        .filter(func.lower(Location.state) == state.lower())
        .scalar()
    )

    if state_avg is not None:
        return float(state_avg), "state_average"

    return None, "none"


def get_solar_annual_data(
    db: Session, location_id: int, state: str
) -> Tuple[Optional[float], str]:
    """
    Fetch annual solar irradiance data for a given location ID with state-level fallback.

    :param db: Database session instance.
    :param location_id: Location ID to query directly.
    :param state: State name for state-average fallback calculation.
    :return: Tuple of (avg_annual_irradiance, data_source_flag).
    """
    # 1. Try district exact match
    exact_data = (
        db.query(SolarIrradianceAnnual)
        .filter(SolarIrradianceAnnual.location_id == location_id)
        .first()
    )
    if exact_data and exact_data.avg_annual_irradiance is not None:
        return float(exact_data.avg_annual_irradiance), "district_exact"

    # 2. State-level average fallback
    state_avg = (
        db.query(func.avg(SolarIrradianceAnnual.avg_annual_irradiance))
        .join(Location, SolarIrradianceAnnual.location_id == Location.location_id)
        .filter(func.lower(Location.state) == state.lower())
        .scalar()
    )

    if state_avg is not None:
        return float(state_avg), "state_average"

    return None, "none"


def get_solar_monthly_data(
    db: Session, location_id: int, state: str
) -> Tuple[List[MonthlyIrradianceItem], str]:
    """
    Fetch 12-month solar irradiance breakdown for a location ID, falling back to state monthly average.

    :param db: Database session instance.
    :param location_id: Location ID for direct query.
    :param state: State name for state-wide monthly fallback.
    :return: Tuple of (list of MonthlyIrradianceItem, data_source_flag).
    """
    exact_rows = (
        db.query(SolarIrradianceMonthly)
        .filter(SolarIrradianceMonthly.location_id == location_id)
        .order_by(SolarIrradianceMonthly.month)
        .all()
    )

    if exact_rows:
        items = [
            MonthlyIrradianceItem(
                month=r.month,
                irradiance_kwh_m2_day=float(r.irradiance_kwh_m2_day),
            )
            for r in exact_rows
        ]
        return items, "district_exact"

    # State-level monthly fallback
    state_monthly_rows = (
        db.query(
            SolarIrradianceMonthly.month,
            func.avg(SolarIrradianceMonthly.irradiance_kwh_m2_day).label("avg_irr"),
        )
        .join(Location, SolarIrradianceMonthly.location_id == Location.location_id)
        .filter(func.lower(Location.state) == state.lower())
        .group_by(SolarIrradianceMonthly.month)
        .order_by(SolarIrradianceMonthly.month)
        .all()
    )

    if state_monthly_rows:
        items = [
            MonthlyIrradianceItem(
                month=row.month,
                irradiance_kwh_m2_day=float(row.avg_irr),
            )
            for row in state_monthly_rows
        ]
        return items, "state_average"

    return [], "none"


def init_subsidies_table_and_seed(db: Session) -> None:
    """
    Ensure the subsidies table exists and populate initial sample rows for Indian government schemes.

    :param db: Database session instance.
    """
    Base.metadata.create_all(bind=engine)

    if db.query(Subsidy).count() == 0:
        sample_subsidies = [
            Subsidy(
                state="National",
                scheme_name="PM Surya Ghar: Muft Bijli Yojana",
                scheme_type="solar",
                subsidy_details="Central financial assistance up to ₹78,000 for residential rooftop solar systems (1kW to 3kW+), with up to 300 free units of electricity/month.",
                helpline_number="15555",
                website_url="https://pmsuryaghar.gov.in",
            ),
            Subsidy(
                state="National",
                scheme_name="Jal Shakti Abhiyan: Catch the Rain",
                scheme_type="rainwater",
                subsidy_details="Financial incentives and technical assistance for constructing artificial recharge structures and rooftop rainwater harvesting units in urban and rural areas.",
                helpline_number="1800-11-0707",
                website_url="https://jsamod.mowr.gov.in",
            ),
            Subsidy(
                state="Gujarat",
                scheme_name="Surya Gujarat Rooftop Solar Scheme",
                scheme_type="solar",
                subsidy_details="40% subsidy for rooftop solar installation up to 3 kW capacity, and 20% subsidy for capacity above 3 kW up to 10 kW.",
                helpline_number="1800-233-3003",
                website_url="https://surjagujarat.gujarat.gov.in",
            ),
            Subsidy(
                state="Gujarat",
                scheme_name="Atal Bhujal Yojana (Atal Jal)",
                scheme_type="rainwater",
                subsidy_details="Community-led groundwater management scheme providing grants for rooftop rainwater harvesting & aquifer recharge structures.",
                helpline_number="011-23383070",
                website_url="https://ataljal.mowr.gov.in",
            ),
            Subsidy(
                state="Maharashtra",
                scheme_name="MSEDCL Residential Solar Rooftop Subsidy",
                scheme_type="solar",
                subsidy_details="State and central subsidy pool offering up to 40% rebate for home rooftop solar power installations across Maharashtra.",
                helpline_number="1912",
                website_url="https://www.mahadiscom.in/ismart/",
            ),
            Subsidy(
                state="Tamil Nadu",
                scheme_name="Tamil Nadu Rainwater Harvesting Mandate & Subsidy",
                scheme_type="rainwater",
                subsidy_details="Rebate on municipal property tax and subsidy support for installing compliant rooftop rainwater harvesting structures.",
                helpline_number="1913",
                website_url="https://chennaimetrowater.tn.gov.in",
            ),
        ]
        db.add_all(sample_subsidies)
        db.commit()


def get_subsidies(
    db: Session,
    scheme_type: Optional[str] = None,
    state: Optional[str] = None,
) -> List[Subsidy]:
    """
    Retrieve government subsidies filtered by scheme type and target state.

    :param db: Database session instance.
    :param scheme_type: Filter by 'solar' or 'rainwater'.
    :param state: Filter by target state (also includes 'National' / 'All' schemes).
    :return: List of Subsidy objects.
    """
    init_subsidies_table_and_seed(db)
    query = db.query(Subsidy)

    if scheme_type:
        query = query.filter(func.lower(Subsidy.scheme_type) == scheme_type.lower().strip())

    if state:
        st_clean = state.lower().strip()
        query = query.filter(
            or_(
                func.lower(Subsidy.state) == st_clean,
                func.lower(Subsidy.state) == "national",
                func.lower(Subsidy.state) == "all",
            )
        )

    return query.order_by(Subsidy.id).all()
