"""
API Router for retrieving government schemes and subsidy information.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SubsidyResponse
import app.crud as crud

router = APIRouter(prefix="/subsidies", tags=["Subsidies"])


@router.get("", response_model=List[SubsidyResponse])
def get_subsidies_endpoint(
    type: Optional[str] = Query(
        default=None, description="Filter schemes by type: 'solar' or 'rainwater'"
    ),
    state: Optional[str] = Query(
        default=None, description="Filter schemes by state name"
    ),
    db: Session = Depends(get_db),
):
    """
    Retrieve government subsidy and incentive schemes.
    Supports optional filtering by scheme type ('solar' or 'rainwater') and state.
    Automatically includes nationwide/central government schemes.
    """
    return crud.get_subsidies(db, scheme_type=type, state=state)
