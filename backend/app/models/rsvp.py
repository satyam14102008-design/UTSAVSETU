from pydantic import BaseModel, Field, model_validator
from typing import Optional, List, Dict, Any
from enum import Enum

class RSVPStatus(str, Enum):
    AWAITING = "awaiting"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    MAYBE = "maybe"

class RSVPSubmission(BaseModel):
    token: str = Field(..., description="Unique guest-specific invitation token")
    status: RSVPStatus
    attending_adults: int = Field(default=0, ge=0)
    attending_children: int = Field(default=0, ge=0)
    
    # Dietary counts
    dietary_veg: int = Field(default=0, ge=0)
    dietary_non_veg: int = Field(default=0, ge=0)
    dietary_jain: int = Field(default=0, ge=0)
    special_dietary_notes: Optional[str] = None
    
    # Event-type specific fields
    arrival_time: Optional[str] = None
    prasad_count: Optional[int] = 0
    birthday_children_ages: Optional[str] = None
    guest_wishes: Optional[str] = None
    contact_phone_updated: Optional[str] = None

    @model_validator(mode="after")
    def validate_counts(self):
        if self.status == RSVPStatus.DECLINED:
            self.attending_adults = 0
            self.attending_children = 0
            self.dietary_veg = 0
            self.dietary_non_veg = 0
            self.dietary_jain = 0
            return self

        total_attendees = self.attending_adults + self.attending_children
        if self.status == RSVPStatus.CONFIRMED and total_attendees == 0:
            raise ValueError("Confirmed RSVP must have at least 1 attendee (adult or child)")

        total_meals = self.dietary_veg + self.dietary_non_veg + self.dietary_jain
        if total_meals > total_attendees:
            raise ValueError(f"Total meal preferences ({total_meals}) cannot exceed total attending guests ({total_attendees})")

        return self

class RSVPResponseDetail(BaseModel):
    id: str
    assignment_id: str
    event_id: str
    guest_name: str
    family_name: str
    status: RSVPStatus
    attending_adults: int
    attending_children: int
    total_attendees: int
    dietary_veg: int
    dietary_non_veg: int
    dietary_jain: int
    special_dietary_notes: Optional[str] = None
    arrival_time: Optional[str] = None
    prasad_count: Optional[int] = 0
    birthday_children_ages: Optional[str] = None
    guest_wishes: Optional[str] = None
    submitted_at: str
    updated_at: Optional[str] = None

