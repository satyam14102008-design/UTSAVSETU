from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends, Request, Response, Query
from backend.app.models.whatsapp import (
    SendMessageRequest, BulkSendMessageRequest, WhatsAppMessageLogResponse, MessageTemplateType
)
from backend.app.auth import get_current_user, check_event_permission
from backend.app.config import settings
from backend.app.database import get_collection
from backend.app.services.whatsapp_service import WhatsAppService

router = APIRouter(prefix="/whatsapp", tags=["WhatsApp Communication & Webhooks"])

@router.get("/status")
def get_whatsapp_integration_status():
    """Returns current WhatsApp configuration status and demo mode indicator."""
    is_configured = bool(settings.WHATSAPP_API_TOKEN and settings.WHATSAPP_PHONE_NUMBER_ID)
    return {
        "is_cloud_api_configured": is_configured,
        "mode": "official_cloud_api" if is_configured else "interactive_demo_mode",
        "phone_number_id": settings.WHATSAPP_PHONE_NUMBER_ID[:6] + "..." if settings.WHATSAPP_PHONE_NUMBER_ID else None,
        "features_available": [
            "Interactive WhatsApp Web links (wa.me)",
            "Personalized RSVP URL generation",
            "Simulated delivery and read status tracking",
            "Copyable multi-lingual invitation templates",
            "Official Cloud API webhook support"
        ],
        "setup_guide": (
            "To enable live Meta WhatsApp Cloud API messaging, provide WHATSAPP_API_TOKEN, "
            "WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_BUSINESS_ACCOUNT_ID in environment variables."
        )
    }

@router.post("/send-single", response_model=WhatsAppMessageLogResponse)
async def send_single_message(
    req: SendMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    event = check_event_permission(req.event_id, current_user, required_roles=["owner", "admin", "manager"])
    assign_col = get_collection("event_guest_assignments")

    assignment = assign_col.find_one({"id": req.assignment_id, "event_id": req.event_id})
    if not assignment:
        raise HTTPException(status_code=404, detail="Guest assignment record not found")

    result = await WhatsAppService.send_invitation_message(
        assignment=assignment,
        event=event,
        template_type=req.template_type,
        custom_note=req.custom_message,
        force_demo=req.force_demo_mode
    )
    return result

@router.post("/send-bulk")
async def send_bulk_messages(
    req: BulkSendMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    event = check_event_permission(req.event_id, current_user, required_roles=["owner", "admin", "manager"])
    assign_col = get_collection("event_guest_assignments")

    results = []
    for aid in req.assignment_ids:
        assignment = assign_col.find_one({"id": aid, "event_id": req.event_id})
        if not assignment:
            continue
        res = await WhatsAppService.send_invitation_message(
            assignment=assignment,
            event=event,
            template_type=req.template_type,
            custom_note=req.custom_message,
            force_demo=req.force_demo_mode
        )
        results.append(res)

    return {
        "status": "success",
        "total_dispatched": len(results),
        "messages": results
    }

@router.get("/events/{event_id}/logs", response_model=List[WhatsAppMessageLogResponse])
def get_event_whatsapp_logs(event_id: str, current_user: dict = Depends(get_current_user)):
    check_event_permission(event_id, current_user)
    logs_col = get_collection("whatsapp_logs")
    logs = logs_col.find({"event_id": event_id})
    return [WhatsAppMessageLogResponse(**l) for l in logs]

# ----------------- OFFICIAL WHATSAPP WEBHOOKS ----------------- #

@router.get("/webhook")
def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """Official Meta WhatsApp Cloud API Webhook Verification."""
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_WEBHOOK_VERIFY_TOKEN:
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Webhook verification token mismatch")

@router.post("/webhook")
async def receive_whatsapp_webhook(request: Request):
    """Processes incoming status updates (sent, delivered, read, failed) from Meta WhatsApp Cloud API."""
    data = await request.json()
    logs_col = get_collection("whatsapp_logs")
    assign_col = get_collection("event_guest_assignments")

    try:
        entries = data.get("entry", [])
        for entry in entries:
            for change in entry.get("changes", []):
                value = change.get("value", {})
                statuses = value.get("statuses", [])
                for s in statuses:
                    wamid = s.get("id")
                    status_name = s.get("status")
                    timestamp = s.get("timestamp")
                    
                    if wamid and status_name:
                        # Update log
                        logs_col.update_one(
                            {"whatsapp_message_id": wamid},
                            {"$set": {"status": status_name}}
                        )
                        log_entry = logs_col.find_one({"whatsapp_message_id": wamid})
                        if log_entry and log_entry.get("assignment_id"):
                            assign_col.update_one(
                                {"id": log_entry["assignment_id"]},
                                {"$set": {"invitation_status": status_name}}
                            )
    except Exception as e:
        return {"status": "error", "message": str(e)}

    return {"status": "received"}

