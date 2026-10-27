from pydantic import BaseModel, Field
from typing import Optional, List

class CheckInRequest(BaseModel):
    assignment_id: Optional[str] = None  # None if walk-in
    event_id: str
    guest_name: str = Field(..., min_length=2)
    family_name: Optional[str] = None
    phone: Optional[str] = None
    actual_adults: int = Field(default=1, ge=0)
    actual_children: int = Field(default=0, ge=0)
    is_walk_in: bool = False
    notes: Optional[str] = None
    force_override: bool = False  # To re-confirm or update an existing check-in

class AttendanceRecordResponse(BaseModel):
    id: str
    event_id: str
    assignment_id: Optional[str] = None
    guest_name: str
    family_name: Optional[str] = None
    phone: Optional[str] = None
    actual_adults: int
    actual_children: int
    total_actual_attendees: int
    is_walk_in: bool
    check_in_time: str
    checked_in_by: str
    notes: Optional[str] = None

class AttendanceSummary(BaseModel):
    event_id: str
    total_invited: int
    total_rsvp_confirmed: int
    total_actual_attended: int
    actual_adults: int
    actual_children: int
    walk_in_count: int
    confirmed_not_arrived: int
    attendance_rate_percentage: float

