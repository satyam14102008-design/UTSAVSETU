import uuid
from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from backend.app.models.budget import (
    BudgetCategoryCreate, BudgetCategoryResponse,
    BudgetTransactionCreate, BudgetTransactionResponse,
    FoodCateringConfig, FoodBudgetSummary
)
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection
from backend.app.services.food_calculator import calculate_food_and_catering

router = APIRouter(prefix="/budget", tags=["Budget & Food Planning"])

@router.get("/events/{event_id}/categories", response_model=List[BudgetCategoryResponse])
def get_categories(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    budget_col = get_collection("budget_categories")
    trans_col = get_collection("budget_transactions")

    categories = list(budget_col.find({"event_id": event_id}))
    transactions = list(trans_col.find({"event_id": event_id}))

    results = []
    for cat in categories:
        cat_spent = sum(t.get("amount", 0) for t in transactions if t.get("category_id") == cat["id"])
        allocated = cat.get("allocated_amount", 0.0)
        results.append(BudgetCategoryResponse(
            id=cat["id"],
            event_id=event_id,
            name=cat["name"],
            allocated_amount=allocated,
            spent_amount=cat_spent,
            remaining_amount=max(0.0, allocated - cat_spent),
            icon=cat.get("icon", "tag"),
            notes=cat.get("notes")
        ))
    return results

@router.post("/events/{event_id}/categories", response_model=BudgetCategoryResponse)
def add_category(event_id: str, cat_in: BudgetCategoryCreate, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    budget_col = get_collection("budget_categories")

    cid = f"bcat_{uuid.uuid4().hex[:8]}"
    doc = {
        "id": cid,
        "event_id": event_id,
        "name": cat_in.name,
        "allocated_amount": cat_in.allocated_amount,
        "icon": cat_in.icon or "tag",
        "notes": cat_in.notes
    }
    budget_col.insert_one(doc)
    return BudgetCategoryResponse(
        id=cid,
        event_id=event_id,
        name=doc["name"],
        allocated_amount=doc["allocated_amount"],
        spent_amount=0.0,
        remaining_amount=doc["allocated_amount"],
        icon=doc["icon"],
        notes=doc["notes"]
    )

@router.delete("/events/{event_id}/categories/{category_id}")
def delete_category(event_id: str, category_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    budget_col = get_collection("budget_categories")
    trans_col = get_collection("budget_transactions")

    budget_col.delete_one({"id": category_id, "event_id": event_id})
    trans_col.delete_many({"category_id": category_id, "event_id": event_id})
    return {"message": "Category and associated transactions deleted"}

@router.get("/events/{event_id}/transactions", response_model=List[BudgetTransactionResponse])
def get_transactions(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    trans_col = get_collection("budget_transactions")
    budget_col = get_collection("budget_categories")

    transactions = list(trans_col.find({"event_id": event_id}))
    categories = {c["id"]: c.get("name") for c in list(budget_col.find({"event_id": event_id}))}

    results = []
    for t in transactions:
        results.append(BudgetTransactionResponse(
            id=t["id"],
            event_id=event_id,
            category_id=t.get("category_id", ""),
            category_name=categories.get(t.get("category_id"), "General"),
            title=t["title"],
            amount=t["amount"],
            vendor_name=t.get("vendor_name"),
            vendor_phone=t.get("vendor_phone"),
            status=t.get("status", "paid"),
            paid_date=t.get("paid_date"),
            receipt_notes=t.get("receipt_notes"),
            created_at=t.get("created_at")
        ))
    return results

@router.post("/events/{event_id}/transactions", response_model=BudgetTransactionResponse)
def add_transaction(event_id: str, tx_in: BudgetTransactionCreate, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    trans_col = get_collection("budget_transactions")
    budget_col = get_collection("budget_categories")

    category = budget_col.find_one({"id": tx_in.category_id, "event_id": event_id})
    cat_name = category.get("name") if category else "General"

    tx_id = f"tx_{uuid.uuid4().hex[:8]}"
    doc = {
        "id": tx_id,
        "event_id": event_id,
        "category_id": tx_in.category_id,
        "title": tx_in.title,
        "amount": tx_in.amount,
        "vendor_name": tx_in.vendor_name,
        "vendor_phone": tx_in.vendor_phone,
        "status": tx_in.status,
        "paid_date": tx_in.paid_date or datetime.utcnow().strftime("%Y-%m-%d"),
        "receipt_notes": tx_in.receipt_notes,
        "created_at": datetime.utcnow().isoformat()
    }
    trans_col.insert_one(doc)

    return BudgetTransactionResponse(
        id=tx_id,
        event_id=event_id,
        category_id=tx_in.category_id,
        category_name=cat_name,
        title=doc["title"],
        amount=doc["amount"],
        vendor_name=doc["vendor_name"],
        vendor_phone=doc["vendor_phone"],
        status=doc["status"],
        paid_date=doc["paid_date"],
        receipt_notes=doc["receipt_notes"],
        created_at=doc["created_at"]
    )

# ----------------- FOOD & CATERING PLANNING ----------------- #

@router.get("/events/{event_id}/food-config", response_model=FoodCateringConfig)
def get_food_config(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    food_cfg_col = get_collection("food_catering_configs")
    cfg = food_cfg_col.find_one({"event_id": event_id})
    if not cfg:
        # Default config
        cfg = {
            "event_id": event_id,
            "price_per_veg": 750.0,
            "price_per_non_veg": 950.0,
            "price_per_child": 400.0,
            "buffer_percentage": 10.0,
            "catering_minimum_guarantee": 50,
            "fixed_service_fee": 10000.0
        }
        food_cfg_col.insert_one(cfg)
    return FoodCateringConfig(**cfg)

@router.put("/events/{event_id}/food-config", response_model=FoodCateringConfig)
def update_food_config(event_id: str, cfg_in: FoodCateringConfig, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    food_cfg_col = get_collection("food_catering_configs")

    doc = cfg_in.dict()
    doc["event_id"] = event_id
    existing = food_cfg_col.find_one({"event_id": event_id})
    if existing:
        food_cfg_col.update_one({"event_id": event_id}, {"$set": doc})
    else:
        food_cfg_col.insert_one(doc)

    return FoodCateringConfig(**doc)

@router.get("/events/{event_id}/food-calculation", response_model=FoodBudgetSummary)
def get_food_calculation_summary(event_id: str, current_user: dict = Depends(get_current_user)):
    """Computes exact food quantities, buffer applications, catering minimums, and transparent cost difference."""
    check_event_permission(event_id, current_user)
    assign_col = get_collection("event_guest_assignments")
    food_cfg_col = get_collection("food_catering_configs")

    cfg_dict = food_cfg_col.find_one({"event_id": event_id})
    if not cfg_dict:
        cfg = FoodCateringConfig(event_id=event_id)
    else:
        cfg = FoodCateringConfig(**cfg_dict)

    assignments = list(assign_col.find({"event_id": event_id}))
    
    total_invited_guests = sum(a.get("invited_adults", 0) + a.get("invited_children", 0) for a in assignments)
    confirmed_assignments = [a for a in assignments if a.get("rsvp_status") == "confirmed"]

    confirmed_adults = sum(a.get("confirmed_adults", 0) or 0 for a in confirmed_assignments)
    confirmed_children = sum(a.get("confirmed_children", 0) or 0 for a in confirmed_assignments)
    confirmed_veg = sum(a.get("dietary_veg", 0) or 0 for a in confirmed_assignments)
    confirmed_non_veg = sum(a.get("dietary_non_veg", 0) or 0 for a in confirmed_assignments)
    confirmed_jain = sum(a.get("dietary_jain", 0) or 0 for a in confirmed_assignments)

    summary = calculate_food_and_catering(
        config=cfg,
        total_invited_guests=total_invited_guests,
        confirmed_adults=confirmed_adults,
        confirmed_children=confirmed_children,
        confirmed_veg=confirmed_veg,
        confirmed_non_veg=confirmed_non_veg,
        confirmed_jain=confirmed_jain,
        actual_spent=cfg.actual_catering_cost or 0.0
    )
    return summary
