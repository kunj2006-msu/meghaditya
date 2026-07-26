# test_connection.py
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT COUNT(*) FROM locations"))
    print("Connected! Locations count:", result.scalar())