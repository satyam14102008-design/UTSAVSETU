from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection

router = APIRouter(prefix="/smart-assist", tags=["AI & Smart Event Assistant"])

@router.get("/events/{event_id}/insights")
def get_smart_event_insights(event_id: str, current_user: dict = Depends(get_current_user)):
    """Analyzes real event data and generates intelligent, prioritized recommendations and alerts."""
    event = check_event_permission(event_id, current_user)
    assign_col = get_collection("event_guest_assignments")
    budget_col = get_collection("budget_categories")
    trans_col = get_collection("budget_transactions")
    food_cfg_col = get_collection("food_catering_configs")

    assignments = list(assign_col.find({"event_id": event_id}))
    transactions = list(trans_col.find({"event_id": event_id}))
    categories = list(budget_col.find({"event_id": event_id}))
    food_cfg = food_cfg_col.find_one({"event_id": event_id}) or {}

    insights = []

    # 1. Awaiting Responses Follow-up
    awaiting = [a for a in assignments if a.get("rsvp_status") in ("awaiting", None)]
    if awaiting:
        insights.append({
            "type": "follow_up",
            "priority": "high" if len(awaiting) > 5 else "medium",
            "title": f"{len(awaiting)} Families Awaiting Attendance Confirmation",
            "description": f"You have {len(awaiting)} guests who haven't responded yet. Send a gentle WhatsApp reminder to lock in headcounts before catering finalization.",
            "action_label": "Send WhatsApp Reminders",
            "target_count": len(awaiting),
            "guest_names": [a.get("family_name") for a in awaiting[:5]]
        })

    # 2. Confirmed without Meal Preferences
    confirmed_missing_diet = []
    for a in assignments:
        if a.get("rsvp_status") == "confirmed":
            total_attendees = (a.get("confirmed_adults") or 0) + (a.get("confirmed_children") or 0)
            specified_meals = (a.get("dietary_veg") or 0) + (a.get("dietary_non_veg") or 0) + (a.get("dietary_jain") or 0)
            if specified_meals < total_attendees:
                confirmed_missing_diet.append(a.get("family_name"))

    if confirmed_missing_diet:
        insights.append({
            "type": "dietary_missing",
            "priority": "medium",
            "title": f"{len(confirmed_missing_diet)} Confirmed Guests Haven't Selected Meal Preference",
            "description": "Some confirmed guests have not specified Veg, Non-Veg, or Jain. UtsavSetu currently assumes standard vegetarian buffet for them in estimates.",
            "action_label": "Request Meal Preference",
            "target_count": len(confirmed_missing_diet),
            "guest_names": confirmed_missing_diet[:5]
        })

    # 3. Budget Overrun Checks
    overruns = []
    for cat in categories:
        cat_spent = sum(t.get("amount", 0) for t in transactions if t.get("category_id") == cat["id"])
        allocated = cat.get("allocated_amount", 0.0)
        if cat_spent > allocated:
            overruns.append({
                "category": cat.get("name"),
                "allocated": allocated,
                "spent": cat_spent,
                "excess": round(cat_spent - allocated, 2)
            })

    if overruns:
        insights.append({
            "type": "budget_alert",
            "priority": "high",
            "title": f"Budget Exceeded in {len(overruns)} Categories",
            "description": f"Category '{overruns[0]['category']}' has exceeded its budget by ₹{overruns[0]['excess']:,.2f}.",
            "action_label": "Review Budget Ledger",
            "items": overruns
        })

    # 4. Missing Event Information
    missing_fields = []
    if not event.get("map_url"):
        missing_fields.append("Google Maps Venue Link")
    if not event.get("rsvp_deadline"):
        missing_fields.append("RSVP Response Deadline")
    if not event.get("venue_address"):
        missing_fields.append("Complete Venue Street Address")

    if missing_fields:
        insights.append({
            "type": "missing_info",
            "priority": "low",
            "title": "Incomplete Event Invitation Details",
            "description": f"Adding {', '.join(missing_fields)} will help guests navigate easily and respond promptly.",
            "action_label": "Update Event Details",
            "fields": missing_fields
        })

    # 5. Catering Minimum Warning
    confirmed_headcount = sum(
        (a.get("confirmed_adults") or 0) + (a.get("confirmed_children") or 0)
        for a in assignments if a.get("rsvp_status") == "confirmed"
    )
    caterer_min = food_cfg.get("catering_minimum_guarantee", 50)
    if 0 < confirmed_headcount < caterer_min:
        insights.append({
            "type": "caterer_minimum",
            "priority": "medium",
            "title": f"Confirmed Attendance ({confirmed_headcount}) Below Caterer Minimum ({caterer_min})",
            "description": f"Your current responses ({confirmed_headcount}) are below the minimum guarantee of {caterer_min} plates. You may be billed for {caterer_min} plates regardless.",
            "action_label": "Adjust Catering Buffer",
            "shortfall": caterer_min - confirmed_headcount
        })

    return {
        "event_id": event_id,
        "total_insights": len(insights),
        "insights": insights
    }
