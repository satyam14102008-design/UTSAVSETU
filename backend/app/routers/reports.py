import io
import csv
from fastapi import APIRouter, HTTPException, Depends, Response
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection
from backend.app.services.pdf_generator import generate_guest_rsvp_pdf, generate_catering_sheet_pdf
from backend.app.services.food_calculator import calculate_food_and_catering
from backend.app.models.budget import FoodCateringConfig

router = APIRouter(prefix="/reports", tags=["Reports & Exports"])

@router.get("/events/{event_id}/guests.csv")
def export_guests_csv(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    assign_col = get_collection("event_guest_assignments")
    assignments = assign_col.find({"event_id": event_id})

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Family Name", "Primary Contact", "Phone", "Relation Group",
        "Invited Adults", "Invited Children", "RSVP Status",
        "Confirmed Adults", "Confirmed Children", "Veg Meals", "Non-Veg Meals", "Jain Meals",
        "Arrival Time", "Checked In", "Checked In Count"
    ])

    for a in assignments:
        writer.writerow([
            a.get("family_name", ""),
            a.get("primary_name", ""),
            a.get("phone", ""),
            a.get("relation_group", ""),
            a.get("invited_adults", 0),
            a.get("invited_children", 0),
            a.get("rsvp_status", "awaiting"),
            a.get("confirmed_adults") or 0,
            a.get("confirmed_children") or 0,
            a.get("dietary_veg") or 0,
            a.get("dietary_non_veg") or 0,
            a.get("dietary_jain") or 0,
            a.get("arrival_time", ""),
            "Yes" if a.get("is_checked_in") else "No",
            a.get("checked_in_count", 0)
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=utsavsetu_event_{event_id}_guests.csv"}
    )

@router.get("/events/{event_id}/budget.csv")
def export_budget_csv(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    trans_col = get_collection("budget_transactions")
    budget_col = get_collection("budget_categories")

    transactions = trans_col.find({"event_id": event_id})
    categories = {c["id"]: c.get("name") for c in budget_col.find({"event_id": event_id})}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Category", "Item / Expense Title", "Vendor", "Amount (INR)", "Status", "Notes"])

    for t in transactions:
        writer.writerow([
            t.get("paid_date", ""),
            categories.get(t.get("category_id"), "General"),
            t.get("title", ""),
            t.get("vendor_name", ""),
            t.get("amount", 0.0),
            t.get("status", "paid"),
            t.get("receipt_notes", "")
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=utsavsetu_event_{event_id}_budget.csv"}
    )

@router.get("/events/{event_id}/guest-list.pdf")
def export_guest_list_pdf(event_id: str, current_user: dict = Depends(get_current_user)):
    event = check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    assign_col = get_collection("event_guest_assignments")
    assignments = assign_col.find({"event_id": event_id})

    pdf_bytes = generate_guest_rsvp_pdf(event, assignments)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=utsavsetu_guest_roster_{event_id}.pdf"}
    )

@router.get("/events/{event_id}/catering-sheet.pdf")
def export_catering_sheet_pdf(event_id: str, current_user: dict = Depends(get_current_user)):
    event = check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    assign_col = get_collection("event_guest_assignments")
    food_cfg_col = get_collection("food_catering_configs")

    cfg_dict = food_cfg_col.find_one({"event_id": event_id})
    cfg = FoodCateringConfig(**cfg_dict) if cfg_dict else FoodCateringConfig(event_id=event_id)

    assignments = assign_col.find({"event_id": event_id})
    total_invited = sum(a.get("invited_adults", 0) + a.get("invited_children", 0) for a in assignments)
    confirmed_assignments = [a for a in assignments if a.get("rsvp_status") == "confirmed"]

    summary = calculate_food_and_catering(
        config=cfg,
        total_invited_guests=total_invited,
        confirmed_adults=sum(a.get("confirmed_adults", 0) or 0 for a in confirmed_assignments),
        confirmed_children=sum(a.get("confirmed_children", 0) or 0 for a in confirmed_assignments),
        confirmed_veg=sum(a.get("dietary_veg", 0) or 0 for a in confirmed_assignments),
        confirmed_non_veg=sum(a.get("dietary_non_veg", 0) or 0 for a in confirmed_assignments),
        confirmed_jain=sum(a.get("dietary_jain", 0) or 0 for a in confirmed_assignments),
        actual_spent=cfg.actual_catering_cost or 0.0
    )

    pdf_bytes = generate_catering_sheet_pdf(event, summary.dict(), cfg.dict())
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=utsavsetu_caterer_order_{event_id}.pdf"}
    )
