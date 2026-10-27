from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

class ReminderSchedule(str, Enum):
    DAYS_7_BEFORE = "7_days_before"
    DAYS_3_BEFORE = "3_days_before"
    DAY_1_BEFORE = "1_day_before"
    EVENT_MORNING = "event_morning"
    CUSTOM = "custom"

class ReminderConfigCreate(BaseModel):
    event_id: str
    rsvp_deadline: Optional[str] = None
    active_schedules: List[ReminderSchedule] = [ReminderSchedule.DAYS_7_BEFORE, ReminderSchedule.DAYS_3_BEFORE]
    max_reminders_per_guest: int = Field(default=2, ge=1, le=5)
    custom_message_template: Optional[str] = None
    target_groups: List[str] = ["awaiting", "maybe"]
    auto_send_enabled: bool = False

class ReminderConfigResponse(ReminderConfigCreate):
    id: str
    last_sent_at: Optional[str] = None
    reminders_sent_count: int = 0

