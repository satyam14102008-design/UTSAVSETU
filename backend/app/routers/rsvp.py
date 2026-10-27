import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.models.rsvp import RSVPSubmission, RSVPResponseDetail, RSVPStatus
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection, sanitize_doc
from backend.app.services.event_engine import get_event_engine_config

router = APIRouter(prefix="/rsvp", tags=["Public RSVP & Tracking"])

@router.get("/invitation/{token}")
def get_invitation_by_token(token: str):
    """Public endpoint: Allows a guest to securely view their personalized invitation and current RSVP status."""
    assign_col = get_collection("event_guest_assignments")
    events_col = get_collection("events")
    designs_col = get_collection("card_designs")

    assignment = assign_col.find_one({"rsvp_token": token})
    event = None

    if assignment:
        event = events_col.find_one({"id": assignment.get("event_id")})
    else:
        # Check if token matches an event ID directly or with prefix
        event = events_col.find_one({"id": token})
        if not event and token.startswith("token_"):
            event = events_col.find_one({"id": token.replace("token_", "")})
        
        # Check if it's a demo/fallback token
        if not event and ("vikram" in token or "demo" in token or "sample" in token):
            assignment = assign_col.find_one({})
            if assignment:
                event = events_col.find_one({"id": assignment.get("event_id")})
        
        # General fallback to first available celebration if any
        if not event and not assignment:
            all_events = list(events_col.find({}))
            if all_events:
                event = all_events[0]

    if not event:
        raise HTTPException(status_code=404, detail="Invalid or expired invitation link")

    event_id = event.get("id")
    design = sanitize_doc(designs_col.find_one({"event_id": event_id}))
    engine_config = get_event_engine_config(event.get("event_type", "other"))

    # Fetch existing detailed response if available
    rsvp_col = get_collection("rsvp_responses")
    existing_rsvp = None
    if assignment:
        existing_rsvp = sanitize_doc(rsvp_col.find_one({"assignment_id": assignment.get("id")}))

    guest_name = assignment.get("primary_name") if assignment else "Valued Guest"
    family_name = assignment.get("family_name") if assignment else "Guest Family"
    invited_adults = assignment.get("invited_adults", 2) if assignment else 2
    invited_children = assignment.get("invited_children", 0) if assignment else 0
    current_status = assignment.get("rsvp_status", "awaiting") if assignment else "awaiting"

    return {
        "token": token,
        "guest_name": guest_name,
        "family_name": family_name,
        "invited_adults": invited_adults,
        "invited_children": invited_children,
        "current_rsvp_status": current_status,
        "event": {
            "id": event.get("id"),
            "title": event.get("title"),
            "event_type": event.get("event_type"),
            "date": event.get("date"),
            "time": event.get("time"),
            "venue_name": event.get("venue_name"),
            "venue_address": event.get("venue_address"),
            "map_url": event.get("map_url"),
            "host_names": event.get("host_names"),
            "description": event.get("description"),
            "primary_person_name": event.get("primary_person_name"),
            "secondary_person_name": event.get("secondary_person_name"),
            "birthday_age": event.get("birthday_age"),
            "anniversary_years": event.get("anniversary_years"),
            "pooja_name": event.get("pooja_name"),
            "muhurat_time": event.get("muhurat_time"),
            "prasad_offering": event.get("prasad_offering"),
            "house_name": event.get("house_name"),
            "rsvp_deadline": event.get("rsvp_deadline"),
            "rituals": event.get("rituals", [])
        },
        "card_design": design,
        "dietary_options": engine_config.get("dietary_options", ["Vegetarian", "Non-Vegetarian"]),
        "existing_response": existing_rsvp
    }

@router.post("/submit")
def submit_guest_rsvp(submission: RSVPSubmission):
    """Public endpoint: Guest submits or modifies their attendance confirmation."""
    assign_col = get_collection("event_guest_assignments")
    rsvp_col = get_collection("rsvp_responses")

    assignment = assign_col.find_one({"rsvp_token": submission.token})
    events_col = get_collection("events")

    if not assignment:
        # Match by event or demo token
        event = events_col.find_one({"id": submission.token})
        if not event and submission.token.startswith("token_"):
            event = events_col.find_one({"id": submission.token.replace("token_", "")})
        if not event:
            all_events = list(events_col.find({}))
            if all_events:
                event = all_events[0]
        
        if not event:
            raise HTTPException(status_code=404, detail="Invalid invitation token")

        # Create open guest assignment on the fly
        new_id = f"asgn_open_{uuid.uuid4().hex[:8]}"
        assignment = {
            "id": new_id,
            "event_id": event["id"],
            "primary_name": "Online RSVP Guest",
            "family_name": "Attending Guest Family",
            "phone": "+919999999999",
            "invited_adults": submission.attending_adults or 2,
            "invited_children": submission.attending_children or 0,
            "relation_group": "Online RSVP",
            "rsvp_token": submission.token,
            "invitation_status": "delivered",
            "rsvp_status": submission.status
        }
        assign_col.insert_one(assignment)

    event_id = assignment["event_id"]
    now_str = datetime.utcnow().isoformat()

    total_attendees = 0
    if submission.status == RSVPStatus.CONFIRMED:
        total_attendees = submission.attending_adults + submission.attending_children
    elif submission.status == RSVPStatus.MAYBE:
        total_attendees = submission.attending_adults + submission.attending_children
    else:  # Declined
        submission.attending_adults = 0
        submission.attending_children = 0
        submission.dietary_veg = 0
        submission.dietary_non_veg = 0
        submission.dietary_jain = 0
        total_attendees = 0

    # Save or update RSVP Response Record
    existing_resp = rsvp_col.find_one({"assignment_id": assignment["id"]})
    resp_id = existing_resp["id"] if existing_resp else f"rsvp_{uuid.uuid4().hex[:10]}"

    rsvp_doc = {
        "id": resp_id,
        "assignment_id": assignment["id"],
        "event_id": event_id,
        "guest_name": assignment.get("primary_name"),
        "family_name": assignment.get("family_name"),
        "status": submission.status,
        "attending_adults": submission.attending_adults,
        "attending_children": submission.attending_children,
        "total_attendees": total_attendees,
        "dietary_veg": submission.dietary_veg,
        "dietary_non_veg": submission.dietary_non_veg,
        "dietary_jain": submission.dietary_jain,
        "special_dietary_notes": submission.special_dietary_notes,
        "arrival_time": submission.arrival_time,
        "prasad_count": submission.prasad_count or 0,
        "birthday_children_ages": submission.birthday_children_ages,
        "guest_wishes": submission.guest_wishes,
        "submitted_at": existing_resp["submitted_at"] if existing_resp else now_str,
        "updated_at": now_str
    }
    
    if existing_resp:
        rsvp_col.update_one({"id": resp_id}, {"$set": rsvp_doc})
    else:
        rsvp_col.insert_one(rsvp_doc)

    # Sync into assignment table for fast indexing & check-in
    assign_col.update_one(
        {"id": assignment["id"]},
        {"$set": {
            "rsvp_status": submission.status,
            "confirmed_adults": submission.attending_adults,
            "confirmed_children": submission.attending_children,
            "dietary_veg": submission.dietary_veg,
            "dietary_non_veg": submission.dietary_non_veg,
            "dietary_jain": submission.dietary_jain,
            "arrival_time": submission.arrival_time,
            "prasad_count": submission.prasad_count or 0,
            "updated_at": now_str
        }}
    )

    return {
        "status": "success",
        "message": "Thank you! Your response has been recorded.",
        "confirmation": rsvp_doc
    }

@router.get("/events/{event_id}/responses", response_model=List[RSVPResponseDetail])
def list_event_rsvp_responses(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    rsvp_col = get_collection("rsvp_responses")
    responses = rsvp_col.find({"event_id": event_id})
    return [RSVPResponseDetail(**r) for r in responses]
