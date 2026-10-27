import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.models.attendance import CheckInRequest, AttendanceRecordResponse, AttendanceSummary
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection

router = APIRouter(prefix="/attendance", tags=["Event-Day Attendance & Check-In"])

@router.get("/events/{event_id}/search")
def search_guests_for_checkin(
    event_id: str,
    q: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Fast search for check-in staff by guest name, family name, phone number, or QR token."""
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager", "checkin_staff"])
    assign_col = get_collection("event_guest_assignments")

    assignments = assign_col.find({"event_id": event_id})
    if not q:
        return assignments[:30]

    q_clean = q.strip().lower()
    results = []
    for a in assignments:
        if (
            q_clean in a.get("primary_name", "").lower()
            or q_clean in a.get("family_name", "").lower()
            or q_clean in a.get("phone", "")
            or q_clean == a.get("rsvp_token", "").lower()
        ):
            results.append(a)
    return results

@router.post("/events/{event_id}/check-in")
def check_in_guest(
    event_id: str,
    checkin_in: CheckInRequest,
    current_user: dict = Depends(get_current_user)
):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager", "checkin_staff"])
    assign_col = get_collection("event_guest_assignments")
    att_col = get_collection("attendance_records")

    now_str = datetime.utcnow().isoformat()
    total_actual = checkin_in.actual_adults + checkin_in.actual_children

    if checkin_in.assignment_id:
        assignment = assign_col.find_one({"id": checkin_in.assignment_id, "event_id": event_id})
        if not assignment:
            raise HTTPException(status_code=404, detail="Guest assignment record not found")

        # Duplicate check-in prevention
        if assignment.get("is_checked_in") and not checkin_in.force_override:
            return {
                "status": "warning",
                "is_duplicate": True,
                "message": f"Guest '{assignment.get('primary_name')}' was ALREADY checked in at {assignment.get('checked_in_at')} for {assignment.get('checked_in_count')} guests.",
                "existing_record": assignment
            }

        # Update assignment record
        assign_col.update_one(
            {"id": assignment["id"]},
            {"$set": {
                "is_checked_in": True,
                "checked_in_count": total_actual,
                "checked_in_at": now_str
            }}
        )

        # Log attendance entry
        rec_id = f"att_{uuid.uuid4().hex[:10]}"
        att_doc = {
            "id": rec_id,
            "event_id": event_id,
            "assignment_id": assignment["id"],
            "guest_name": assignment.get("primary_name"),
            "family_name": assignment.get("family_name"),
            "phone": assignment.get("phone"),
            "actual_adults": checkin_in.actual_adults,
            "actual_children": checkin_in.actual_children,
            "total_actual_attendees": total_actual,
            "is_walk_in": False,
            "check_in_time": now_str,
            "checked_in_by": current_user.get("name", "Staff"),
            "notes": checkin_in.notes
        }
        att_col.insert_one(att_doc)

        return {
            "status": "success",
            "is_duplicate": False,
            "message": f"Successfully checked in {total_actual} guests for {assignment.get('family_name')}.",
            "record": att_doc
        }
    else:
        # Walk-in Guest Check-In
        rec_id = f"att_{uuid.uuid4().hex[:10]}"
        att_doc = {
            "id": rec_id,
            "event_id": event_id,
            "assignment_id": None,
            "guest_name": checkin_in.guest_name,
            "family_name": checkin_in.family_name or f"{checkin_in.guest_name} Family",
            "phone": checkin_in.phone or "",
            "actual_adults": checkin_in.actual_adults,
            "actual_children": checkin_in.actual_children,
            "total_actual_attendees": total_actual,
            "is_walk_in": True,
            "check_in_time": now_str,
            "checked_in_by": current_user.get("name", "Staff"),
            "notes": checkin_in.notes
        }
        att_col.insert_one(att_doc)

        return {
            "status": "success",
            "is_duplicate": False,
            "message": f"Registered and checked in walk-in guest {checkin_in.guest_name} ({total_actual} people).",
            "record": att_doc
        }

@router.get("/events/{event_id}/summary", response_model=AttendanceSummary)
def get_attendance_summary(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    assign_col = get_collection("event_guest_assignments")
    att_col = get_collection("attendance_records")

    assignments = list(assign_col.find({"event_id": event_id}))
    records = list(att_col.find({"event_id": event_id}))

    total_invited = sum(a.get("invited_adults", 0) + a.get("invited_children", 0) for a in assignments)
    confirmed_assignments = [a for a in assignments if a.get("rsvp_status") == "confirmed"]
    total_rsvp_confirmed = sum(a.get("confirmed_adults", 0) + a.get("confirmed_children", 0) for a in confirmed_assignments)

    actual_adults = sum(r.get("actual_adults", 0) for r in records)
    actual_children = sum(r.get("actual_children", 0) for r in records)
    total_actual = actual_adults + actual_children
    walk_ins = sum(1 for r in records if r.get("is_walk_in"))

    checked_in_assignment_ids = {r.get("assignment_id") for r in records if r.get("assignment_id")}
    confirmed_not_arrived = sum(
        (a.get("confirmed_adults", 0) + a.get("confirmed_children", 0))
        for a in confirmed_assignments
        if a["id"] not in checked_in_assignment_ids
    )

    rate = round((total_actual / total_rsvp_confirmed * 100), 1) if total_rsvp_confirmed > 0 else 0.0

    return AttendanceSummary(
        event_id=event_id,
        total_invited=total_invited,
        total_rsvp_confirmed=total_rsvp_confirmed,
        total_actual_attended=total_actual,
        actual_adults=actual_adults,
        actual_children=actual_children,
        walk_in_count=walk_ins,
        confirmed_not_arrived=max(0, confirmed_not_arrived),
        attendance_rate_percentage=rate
    )

@router.get("/events/{event_id}/records", response_model=List[AttendanceRecordResponse])
def list_attendance_records(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    att_col = get_collection("attendance_records")
    records = att_col.find({"event_id": event_id})
    return [AttendanceRecordResponse(**r) for r in records]
