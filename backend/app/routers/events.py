import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.models.event import EventCreate, EventUpdate, EventResponse, EventType
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection
from backend.app.services.event_engine import EVENT_CONFIGS, get_event_engine_config, format_invitation_message

router = APIRouter(prefix="/events", tags=["Events & Dashboard"])

@router.get("/types", response_model=Dict[str, Any])
def get_supported_event_types():
    """Returns dynamic configuration, labels, icons, and defaults for all Indian event types."""
    return EVENT_CONFIGS

@router.get("", response_model=List[EventResponse])
def list_user_events(current_user: dict = Depends(get_current_user)):
    events_col = get_collection("events")
    user_id = current_user["id"]
    # Events created by user OR where user is a collaborator
    events = events_col.find({
        "$or": [
            {"created_by": user_id},
            {"collaborators.user_id": user_id}
        ]
    })
    return [EventResponse(**e) for e in events]

@router.post("", response_model=EventResponse)
def create_event(event_in: EventCreate, current_user: dict = Depends(get_current_user)):
    events_col = get_collection("events")
    designs_col = get_collection("card_designs")
    budget_col = get_collection("budget_categories")
    food_cfg_col = get_collection("food_catering_configs")

    event_id = f"evt_{uuid.uuid4().hex[:10]}"
    now_str = datetime.utcnow().isoformat()
    
    engine_config = get_event_engine_config(event_in.event_type)

    rituals = [r.dict() for r in event_in.rituals] if event_in.rituals else engine_config.get("default_rituals", [])

    event_data = {
        "id": event_id,
        "title": event_in.title,
        "event_type": event_in.event_type,
        "date": event_in.date,
        "time": event_in.time or "18:00",
        "end_date": event_in.end_date,
        "venue_name": event_in.venue_name,
        "venue_address": event_in.venue_address,
        "map_url": event_in.map_url,
        "host_names": event_in.host_names,
        "city": event_in.city or "Mumbai",
        "description": event_in.description,
        "primary_person_name": event_in.primary_person_name,
        "secondary_person_name": event_in.secondary_person_name,
        "birthday_age": event_in.birthday_age,
        "anniversary_years": event_in.anniversary_years,
        "pooja_name": event_in.pooja_name,
        "muhurat_time": event_in.muhurat_time,
        "prasad_offering": event_in.prasad_offering,
        "house_name": event_in.house_name,
        "target_budget": event_in.target_budget or 100000.0,
        "rsvp_deadline": event_in.rsvp_deadline,
        "rituals": rituals,
        "collaborators": [],
        "custom_fields": event_in.custom_fields or {},
        "created_by": current_user["id"],
        "created_at": now_str,
        "updated_at": now_str
    }
    events_col.insert_one(event_data)

    # Initialize default card design adapted to the event type
    card_body = format_invitation_message(event_in.event_type, "en", event_data)
    theme_preset = "royal_maroon"
    if event_in.event_type == EventType.BIRTHDAY:
        theme_preset = "neon_celebration"
    elif event_in.event_type == EventType.POOJA:
        theme_preset = "divine_saffron"
    elif event_in.event_type == EventType.ENGAGEMENT:
        theme_preset = "pastel_floral"
    elif event_in.event_type == EventType.HOUSEWARMING:
        theme_preset = "emerald_gold"

    card_data = {
        "id": f"card_{uuid.uuid4().hex[:10]}",
        "event_id": event_id,
        "template_id": f"{theme_preset}_template",
        "aspect_ratio": "portrait",
        "language": "en",
        "header_text": "|| Shree Ganeshay Namah ||" if event_in.event_type != EventType.BIRTHDAY else "⭐ CELEBRATION ⭐",
        "title": event_in.title,
        "subtitle": "Together with our families",
        "honoree_text": f"{event_in.primary_person_name or ''} {('& ' + event_in.secondary_person_name) if event_in.secondary_person_name else ''}".strip(),
        "event_date_text": event_in.date,
        "event_time_text": f"{event_in.time} onwards",
        "venue_text": event_in.venue_name,
        "address_text": event_in.venue_address,
        "invitation_body": card_body,
        "rsvp_note": f"Please RSVP by {event_in.rsvp_deadline}" if event_in.rsvp_deadline else "Kindly confirm your attendance",
        "host_signature": f"Warm regards: {event_in.host_names}",
        "contact_phone": current_user.get("phone", "+91 98765 43210"),
        "theme_preset": theme_preset,
        "background_color": engine_config.get("theme_color", "#800020"),
        "accent_color": engine_config.get("accent_color", "#D4AF37"),
        "text_color": "#FAF7F2",
        "secondary_text_color": "#EADBC8",
        "font_family": "Cinzel",
        "decorative_border": "ornate_gold",
        "motif_symbol": "ganesha" if event_in.event_type in (EventType.WEDDING, EventType.POOJA) else "sparkles",
        "show_qr_code": True,
        "show_map_link": True
    }
    designs_col.insert_one(card_data)

    # Initialize event-specific budget categories
    for cat in engine_config.get("default_budget_categories", []):
        budget_col.insert_one({
            "id": f"bcat_{uuid.uuid4().hex[:8]}",
            "event_id": event_id,
            "name": cat["name"],
            "allocated_amount": cat["allocated_amount"],
            "spent_amount": 0.0,
            "remaining_amount": cat["allocated_amount"],
            "icon": cat["icon"]
        })

    # Initialize food catering config
    food_cfg_col.insert_one({
        "event_id": event_id,
        "price_per_veg": 750.0 if event_in.event_type != EventType.POOJA else 350.0,
        "price_per_non_veg": 950.0 if event_in.event_type not in (EventType.POOJA, EventType.HOUSEWARMING) else 0.0,
        "price_per_child": 350.0,
        "buffer_percentage": 10.0,
        "catering_minimum_guarantee": 50,
        "fixed_service_fee": 10000.0 if event_in.event_type == EventType.WEDDING else 3000.0
    })

    return EventResponse(**event_data)

@router.get("/{event_id}", response_model=EventResponse)
def get_event(event_id: str, current_user: dict = Depends(get_current_user)):
    event = check_event_permission(event_id, current_user)
    return EventResponse(**event)

@router.put("/{event_id}", response_model=EventResponse)
def update_event(event_id: str, update_in: EventUpdate, current_user: dict = Depends(get_current_user)):
    event = check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    events_col = get_collection("events")
    
    update_dict = {k: v for k, v in update_in.dict().items() if v is not None}
    if "rituals" in update_dict and update_dict["rituals"] is not None:
        update_dict["rituals"] = [r.dict() if hasattr(r, "dict") else r for r in update_dict["rituals"]]
        
    update_dict["updated_at"] = datetime.utcnow().isoformat()
    events_col.update_one({"id": event_id}, {"$set": update_dict})
    
    updated = events_col.find_one({"id": event_id})
    return EventResponse(**updated)

@router.delete("/{event_id}")
def delete_event(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin"])
    events_col = get_collection("events")
    assign_col = get_collection("event_guest_assignments")
    designs_col = get_collection("card_designs")
    budget_col = get_collection("budget_categories")
    trans_col = get_collection("budget_transactions")

    events_col.delete_one({"id": event_id})
    assign_col.delete_many({"event_id": event_id})
    designs_col.delete_many({"event_id": event_id})
    budget_col.delete_many({"event_id": event_id})
    trans_col.delete_many({"event_id": event_id})
    return {"message": "Event and associated records deleted"}

@router.get("/{event_id}/dashboard-analytics")
def get_event_dashboard_analytics(event_id: str, current_user: dict = Depends(get_current_user)):
    """Computes real-time event analytics including response rates, dietary breakdown, budget, and check-in rates."""
    event = check_event_permission(event_id, current_user)
    assign_col = get_collection("event_guest_assignments")
    budget_col = get_collection("budget_categories")
    trans_col = get_collection("budget_transactions")
    att_col = get_collection("attendance_records")

    assignments = list(assign_col.find({"event_id": event_id}))
    
    total_assigned_families = len(assignments)
    total_invited_adults = sum(a.get("invited_adults", 0) for a in assignments)
    total_invited_children = sum(a.get("invited_children", 0) for a in assignments)
    total_invited_headcount = total_invited_adults + total_invited_children

    confirmed_families = [a for a in assignments if a.get("rsvp_status") == "confirmed"]
    declined_families = [a for a in assignments if a.get("rsvp_status") == "declined"]
    maybe_families = [a for a in assignments if a.get("rsvp_status") == "maybe"]
    awaiting_families = [a for a in assignments if a.get("rsvp_status") in ("awaiting", None)]

    confirmed_adults = sum(a.get("confirmed_adults", 0) or 0 for a in confirmed_families)
    confirmed_children = sum(a.get("confirmed_children", 0) or 0 for a in confirmed_families)
    expected_attendees = confirmed_adults + confirmed_children

    dietary_veg = sum(a.get("dietary_veg", 0) or 0 for a in confirmed_families)
    dietary_non_veg = sum(a.get("dietary_non_veg", 0) or 0 for a in confirmed_families)
    dietary_jain = sum(a.get("dietary_jain", 0) or 0 for a in confirmed_families)

    # Actual attendance from check-in table
    attendance_records = list(att_col.find({"event_id": event_id}))
    actual_checked_in = sum(r.get("total_actual_attendees", 0) for r in attendance_records)
    walk_ins = sum(r.get("total_actual_attendees", 0) for r in attendance_records if r.get("is_walk_in"))

    # Budget stats
    categories = list(budget_col.find({"event_id": event_id}))
    allocated_total = sum(c.get("allocated_amount", 0) for c in categories)
    transactions = list(trans_col.find({"event_id": event_id}))
    spent_total = sum(t.get("amount", 0) for t in transactions)

    response_rate = round((len(confirmed_families) + len(declined_families) + len(maybe_families)) / total_assigned_families * 100, 1) if total_assigned_families > 0 else 0.0

    return {
        "event_id": event_id,
        "event_title": event.get("title"),
        "event_type": event.get("event_type"),
        "date": event.get("date"),
        "venue": event.get("venue_name"),
        "stats": {
            "total_invited_families": total_assigned_families,
            "total_invited_headcount": total_invited_headcount,
            "confirmed_families_count": len(confirmed_families),
            "declined_families_count": len(declined_families),
            "maybe_families_count": len(maybe_families),
            "awaiting_families_count": len(awaiting_families),
            "confirmed_adults": confirmed_adults,
            "confirmed_children": confirmed_children,
            "expected_attendees": expected_attendees,
            "response_rate_percent": response_rate,
            "actual_checked_in_attendees": actual_checked_in,
            "walk_in_attendees": walk_ins,
            "dietary": {
                "veg": dietary_veg,
                "non_veg": dietary_non_veg,
                "jain": dietary_jain
            },
            "budget": {
                "target_budget": event.get("target_budget", 0.0),
                "allocated_budget": allocated_total,
                "spent_budget": spent_total,
                "remaining_budget": max(0.0, (event.get("target_budget") or allocated_total) - spent_total),
                "cost_per_expected_attendee": round(spent_total / expected_attendees, 2) if expected_attendees > 0 else 0.0
            }
        }
    }
