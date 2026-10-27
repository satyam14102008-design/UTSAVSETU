import pytest
import os
import sys

# Ensure root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.seed_data import seed_demo_data
from backend.app.models.event import EventType
from backend.app.models.budget import FoodCateringConfig
from backend.app.services.food_calculator import calculate_food_and_catering

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_data():
    seed_demo_data()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "database" in data

def test_auth_login_demo_user():
    response = client.post("/api/v1/auth/login", json={
        "email": "demo@utsavsetu.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@utsavsetu.com"

def test_list_supported_event_types():
    response = client.get("/api/v1/events/types")
    assert response.status_code == 200
    data = response.json()
    assert EventType.WEDDING in data
    assert EventType.BIRTHDAY in data
    assert EventType.POOJA in data
    assert EventType.ENGAGEMENT in data
    assert "default_rituals" in data[EventType.WEDDING]
    assert "default_budget_categories" in data[EventType.WEDDING]

def test_create_birthday_event():
    # Login first
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@utsavsetu.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    event_payload = {
        "title": "Ishaan's 10th Birthday Adventure",
        "event_type": "birthday",
        "date": "2026-11-25",
        "time": "17:00",
        "venue_name": "SkyJumper Trampoline Park",
        "venue_address": "Goregaon West, Mumbai",
        "host_names": "Ritu & Sameer Verma",
        "primary_person_name": "Ishaan Verma",
        "birthday_age": 10,
        "target_budget": 50000.0,
        "rsvp_deadline": "2026-11-18"
    }
    response = client.post("/api/v1/events", json=event_payload, headers=headers)
    assert response.status_code == 200
    event = response.json()
    assert event["title"] == "Ishaan's 10th Birthday Adventure"
    assert event["event_type"] == "birthday"
    assert event["birthday_age"] == 10

def test_food_catering_calculation_formulas():
    # Test Section 8 example:
    # 400 invited, 280 confirmed, Rs 800 per meal, buffer calculation
    cfg = FoodCateringConfig(
        event_id="test_evt",
        price_per_veg=800.0,
        price_per_non_veg=1000.0,
        price_per_child=400.0,
        buffer_percentage=10.0,
        catering_minimum_guarantee=100,
        fixed_service_fee=0.0
    )
    # 200 confirmed veg, 80 confirmed non-veg = 280 confirmed
    summary = calculate_food_and_catering(
        config=cfg,
        total_invited_guests=400,
        confirmed_adults=280,
        confirmed_children=0,
        confirmed_veg=200,
        confirmed_non_veg=80,
        confirmed_jain=0
    )

    # 10% buffer: 200 * 1.10 = 220 plates veg, 80 * 1.10 = 88 plates non-veg
    assert summary.recommended_veg_prep == 220
    assert summary.recommended_non_veg_prep == 88
    assert summary.recommended_total_plates == 308
    # Response based cost: (220 * 800) + (88 * 1000) = 176,000 + 88,000 = 264,000
    assert summary.response_based_estimated_cost == 264000.0
    # Difference exists and is positive
    assert summary.estimated_potential_saving > 0

def test_public_rsvp_flow():
    # 1. Fetch invitation with known pre-seeded token
    token = "token_verma_wedding_2026"
    res = client.get(f"/api/v1/rsvp/invitation/{token}")
    assert res.status_code == 200
    inv = res.json()
    assert "Rahul & Ananya" in inv["event"]["title"] or "Rahul & Ananya" in inv["guest_name"] or "Verma" in inv["family_name"]

    # 2. Submit modified RSVP with 3 adults, 1 child, 3 veg, 1 non-veg
    rsvp_submit = {
        "token": token,
        "status": "confirmed",
        "attending_adults": 3,
        "attending_children": 1,
        "dietary_veg": 3,
        "dietary_non_veg": 1,
        "dietary_jain": 0,
        "arrival_time": "18:30",
        "guest_wishes": "Heartiest congratulations from the entire Verma Family!"
    }
    submit_res = client.post("/api/v1/rsvp/submit", json=rsvp_submit)
    assert submit_res.status_code == 200
    assert submit_res.json()["status"] == "success"

def test_attendance_checkin_duplicate_prevention():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@utsavsetu.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Asgn w_01 is already checked in in seed data
    checkin_payload = {
        "assignment_id": "asgn_w_01",
        "event_id": "evt_wedding_01",
        "guest_name": "Sunil Verma",
        "actual_adults": 3,
        "actual_children": 1,
        "force_override": False
    }
    checkin_res = client.post("/api/v1/attendance/events/evt_wedding_01/check-in", json=checkin_payload, headers=headers)
    assert checkin_res.status_code == 200
    data = checkin_res.json()
    # Should catch duplicate checkin
    assert data["is_duplicate"] == True
    assert "ALREADY checked in" in data["message"]

def test_whatsapp_demo_send():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@utsavsetu.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    send_payload = {
        "assignment_id": "asgn_w_03",
        "event_id": "evt_wedding_01",
        "template_type": "invitation",
        "force_demo_mode": True
    }
    res = client.post("/api/v1/whatsapp/send-single", json=send_payload, headers=headers)
    assert res.status_code == 200
    msg = res.json()
    assert msg["is_demo"] == True
    assert "https://wa.me/" in msg["wa_direct_url"]
    assert "Grand Wedding Celebration" in msg["message_text"]

def test_smart_assistant_insights():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@utsavsetu.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/smart-assist/events/evt_wedding_01/insights", headers=headers)
    assert res.status_code == 200
    insights_data = res.json()
    assert "insights" in insights_data
    assert len(insights_data["insights"]) > 0

def test_multi_event_guest_isolation():
    """Verify that a family invited to both Wedding and Birthday has distinct, isolated RSVPs."""
    # Verma family or Gupta family is invited to both
    # In seed data, Gupta Family is assigned to wedding (asgn_w_02) and birthday (asgn_b_01)
    res_w = client.get("/api/v1/rsvp/invitation/token_gupta_wedding_2026")
    res_b = client.get("/api/v1/rsvp/invitation/token_gupta_bday_2026")
    assert res_w.status_code == 200
    assert res_b.status_code == 200

    data_w = res_w.json()
    data_b = res_b.json()
    assert data_w["event"]["event_type"] == "wedding"
    assert data_b["event"]["event_type"] == "birthday"
    assert data_w["event"]["id"] != data_b["event"]["id"]

def test_rsvp_validation_meal_count_exceeded():
    """Verify that total meal count cannot exceed confirmed attendees."""
    token = "token_verma_wedding_2026"
    invalid_submit = {
        "token": token,
        "status": "confirmed",
        "attending_adults": 2,
        "attending_children": 0,
        "dietary_veg": 3,  # 3 veg > 2 attendees -> must fail validation!
        "dietary_non_veg": 1,
        "dietary_jain": 0
    }
    res = client.post("/api/v1/rsvp/submit", json=invalid_submit)
    assert res.status_code == 422  # Unprocessable Entity from Pydantic model_validator

def test_pdf_report_generation():
    """Verify PDF reports for guest roster and catering sheet are generated with valid PDF headers."""
    login_res = client.post("/api/v1/auth/login", json={
        "email": "demo@utsavsetu.com",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res_pdf = client.get("/api/v1/reports/events/evt_wedding_01/guest-list.pdf", headers=headers)
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert res_pdf.content.startswith(b"%PDF")

    res_cat = client.get("/api/v1/reports/events/evt_wedding_01/catering-sheet.pdf", headers=headers)
    assert res_cat.status_code == 200
    assert res_cat.headers["content-type"] == "application/pdf"
    assert res_cat.content.startswith(b"%PDF")

