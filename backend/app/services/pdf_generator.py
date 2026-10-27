import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from typing import List, Dict, Any

def generate_guest_rsvp_pdf(event: Dict[str, Any], assignments: List[Dict[str, Any]]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#800020'),
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#555555')
    )
    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#2D2D2D'),
        spaceBefore=12,
        spaceAfter=6
    )

    elements = []

    # Header
    elements.append(Paragraph(f"UtsavSetu — Guest & RSVP Report", subtitle_style))
    elements.append(Paragraph(event.get("title", "Event Guest List"), title_style))
    elements.append(Paragraph(
        f"<b>Date:</b> {event.get('date', '')} {event.get('time', '')} | "
        f"<b>Venue:</b> {event.get('venue_name', '')}, {event.get('venue_address', '')} | "
        f"<b>Hosts:</b> {event.get('host_names', '')}",
        subtitle_style
    ))
    elements.append(Spacer(1, 12))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#D4AF37'), spaceAfter=12))

    # Summary Stats
    total_assigned = len(assignments)
    confirmed_list = [a for a in assignments if a.get("rsvp_status") == "confirmed"]
    declined_list = [a for a in assignments if a.get("rsvp_status") == "declined"]
    awaiting_list = [a for a in assignments if a.get("rsvp_status") in ("awaiting", None)]
    
    total_confirmed_adults = sum(a.get("confirmed_adults", 0) or 0 for a in confirmed_list)
    total_confirmed_children = sum(a.get("confirmed_children", 0) or 0 for a in confirmed_list)
    total_confirmed_guests = total_confirmed_adults + total_confirmed_children

    stat_data = [
        ["Total Invited Families", "Confirmed Guests", "Awaiting Responses", "Declined"],
        [str(total_assigned), f"{total_confirmed_guests} ({total_confirmed_adults}A, {total_confirmed_children}C)", str(len(awaiting_list)), str(len(declined_list))]
    ]
    t_stat = Table(stat_data, colWidths=[130, 150, 130, 110])
    t_stat.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#FAF7F2')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#800020')),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 9),
        ('FONTSIZE', (0,1), (-1,1), 12),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
    ]))
    elements.append(t_stat)
    elements.append(Spacer(1, 16))

    # Guest Table
    elements.append(Paragraph("Guest Roster & Preferences", heading_style))
    table_rows = [["#", "Family / Guest Name", "Phone", "Status", "Attending", "Meal", "Check-in"]]
    for idx, a in enumerate(assignments, 1):
        status_str = (a.get("rsvp_status") or "awaiting").upper()
        adults = a.get("confirmed_adults", 0) or 0
        kids = a.get("confirmed_children", 0) or 0
        attending_str = f"{adults + kids} ({adults}A,{kids}C)" if status_str == "CONFIRMED" else "-"
        
        veg = a.get("dietary_veg", 0) or 0
        nonveg = a.get("dietary_non_veg", 0) or 0
        jain = a.get("dietary_jain", 0) or 0
        meal_parts = []
        if veg: meal_parts.append(f"{veg} Veg")
        if nonveg: meal_parts.append(f"{nonveg} NV")
        if jain: meal_parts.append(f"{jain} Jain")
        meal_str = ", ".join(meal_parts) if meal_parts else "-"
        
        checkin_str = "Checked In" if a.get("is_checked_in") else "Pending"

        table_rows.append([
            str(idx),
            f"{a.get('family_name', '')} ({a.get('primary_name', '')})",
            a.get("phone", ""),
            status_str,
            attending_str,
            meal_str,
            checkin_str
        ])

    col_widths = [25, 165, 85, 65, 65, 65, 55]
    t_guest = Table(table_rows, colWidths=col_widths, repeatRows=1)
    t_guest.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#800020')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('ALIGN', (0,0), (0,-1), 'CENTER'),
        ('ALIGN', (3,0), (6,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_guest)
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

def generate_catering_sheet_pdf(event: Dict[str, Any], food_summary: Dict[str, Any], config: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#800020'),
        fontName='Helvetica-Bold'
    )
    elements = [
        Paragraph("UtsavSetu — Caterer Preparation & Quantity Sheet", styles['Normal']),
        Paragraph(event.get("title", "Event Catering Sheet"), title_style),
        Paragraph(f"<b>Event Date:</b> {event.get('date', '')} | <b>Meal Time:</b> {event.get('time', '')} | <b>Venue:</b> {event.get('venue_name', '')}", styles['Normal']),
        Spacer(1, 10),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor('#D4AF37'), spaceAfter=14),
        Paragraph("<b>Recommended Preparation Quantities (With Buffer Applied)</b>", styles['Heading3']),
        Spacer(1, 6)
    ]

    quantities = [
        ["Food Category", "Confirmed Guests", "Buffer Applied", "Recommended Prep Plates", "Plate Rate"],
        ["Vegetarian (incl. Jain)", str(food_summary.get("confirmed_veg_meals", 0) + food_summary.get("confirmed_jain_meals", 0)), f"{food_summary.get('buffer_percentage_applied', 10)}%", str(food_summary.get("recommended_veg_prep", 0)), f"₹{config.get('price_per_veg', 750)}"],
        ["Non-Vegetarian", str(food_summary.get("confirmed_non_veg_meals", 0)), f"{food_summary.get('buffer_percentage_applied', 10)}%", str(food_summary.get("recommended_non_veg_prep", 0)), f"₹{config.get('price_per_non_veg', 950)}"],
        ["Children's Meals", str(food_summary.get("confirmed_children", 0)), f"{food_summary.get('buffer_percentage_applied', 10)}%", str(food_summary.get("recommended_children_prep", 0)), f"₹{config.get('price_per_child', 400)}"],
        ["TOTAL TARGET PREPARATION", str(food_summary.get("confirmed_total_attendees", 0)), "-", str(food_summary.get("recommended_total_plates", 0)), "-"]
    ]
    t = Table(quantities, colWidths=[150, 95, 85, 115, 80])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#800020')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTNAME', (0,-1), (-1,-1), 'Helvetica-Bold'),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor('#FAF7F2')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#D1D5DB')),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 16))
    
    # Financial note
    elements.append(Paragraph(
        f"<b>Estimated Caterer Budget (Response-Based):</b> ₹{food_summary.get('response_based_estimated_cost', 0):,.2f}<br/>"
        f"<i>Original Invitation-Based Projection: ₹{food_summary.get('original_invite_estimated_cost', 0):,.2f}</i><br/>"
        f"<b>Estimated Potential Difference: ₹{food_summary.get('estimated_potential_saving', 0):,.2f}</b> (Note: subject to fixed charges, buffers, and vendor minimums).",
        styles['Normal']
    ))
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()

