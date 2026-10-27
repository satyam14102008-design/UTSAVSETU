from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class CardDesignCreate(BaseModel):
    event_id: str
    template_id: str = "royal_maroon_gold"
    aspect_ratio: str = "portrait"  # portrait (9:16 or 4:5), square (1:1), landscape
    language: str = "en"           # en, hi
    
    # Text Fields
    header_text: Optional[str] = "|| Shree Ganeshay Namah ||"
    title: str = "Grand Wedding Celebration"
    subtitle: Optional[str] = "Together with our families"
    honoree_text: Optional[str] = "Rahul & Ananya"
    event_date_text: Optional[str] = "Sunday, December 14, 2026"
    event_time_text: Optional[str] = "7:00 PM onwards"
    venue_text: Optional[str] = "The Taj Palace, Colaba"
    address_text: Optional[str] = "Apollo Bunder, Mumbai, Maharashtra"
    invitation_body: str = "We cordially invite you and your family to celebrate our special day with love and blessings."
    rsvp_note: Optional[str] = "Please RSVP by November 30"
    host_signature: Optional[str] = "With best compliments from Sharma & Verma Families"
    contact_phone: Optional[str] = "+91 98765 43210"
    
    # Styling
    theme_preset: str = "royal_maroon" # royal_maroon, divine_saffron, emerald_gold, pastel_floral, neon_celebration, minimal_ivory
    background_color: str = "#800020"
    card_background_type: str = "solid" # solid, gradient, patterned
    accent_color: str = "#D4AF37"
    text_color: str = "#FAF7F2"
    secondary_text_color: str = "#EADBC8"
    font_family: str = "Cinzel"       # Cinzel, Playfair Display, Plus Jakarta Sans, Rozha One
    decorative_border: str = "ornate_gold" # ornate_gold, royal_arch, floral_wreath, modern_thin, none
    motif_symbol: str = "ganesha"     # ganesha, kalash, diya, rings, birthday_cake, om, floral, none
    
    # Elements
    show_qr_code: bool = True
    show_map_link: bool = True
    custom_elements: Optional[Dict[str, Any]] = {}

class CardDesignResponse(CardDesignCreate):
    id: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

