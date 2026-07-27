"""
FastAPI application entrypoint for Meghaditya - Rooftop Resource Assessment Tool Backend.
Includes CORS configuration, database initialization, and router registration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base, SessionLocal
from app.routers import export, locations, rainwater, solar, subsidies, summary
import app.crud as crud

# Initialize FastAPI application
app = FastAPI(
    title="Meghaditya - Rooftop Resource Assessment Tool API",
    description=(
        "Production-ready FastAPI backend for calculating rainwater harvesting "
        "and rooftop solar energy potential across Indian districts."
    ),
    version="1.0.0",
)

# Configure CORS for all origins during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    """
    Ensure database tables exist and initialize seed data on app startup.
    """
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        crud.init_subsidies_table_and_seed(db)
    finally:
        db.close()


# Register API Routers
app.include_router(locations.router)
app.include_router(rainwater.router)
app.include_router(solar.router)
app.include_router(subsidies.router)
app.include_router(summary.router)
app.include_router(export.router)


@app.get("/", tags=["Health Check"])
def root():
    """
    Root endpoint returning backend service health status.
    """
    return {
        "status": "online",
        "service": "Meghaditya - Rooftop Resource Assessment Tool API",
        "docs_url": "/docs",
    }
