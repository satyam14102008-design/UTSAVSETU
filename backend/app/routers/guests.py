import io
import csv
import uuid
import secrets
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from backend.app.models.guest import (
    GuestContactCreate, GuestContactUpdate, GuestContactResponse,
    EventGuestAssign, BulkGuestAssign, EventGuestAssignmentResponse, InvitationStatus
)
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection

router = APIRouter(prefix="/guests", tags=["Guests & Families"])

@router.get("/contacts", response_model=List[GuestContactResponse])
def list_contacts(
    search: Optional[str] = None,
    group: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    guests_col = get_collection("guests")
    query = {"created_by": current_user["id"]}
    if group:
        query["relation_group"] = group
    
    contacts = guests_col.find(query)
    if search:
        search_lower = search.lower()
        contacts = [
            c for c in contacts
            if search_lower in c.get("primary_name", "").lower()
            or search_lower in c.get("family_name", "").lower()
            or search_lower in c.get("phone", "")
        ]
    return [GuestContactResponse(**c) for c in contacts]

@router.post("/contacts", response_model=GuestContactResponse)
def create_contact(contact_in: GuestContactCreate, current_user: dict = Depends(get_current_user)):
    guests_col = get_collection("guests")
    
    # Check duplicate phone for this user
    existing = guests_col.find_one({"created_by": current_user["id"], "phone": contact_in.phone})
    if existing:
        raise HTTPException(status_code=400, detail=f"A contact with phone {contact_in.phone} already exists ({existing.get('primary_name')})")

    cid = f"gst_{uuid.uuid4().hex[:10]}"
    doc = {
        "id": cid,
        "family_name": contact_in.family_name,
        "primary_name": contact_in.primary_name,
        "phone": contact_in.phone,
        "email": contact_in.email,
        "city": contact_in.city,
        "relation_group": contact_in.relation_group or "General",
        "adults_count": contact_in.adults_count,
        "children_count": contact_in.children_count,
        "notes": contact_in.notes,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow().isoformat()
    }
    guests_col.insert_one(doc)
    return GuestContactResponse(**doc)

@router.put("/contacts/{contact_id}", response_model=GuestContactResponse)
def update_contact(contact_id: str, contact_in: GuestContactUpdate, current_user: dict = Depends(get_current_user)):
    guests_col = get_collection("guests")
    contact = guests_col.find_one({"id": contact_id, "created_by": current_user["id"]})
    if not contact:
        raise HTTPException(status_code=404, detail="Guest contact not found")

    up_data = {k: v for k, v in contact_in.dict().items() if v is not None}
    guests_col.update_one({"id": contact_id}, {"$set": up_data})
    
    updated = guests_col.find_one({"id": contact_id})
    return GuestContactResponse(**updated)

@router.delete("/contacts/{contact_id}")
def delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    guests_col = get_collection("guests")
    assign_col = get_collection("event_guest_assignments")

    contact = guests_col.find_one({"id": contact_id, "created_by": current_user["id"]})
    if not contact:
        raise HTTPException(status_code=404, detail="Guest contact not found")

    guests_col.delete_one({"id": contact_id})
    assign_col.delete_many({"guest_id": contact_id})
    return {"message": "Contact and related assignments removed"}

@router.post("/contacts/csv-import")
async def import_contacts_csv(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    """Bulk import guest contacts from CSV with columns: Family Name, Primary Name, Phone, Email, City, Group, Adults, Children"""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")

    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))
    
    guests_col = get_collection("guests")
    imported_count = 0
    duplicate_count = 0

    for row in reader:
        # Flexible header lookup
        primary_name = row.get("Primary Name") or row.get("Name") or row.get("Guest Name") or ""
        family_name = row.get("Family Name") or row.get("Family") or f"{primary_name} Family"
        phone = row.get("Phone") or row.get("Mobile") or row.get("WhatsApp") or ""
        
        if not phone and not primary_name:
            continue

        # Check duplicate phone for this user
        if phone:
            existing = guests_col.find_one({"created_by": current_user["id"], "phone": phone})
            if existing:
                duplicate_count += 1
                continue

        adults = int(row.get("Adults") or 2)
        kids = int(row.get("Children") or row.get("Kids") or 0)
        group = row.get("Group") or row.get("Relation") or "General"
        email = row.get("Email")
        city = row.get("City")

        cid = f"gst_{uuid.uuid4().hex[:10]}"
        guests_col.insert_one({
            "id": cid,
            "family_name": family_name.strip(),
            "primary_name": primary_name.strip() or family_name.strip(),
            "phone": phone.strip(),
            "email": email.strip() if email else None,
            "city": city.strip() if city else None,
            "relation_group": group.strip(),
            "adults_count": max(1, adults),
            "children_count": max(0, kids),
            "created_by": current_user["id"],
            "created_at": datetime.utcnow().isoformat()
        })
        imported_count += 1

    return {
        "status": "success",
        "imported_count": imported_count,
        "duplicate_skipped": duplicate_count
    }

# ----------------- EVENT ASSIGNMENTS ----------------- #

@router.get("/events/{event_id}/assignments", response_model=List[EventGuestAssignmentResponse])
def get_event_assignments(
    event_id: str,
    rsvp_status: Optional[str] = None,
    group: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    check_event_permission(event_id, current_user)
    assign_col = get_collection("event_guest_assignments")
    
    query = {"event_id": event_id}
    if rsvp_status:
        query["rsvp_status"] = rsvp_status
    if group:
        query["relation_group"] = group

    assignments = assign_col.find(query)
    return [EventGuestAssignmentResponse(**a) for a in assignments]

@router.post("/events/{event_id}/assign-single", response_model=EventGuestAssignmentResponse)
def assign_single_guest(event_id: str, assign_in: EventGuestAssign, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    guests_col = get_collection("guests")
    assign_col = get_collection("event_guest_assignments")

    contact = guests_col.find_one({"id": assign_in.guest_id, "created_by": current_user["id"]})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")

    existing = assign_col.find_one({"event_id": event_id, "guest_id": assign_in.guest_id})
    if existing:
        return EventGuestAssignmentResponse(**existing)

    token = f"tok_{secrets.token_urlsafe(12)}"
    doc = {
        "id": f"asgn_{uuid.uuid4().hex[:10]}",
        "guest_id": contact["id"],
        "event_id": event_id,
        "family_name": contact["family_name"],
        "primary_name": contact["primary_name"],
        "phone": contact["phone"],
        "invited_adults": assign_in.invited_adults or contact["adults_count"],
        "invited_children": assign_in.invited_children or contact["children_count"],
        "relation_group": contact.get("relation_group", "Family"),
        "invitation_status": InvitationStatus.DRAFT,
        "rsvp_token": token,
        "rsvp_status": "awaiting",
        "confirmed_adults": None,
        "confirmed_children": None,
        "is_checked_in": False,
        "checked_in_count": 0,
        "created_at": datetime.utcnow().isoformat()
    }
    assign_col.insert_one(doc)
    return EventGuestAssignmentResponse(**doc)

@router.post("/events/{event_id}/assign-bulk")
def assign_bulk_guests(event_id: str, bulk_in: BulkGuestAssign, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    guests_col = get_collection("guests")
    assign_col = get_collection("event_guest_assignments")

    assigned_count = 0
    for gid in bulk_in.guest_ids:
        contact = guests_col.find_one({"id": gid, "created_by": current_user["id"]})
        if not contact:
            continue
        existing = assign_col.find_one({"event_id": event_id, "guest_id": gid})
        if existing:
            continue

        token = f"tok_{secrets.token_urlsafe(12)}"
        assign_col.insert_one({
            "id": f"asgn_{uuid.uuid4().hex[:10]}",
            "guest_id": contact["id"],
            "event_id": event_id,
            "family_name": contact["family_name"],
            "primary_name": contact["primary_name"],
            "phone": contact["phone"],
            "invited_adults": contact["adults_count"],
            "invited_children": contact["children_count"],
            "relation_group": contact.get("relation_group", "Family"),
            "invitation_status": InvitationStatus.DRAFT,
            "rsvp_token": token,
            "rsvp_status": "awaiting",
            "confirmed_adults": None,
            "confirmed_children": None,
            "is_checked_in": False,
            "checked_in_count": 0,
            "created_at": datetime.utcnow().isoformat()
        })
        assigned_count += 1

    return {"status": "success", "assigned_count": assigned_count}

@router.delete("/events/{event_id}/assignments/{assignment_id}")
def remove_guest_assignment(event_id: str, assignment_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    assign_col = get_collection("event_guest_assignments")
    assign_col.delete_one({"id": assignment_id, "event_id": event_id})
    return {"message": "Guest unassigned from this event"}

