import urllib.parse
import httpx
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from backend.app.config import settings
from backend.app.models.whatsapp import MessageChannel, MessageTemplateType, WhatsAppMessageLogResponse
from backend.app.database import get_collection

class WhatsAppService:
    @staticmethod
    def clean_phone(phone: str) -> str:
        # Strip all non-digit characters except leading plus
        cleaned = "".join([c for c in phone if c.isdigit() or c == '+'])
        if cleaned.startswith("+"):
            cleaned = cleaned[1:]
        if len(cleaned) == 10:
            cleaned = "91" + cleaned  # Default Indian country code if missing
        return cleaned

    @staticmethod
    def generate_rsvp_url(token: str) -> str:
        return f"{settings.FRONTEND_URL}/rsvp/{token}"

    @staticmethod
    def compose_message(
        template_type: MessageTemplateType,
        guest_name: str,
        event_title: str,
        event_date: str,
        event_time: str,
        venue_name: str,
        venue_address: str,
        rsvp_url: str,
        custom_note: Optional[str] = None
    ) -> str:
        if template_type == MessageTemplateType.INVITATION:
            msg = (
                f"Namaste {guest_name} ji! 🙏✨\n\n"
                f"You and your family are warmly invited to celebrate:\n"
                f"🌟 *{event_title}*\n\n"
                f"📅 *Date:* {event_date}\n"
                f"⏰ *Time:* {event_time}\n"
                f"📍 *Venue:* {venue_name}, {venue_address}\n\n"
                f"To help us make wonderful arrangements and prepare the best feast for you, "
                f"please kindly confirm your attendance and meal preferences here:\n"
                f"👉 {rsvp_url}\n\n"
                f"Warm regards,\n"
                f"The Host Family"
            )
        elif template_type == MessageTemplateType.REMINDER:
            msg = (
                f"Namaste {guest_name} ji! 🙏\n\n"
                f"Gentle reminder regarding *{event_title}* on {event_date}.\n\n"
                f"We are finalizing catering & seating arrangements. If you haven't yet, "
                f"please confirm whether you and your family will be joining us:\n"
                f"👉 {rsvp_url}\n\n"
                f"We look forward to seeing you!"
            )
        elif template_type == MessageTemplateType.THANK_YOU:
            msg = (
                f"Dear {guest_name} ji,\n\n"
                f"Thank you so much for gracing *{event_title}* with your esteemed presence! "
                f"Your warm blessings and joyful company made our celebration complete. ❤️🙏\n\n"
                f"With heartfelt gratitude,\n"
                f"The Host Family"
            )
        elif template_type == MessageTemplateType.VENUE_UPDATE:
            msg = (
                f"Important update regarding *{event_title}*:\n\n"
                f"📍 *Venue:* {venue_name}\n"
                f"📌 *Address:* {venue_address}\n"
                f"⏰ *Time:* {event_time}\n\n"
                f"View your digital invitation & live venue directions here:\n"
                f"👉 {rsvp_url}"
            )
        else:
            msg = f"Namaste {guest_name} ji! Invitation to {event_title}: {rsvp_url}"

        if custom_note:
            msg = f"{msg}\n\n_{custom_note}_"

        return msg

    @classmethod
    async def send_invitation_message(
        cls,
        assignment: Dict[str, Any],
        event: Dict[str, Any],
        template_type: MessageTemplateType = MessageTemplateType.INVITATION,
        custom_note: Optional[str] = None,
        force_demo: bool = False
    ) -> WhatsAppMessageLogResponse:
        phone = assignment.get("phone", "")
        clean_p = cls.clean_phone(phone)
        guest_name = assignment.get("primary_name") or assignment.get("family_name") or "Valued Guest"
        token = assignment.get("rsvp_token", "")
        rsvp_url = cls.generate_rsvp_url(token)
        
        event_title = event.get("title", "Celebration")
        event_date = event.get("date", "")
        event_time = event.get("time", "")
        venue_name = event.get("venue_name", "")
        venue_address = event.get("venue_address", "")
        
        message_text = cls.compose_message(
            template_type=template_type,
            guest_name=guest_name,
            event_title=event_title,
            event_date=event_date,
            event_time=event_time,
            venue_name=venue_name,
            venue_address=venue_address,
            rsvp_url=rsvp_url,
            custom_note=custom_note
        )
        
        wa_url = f"https://wa.me/{clean_p}?text={urllib.parse.quote(message_text)}"

        is_cloud_api_configured = bool(
            settings.WHATSAPP_API_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID
        )

        use_demo = force_demo or not is_cloud_api_configured

        log_id = str(uuid.uuid4())
        now_str = datetime.utcnow().isoformat()

        if not use_demo:
            # Send via official Cloud API
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    api_url = f"https://graph.facebook.com/v20.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
                    headers = {
                        "Authorization": f"Bearer {settings.WHATSAPP_API_TOKEN}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "messaging_product": "whatsapp",
                        "to": clean_p,
                        "type": "text",
                        "text": {"body": message_text}
                    }
                    response = await client.post(api_url, json=payload, headers=headers)
                    resp_json = response.json()
                    
                    if response.status_code in (200, 201):
                        wamid = resp_json.get("messages", [{}])[0].get("id")
                        log_data = {
                            "id": log_id,
                            "event_id": event.get("id"),
                            "assignment_id": assignment.get("id"),
                            "guest_name": guest_name,
                            "phone": phone,
                            "template_type": template_type,
                            "channel": MessageChannel.WHATSAPP_CLOUD_API,
                            "status": "sent",
                            "whatsapp_message_id": wamid,
                            "is_demo": False,
                            "sent_at": now_str,
                            "delivered_at": now_str,
                            "read_at": None,
                            "wa_direct_url": wa_url,
                            "message_text": message_text,
                            "error_message": None
                        }
                    else:
                        error_detail = resp_json.get("error", {}).get("message", "API Error")
                        log_data = {
                            "id": log_id,
                            "event_id": event.get("id"),
                            "assignment_id": assignment.get("id"),
                            "guest_name": guest_name,
                            "phone": phone,
                            "template_type": template_type,
                            "channel": MessageChannel.WHATSAPP_CLOUD_API,
                            "status": "failed",
                            "whatsapp_message_id": None,
                            "is_demo": False,
                            "sent_at": now_str,
                            "wa_direct_url": wa_url,
                            "message_text": message_text,
                            "error_message": error_detail
                        }
            except Exception as e:
                log_data = {
                    "id": log_id,
                    "event_id": event.get("id"),
                    "assignment_id": assignment.get("id"),
                    "guest_name": guest_name,
                    "phone": phone,
                    "template_type": template_type,
                    "channel": MessageChannel.WHATSAPP_CLOUD_API,
                    "status": "failed",
                    "whatsapp_message_id": None,
                    "is_demo": False,
                    "sent_at": now_str,
                    "wa_direct_url": wa_url,
                    "message_text": message_text,
                    "error_message": str(e)
                }
        else:
            # Demo Mode: Simulated delivery with working WhatsApp link & verified demo status
            log_data = {
                "id": log_id,
                "event_id": event.get("id"),
                "assignment_id": assignment.get("id"),
                "guest_name": guest_name,
                "phone": phone,
                "template_type": template_type,
                "channel": MessageChannel.WHATSAPP_DEMO,
                "status": "delivered (demo)",
                "whatsapp_message_id": f"demo_msg_{uuid.uuid4().hex[:8]}",
                "is_demo": True,
                "sent_at": now_str,
                "delivered_at": now_str,
                "read_at": None,
                "wa_direct_url": wa_url,
                "message_text": message_text,
                "error_message": None
            }

        # Save to DB
        logs_col = get_collection("whatsapp_logs")
        logs_col.insert_one(log_data)

        # Update assignment status
        assign_col = get_collection("event_guest_assignments")
        assign_col.update_one(
            {"id": assignment.get("id")},
            {"$set": {
                "invitation_status": "delivered" if use_demo else log_data["status"],
                "invitation_sent_at": now_str,
                "invitation_delivery_status": "Simulated Demo Delivered" if use_demo else log_data["status"]
            }}
        )

        return WhatsAppMessageLogResponse(**log_data)

