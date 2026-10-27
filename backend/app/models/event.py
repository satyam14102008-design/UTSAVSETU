from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class EventType(str, Enum):
    WEDDING = "wedding"
    ENGAGEMENT = "engagement"
    BIRTHDAY = "birthday"
    POOJA = "pooja"
    ANNIVERSARY = "anniversary"
    HOUSEWARMING = "housewarming"
    BABY_SHOWER = "baby_shower"
    NAMING_CEREMONY = "naming_ceremony"
    OTHER = "other"

class EventCollaborator(BaseModel):
    user_id: str
    email: str
    role: str = "manager"  # owner, admin, manager, checkin_staff, viewer

class RitualItem(BaseModel):
    name: str
    date: str
    time: str
    venue: Optional[str] = None
    description: Optional[str] = None

class EventCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    event_type: EventType
    date: str
    time: Optional[str] = "18:00"
    end_date: Optional[str] = None
    venue_name: str
    venue_address: str
    map_url: Optional[str] = None
    host_names: str
    city: Optional[str] = "Mumbai"
    description: Optional[str] = None
    
    # Event-type specific fields
    primary_person_name: Optional[str] = None      # Birthday person, child, couple
    secondary_person_name: Optional[str] = None    # Groom/Partner
    birthday_age: Optional[int] = None
    anniversary_years: Optional[int] = None
    pooja_name: Optional[str] = None
    muhurat_time: Optional[str] = None
    prasad_offering: Optional[str] = None
    house_name: Optional[str] = None
    
    # Configurations
    target_budget: Optional[float] = 100000.0
    rsvp_deadline: Optional[str] = None
    rituals: Optional[List[RitualItem]] = []
    custom_fields: Optional[Dict[str, Any]] = {}

class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    end_date: Optional[str] = None
    venue_name: Optional[str] = None
    venue_address: Optional[str] = None
    map_url: Optional[str] = None
    host_names: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    primary_person_name: Optional[str] = None
    secondary_person_name: Optional[str] = None
    birthday_age: Optional[int] = None
    anniversary_years: Optional[int] = None
    pooja_name: Optional[str] = None
    muhurat_time: Optional[str] = None
    prasad_offering: Optional[str] = None
    house_name: Optional[str] = None
    target_budget: Optional[float] = None
    rsvp_deadline: Optional[str] = None
    rituals: Optional[List[RitualItem]] = None
    custom_fields: Optional[Dict[str, Any]] = None

class EventResponse(BaseModel):
    id: str
    title: str
    event_type: EventType
    date: str
    time: Optional[str] = None
    end_date: Optional[str] = None
    venue_name: str
    venue_address: str
    map_url: Optional[str] = None
    host_names: str
    city: Optional[str] = None
    description: Optional[str] = None
    primary_person_name: Optional[str] = None
    secondary_person_name: Optional[str] = None
    birthday_age: Optional[int] = None
    anniversary_years: Optional[int] = None
    pooja_name: Optional[str] = None
    muhurat_time: Optional[str] = None
    prasad_offering: Optional[str] = None
    house_name: Optional[str] = None
    target_budget: Optional[float] = 0.0
    rsvp_deadline: Optional[str] = None
    rituals: Optional[List[RitualItem]] = []
    collaborators: Optional[List[EventCollaborator]] = []
    custom_fields: Optional[Dict[str, Any]] = {}
    created_by: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

