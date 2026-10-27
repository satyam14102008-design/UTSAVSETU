from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class InvitationStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class GuestContactCreate(BaseModel):
    family_name: str = Field(..., description="E.g. Sharma Family")
    primary_name: str = Field(..., description="E.g. Rajesh Sharma")
    phone: str = Field(..., description="With country code e.g. +919876543210")
    email: Optional[str] = None
    city: Optional[str] = None
    relation_group: Optional[str] = "Family"  # Family, Bride Side, Groom Side, Friends, Colleagues, VIP
    adults_count: int = Field(default=2, ge=1)
    children_count: int = Field(default=0, ge=0)
    notes: Optional[str] = None

class GuestContactUpdate(BaseModel):
    family_name: Optional[str] = None
    primary_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    relation_group: Optional[str] = None
    adults_count: Optional[int] = None
    children_count: Optional[int] = None
    notes: Optional[str] = None

class GuestContactResponse(BaseModel):
    id: str
    family_name: str
    primary_name: str
    phone: str
    email: Optional[str] = None
    city: Optional[str] = None
    relation_group: Optional[str] = "General"
    adults_count: int = 2
    children_count: int = 0
    notes: Optional[str] = None
    created_by: str
    created_at: Optional[str] = None

# Event-specific assignment
class EventGuestAssign(BaseModel):
    guest_id: str
    event_id: str
    invited_adults: int = 2
    invited_children: int = 0
    personal_note: Optional[str] = None

class BulkGuestAssign(BaseModel):
    guest_ids: List[str]
    event_id: str

class EventGuestAssignmentResponse(BaseModel):
    id: str
    guest_id: str
    event_id: str
    family_name: str
    primary_name: str
    phone: str
    invited_adults: int
    invited_children: int
    relation_group: Optional[str] = "Family"
    invitation_status: InvitationStatus = InvitationStatus.DRAFT
    invitation_sent_at: Optional[str] = None
    invitation_delivery_status: Optional[str] = None
    rsvp_token: str
    rsvp_status: Optional[str] = "awaiting"  # awaiting, confirmed, declined, maybe
    confirmed_adults: Optional[int] = None
    confirmed_children: Optional[int] = None
    dietary_veg: Optional[int] = None
    dietary_non_veg: Optional[int] = None
    dietary_jain: Optional[int] = None
    arrival_time: Optional[str] = None
    is_checked_in: bool = False
    checked_in_count: int = 0
    checked_in_at: Optional[str] = None
    created_at: Optional[str] = None

