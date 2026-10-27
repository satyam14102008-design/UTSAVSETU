from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum

class MessageChannel(str, Enum):
    WHATSAPP_CLOUD_API = "whatsapp_cloud_api"
    WHATSAPP_DEMO = "whatsapp_demo"
    DIRECT_LINK = "direct_link"

class MessageTemplateType(str, Enum):
    INVITATION = "invitation"
    REMINDER = "reminder"
    THANK_YOU = "thank_you"
    VENUE_UPDATE = "venue_update"

class SendMessageRequest(BaseModel):
    assignment_id: str
    event_id: str
    template_type: MessageTemplateType = MessageTemplateType.INVITATION
    custom_message: Optional[str] = None
    force_demo_mode: bool = False

class BulkSendMessageRequest(BaseModel):
    event_id: str
    assignment_ids: List[str]
    template_type: MessageTemplateType = MessageTemplateType.INVITATION
    custom_message: Optional[str] = None
    force_demo_mode: bool = False

class WhatsAppMessageLogResponse(BaseModel):
    id: str
    event_id: str
    assignment_id: str
    guest_name: str
    phone: str
    template_type: MessageTemplateType
    channel: MessageChannel
    status: str # queued, sent, delivered, read, failed
    whatsapp_message_id: Optional[str] = None
    is_demo: bool = True
    sent_at: str
    delivered_at: Optional[str] = None
    read_at: Optional[str] = None
    wa_direct_url: Optional[str] = None
    message_text: str
    error_message: Optional[str] = None

