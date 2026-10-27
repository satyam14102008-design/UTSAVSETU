import uuid
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.models.invitation import CardDesignCreate, CardDesignResponse
from backend.app.auth import get_current_user, check_event_permission
from backend.app.database import get_collection
from backend.app.services.event_engine import format_invitation_message, get_event_engine_config

router = APIRouter(prefix="/invitations", tags=["Invitation Card Studio"])

CARD_TEMPLATES = [
    {
        "id": "royal_maroon_gold",
        "name": "Royal Maroon & Gold",
        "category": "wedding",
        "theme_preset": "royal_maroon",
        "background_color": "#800020",
        "accent_color": "#D4AF37",
        "text_color": "#FAF7F2",
        "secondary_text_color": "#EADBC8",
        "font_family": "Cinzel",
        "border": "ornate_gold",
        "motif": "ganesha",
        "preview_badge": "Royal Wedding"
    },
    {
        "id": "romantic_floral",
        "name": "Romantic Rose & Blush",
        "category": "engagement",
        "theme_preset": "pastel_floral",
        "background_color": "#831843",
        "accent_color": "#F472B6",
        "text_color": "#FFF1F2",
        "secondary_text_color": "#FCE7F3",
        "font_family": "Playfair Display",
        "border": "floral_wreath",
        "motif": "rings",
        "preview_badge": "Engagement"
    },
    {
        "id": "kids_cartoon",
        "name": "Superhero & Party Spark",
        "category": "birthday",
        "theme_preset": "neon_celebration",
        "background_color": "#0284C7",
        "accent_color": "#FBBF24",
        "text_color": "#FFFFFF",
        "secondary_text_color": "#E0F2FE",
        "font_family": "Plus Jakarta Sans",
        "border": "modern_thin",
        "motif": "birthday_cake",
        "preview_badge": "Kids Birthday"
    },
    {
        "id": "traditional_saffron",
        "name": "Sacred Saffron Devotional",
        "category": "pooja",
        "theme_preset": "divine_saffron",
        "background_color": "#B45309",
        "accent_color": "#F59E0B",
        "text_color": "#FFFBEB",
        "secondary_text_color": "#FEF3C7",
        "font_family": "Rozha One",
        "border": "ornate_gold",
        "motif": "om",
        "preview_badge": "Pooja & Havan"
    },
    {
        "id": "emerald_palace",
        "name": "Emerald & Champagne Gold",
        "category": "housewarming",
        "theme_preset": "emerald_gold",
        "background_color": "#14532D",
        "accent_color": "#86EFAC",
        "text_color": "#F0FDF4",
        "secondary_text_color": "#DCFCE7",
        "font_family": "Cinzel",
        "border": "royal_arch",
        "motif": "kalash",
        "preview_badge": "Griha Pravesh"
    },
    {
        "id": "minimal_ivory",
        "name": "Minimal Modern Ivory",
        "category": "anniversary",
        "theme_preset": "minimal_ivory",
        "background_color": "#2D2D2D",
        "accent_color": "#D4AF37",
        "text_color": "#FAF7F2",
        "secondary_text_color": "#9CA3AF",
        "font_family": "Playfair Display",
        "border": "modern_thin",
        "motif": "sparkles",
        "preview_badge": "Anniversary"
    }
]

@router.get("/templates")
def list_card_templates(event_type: Optional[str] = None):
    if event_type:
        # Prioritize relevant templates for this event type
        matching = [t for t in CARD_TEMPLATES if t["category"] == event_type]
        others = [t for t in CARD_TEMPLATES if t["category"] != event_type]
        return matching + others
    return CARD_TEMPLATES

@router.get("/events/{event_id}/design", response_model=CardDesignResponse)
def get_card_design(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    designs_col = get_collection("card_designs")
    design = designs_col.find_one({"event_id": event_id})
    if not design:
        raise HTTPException(status_code=404, detail="Design not initialized for this event")
    return CardDesignResponse(**design)

@router.put("/events/{event_id}/design", response_model=CardDesignResponse)
def save_card_design(event_id: str, design_in: CardDesignCreate, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user, required_roles=["owner", "admin", "manager"])
    designs_col = get_collection("card_designs")
    
    existing = designs_col.find_one({"event_id": event_id})
    doc = design_in.dict()
    if existing:
        designs_col.update_one({"event_id": event_id}, {"$set": doc})
        doc["id"] = existing["id"]
    else:
        doc["id"] = f"card_{uuid.uuid4().hex[:10]}"
        designs_col.insert_one(doc)

    return CardDesignResponse(**doc)

@router.post("/events/{event_id}/suggest-wording")
def suggest_wording(
    event_id: str,
    language: str = "en",
    current_user: dict = Depends(get_current_user)
):
    event = check_event_permission(event_id, current_user)
    wording = format_invitation_message(event.get("event_type", "other"), language, event)
    return {
        "event_id": event_id,
        "language": language,
        "suggested_message": wording
    }

