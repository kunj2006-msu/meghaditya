"""
Unit and integration tests for Meghaditya FastAPI Backend Endpoints.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"


def test_locations_search():
    response = client.get("/locations/search?q=pune")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "location_id" in data[0]
        assert "state" in data[0]
        assert "district" in data[0]


def test_assess_rainwater():
    # Search first location ID dynamically
    search_res = client.get("/locations/search?q=maharashtra")
    assert search_res.status_code == 200
    locations = search_res.json()
    loc_id = locations[0]["location_id"] if locations else 1

    payload = {
        "location_id": loc_id,
        "roof_area_m2": 120.0,
        "roof_type": "rcc",
        "household_size": 4
    }
    response = client.post("/assess/rainwater", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert "harvestable_liters_per_year" in res_data
    assert "suggested_tank_size_liters" in res_data
    assert "data_source" in res_data


def test_assess_solar():
    search_res = client.get("/locations/search?q=maharashtra")
    locations = search_res.json()
    loc_id = locations[0]["location_id"] if locations else 1

    payload = {
        "location_id": loc_id,
        "roof_area_m2": 120.0
    }
    response = client.post("/assess/solar", json=payload)
    assert response.status_code == 200
    res_data = response.json()
    assert "capacity_kwp" in res_data
    assert "annual_generation_kwh" in res_data
    assert "data_source" in res_data


def test_solar_monthly():
    search_res = client.get("/locations/search?q=maharashtra")
    locations = search_res.json()
    loc_id = locations[0]["location_id"] if locations else 1

    response = client.get(f"/locations/{loc_id}/solar-monthly")
    assert response.status_code == 200
    res_data = response.json()
    assert "monthly_data" in res_data
    assert "data_source" in res_data


def test_subsidies():
    response = client.get("/subsidies?type=solar&state=Maharashtra")
    assert response.status_code == 200
    res_data = response.json()
    assert isinstance(res_data, list)


def test_assess_summary():
    search_res = client.get("/locations/search?q=maharashtra")
    locations = search_res.json()
    loc_id = locations[0]["location_id"] if locations else 1

    response = client.get(f"/assess/summary?location_id={loc_id}&roof_area_m2=100")
    assert response.status_code == 200
    res_data = response.json()
    assert "rainwater_liters_per_year" in res_data
    assert "solar_generation_kwh_per_year" in res_data


def test_invalid_input_422():
    payload = {
        "location_id": 1,
        "roof_area_m2": -50.0,  # Negative area
        "roof_type": "rcc"
    }
    response = client.post("/assess/rainwater", json=payload)
    assert response.status_code == 422


def test_nonexistent_location_404():
    payload = {
        "location_id": 999999,  # Non-existent location ID
        "roof_area_m2": 100.0,
        "roof_type": "rcc"
    }
    response = client.post("/assess/rainwater", json=payload)
    assert response.status_code == 404


def test_export_rainwater_pdf():
    search_res = client.get("/locations/search?q=maharashtra")
    locations = search_res.json()
    loc_id = locations[0]["location_id"] if locations else 1

    payload = {
        "location_id": loc_id,
        "roof_area_m2": 120.0,
        "roof_type": "rcc",
        "household_size": 4,
    }
    response = client.post("/export/pdf/rainwater", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "meghaditya-rainwater-report.pdf" in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF-")


def test_export_solar_pdf():
    search_res = client.get("/locations/search?q=maharashtra")
    locations = search_res.json()
    loc_id = locations[0]["location_id"] if locations else 1

    payload = {
        "location_id": loc_id,
        "roof_area_m2": 120.0,
    }
    response = client.post("/export/pdf/solar", json=payload)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert "meghaditya-solar-report.pdf" in response.headers["content-disposition"]
    assert response.content.startswith(b"%PDF-")


if __name__ == "__main__":
    test_root()
    test_locations_search()
    test_assess_rainwater()
    test_assess_solar()
    test_solar_monthly()
    test_subsidies()
    test_assess_summary()
    test_export_rainwater_pdf()
    test_export_solar_pdf()
    test_invalid_input_422()
    test_nonexistent_location_404()
    print("ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!")
