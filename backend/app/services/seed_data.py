import uuid
from datetime import datetime
from backend.app.auth import hash_password
from backend.app.database import get_collection
from backend.app.models.event import EventType
from backend.app.services.event_engine import get_event_engine_config

def seed_demo_data():
    users_col = get_collection("users")
    events_col = get_collection("events")
    guests_col = get_collection("guests")
    assignments_col = get_collection("event_guest_assignments")
    designs_col = get_collection("card_designs")
    budget_col = get_collection("budget_categories")
    trans_col = get_collection("budget_transactions")
    food_config_col = get_collection("food_catering_configs")
    attendance_col = get_collection("attendance_records")

    # If demo user exists, do not duplicate
    demo_user = users_col.find_one({"email": "demo@utsavsetu.com"})
    if not demo_user:
        user_id = "user_demo_001"
        demo_user = {
            "id": user_id,
            "name": "Rajesh & Sunita Sharma",
            "email": "demo@utsavsetu.com",
            "hashed_password": hash_password("password123"),
            "phone": "+919876543210",
            "family_name": "Sharma Family",
            "created_at": datetime.utcnow().isoformat()
        }
        users_col.insert_one(demo_user)
    else:
        user_id = demo_user["id"]

    # Check if events exist for this user
    existing_events = list(events_col.find({"created_by": user_id}))
    if len(existing_events) >= 4:
        return {"status": "already_seeded", "message": "Demo data already loaded"}

    # 1. Master Reusable Guest Contacts
    guest_list_seed = [
        {"id": "g_01", "family_name": "Verma Family", "primary_name": "Sunil Verma", "phone": "+919811223344", "email": "sunil.verma@example.com", "city": "Delhi", "relation_group": "Bride Side", "adults_count": 3, "children_count": 1},
        {"id": "g_02", "family_name": "Gupta Family", "primary_name": "Vikram Gupta", "phone": "+919822334455", "email": "vikram.gupta@example.com", "city": "Mumbai", "relation_group": "Groom Side", "adults_count": 2, "children_count": 2},
        {"id": "g_03", "family_name": "Kapoor Family", "primary_name": "Rohan Kapoor", "phone": "+919833445566", "email": "rohan.k@example.com", "city": "Bangalore", "relation_group": "Friends", "adults_count": 2, "children_count": 0},
        {"id": "g_04", "family_name": "Patel Family", "primary_name": "Bhavin Patel", "phone": "+919844556677", "email": "bhavin.p@example.com", "city": "Ahmedabad", "relation_group": "VIP", "adults_count": 4, "children_count": 1},
        {"id": "g_05", "family_name": "Mehta Family", "primary_name": "Sanjay Mehta", "phone": "+919855667788", "email": "sanjay.m@example.com", "city": "Mumbai", "relation_group": "Family", "adults_count": 2, "children_count": 1},
        {"id": "g_06", "family_name": "Singhania Family", "primary_name": "Dev Singhania", "phone": "+919866778899", "email": "dev.s@example.com", "city": "Jaipur", "relation_group": "Colleagues", "adults_count": 2, "children_count": 0},
        {"id": "g_07", "family_name": "Joshi Family", "primary_name": "Manoj Joshi", "phone": "+919877889900", "email": "manoj.j@example.com", "city": "Pune", "relation_group": "Family", "adults_count": 3, "children_count": 0},
        {"id": "g_08", "family_name": "Chopra Family", "primary_name": "Anil Chopra", "phone": "+919888990011", "email": "anil.c@example.com", "city": "Chandigarh", "relation_group": "Bride Side", "adults_count": 2, "children_count": 2},
        {"id": "g_09", "family_name": "Bansal Family", "primary_name": "Gaurav Bansal", "phone": "+919899001122", "email": "gaurav.b@example.com", "city": "Indore", "relation_group": "Friends", "adults_count": 1, "children_count": 0},
        {"id": "g_10", "family_name": "Reddy Family", "primary_name": "Karthik Reddy", "phone": "+919800112233", "email": "karthik.r@example.com", "city": "Hyderabad", "relation_group": "Colleagues", "adults_count": 2, "children_count": 1}
    ]

    for g in guest_list_seed:
        if not guests_col.find_one({"id": g["id"]}):
            g["created_by"] = user_id
            g["created_at"] = datetime.utcnow().isoformat()
            guests_col.insert_one(g)

    # 2. Event A: Wedding Celebration
    wedding_id = "evt_wedding_01"
    if not events_col.find_one({"id": wedding_id}):
        wedding_engine = get_event_engine_config(EventType.WEDDING)
        wedding_event = {
            "id": wedding_id,
            "title": "Grand Wedding Celebration of Rahul & Ananya",
            "event_type": EventType.WEDDING,
            "date": "2026-12-14",
            "time": "18:00",
            "venue_name": "The Taj Palace Banquet",
            "venue_address": "Apollo Bunder, Colaba, Mumbai 400001",
            "map_url": "https://maps.google.com/?q=Taj+Mahal+Palace+Mumbai",
            "host_names": "Shri & Smt. Rajesh Sharma and Shri & Smt. Sunil Verma",
            "city": "Mumbai",
            "description": "Celebrating the union of Rahul Sharma & Ananya Verma across sacred rituals and celebrations.",
            "primary_person_name": "Ananya Verma",
            "secondary_person_name": "Rahul Sharma",
            "target_budget": 1250000.0,
            "rsvp_deadline": "2026-11-30",
            "rituals": wedding_engine["default_rituals"],
            "collaborators": [],
            "created_by": user_id,
            "created_at": datetime.utcnow().isoformat()
        }
        events_col.insert_one(wedding_event)

        # Invitation card design
        designs_col.insert_one({
            "id": "card_wedding_01",
            "event_id": wedding_id,
            "template_id": "royal_maroon_gold",
            "aspect_ratio": "portrait",
            "language": "en",
            "header_text": "|| Shree Ganeshay Namah ||",
            "title": "Wedding Celebration",
            "subtitle": "Together with their families",
            "honoree_text": "Rahul & Ananya",
            "event_date_text": "Sunday, December 14, 2026",
            "event_time_text": "6:00 PM onwards",
            "venue_text": "The Taj Palace Banquet, Colaba",
            "address_text": "Apollo Bunder, Mumbai",
            "invitation_body": "We cordially invite you and your family to grace the auspicious wedding ceremony of Rahul and Ananya. Your presence and blessings will be our greatest gift.",
            "rsvp_note": "Kindly RSVP by November 30 to help us plan seating & meals",
            "host_signature": "With warm compliments from Sharma & Verma Families",
            "contact_phone": "+91 98765 43210",
            "theme_preset": "royal_maroon",
            "background_color": "#800020",
            "accent_color": "#D4AF37",
            "text_color": "#FAF7F2",
            "secondary_text_color": "#EADBC8",
            "font_family": "Cinzel",
            "decorative_border": "ornate_gold",
            "motif_symbol": "ganesha",
            "show_qr_code": True,
            "show_map_link": True
        })

        # Budget Categories & Transactions
        for cat in wedding_engine["default_budget_categories"]:
            cat_id = f"bcat_w_{uuid.uuid4().hex[:6]}"
            budget_col.insert_one({
                "id": cat_id,
                "event_id": wedding_id,
                "name": cat["name"],
                "allocated_amount": cat["allocated_amount"],
                "spent_amount": cat["allocated_amount"] * 0.4,
                "remaining_amount": cat["allocated_amount"] * 0.6,
                "icon": cat["icon"]
            })
            trans_col.insert_one({
                "id": f"tx_{uuid.uuid4().hex[:6]}",
                "event_id": wedding_id,
                "category_id": cat_id,
                "category_name": cat["name"],
                "title": f"Advance Deposit for {cat['name']}",
                "amount": cat["allocated_amount"] * 0.4,
                "vendor_name": "Royal Celebrations Services",
                "status": "paid",
                "paid_date": "2026-10-15"
            })

        # Food config
        food_config_col.insert_one({
            "event_id": wedding_id,
            "price_per_veg": 850.0,
            "price_per_non_veg": 1100.0,
            "price_per_child": 450.0,
            "buffer_percentage": 10.0,
            "catering_minimum_guarantee": 150,
            "fixed_service_fee": 25000.0,
            "cake_cost_estimate": 10000.0,
            "actual_catering_cost": 0.0
        })

        # Guest assignments with realistic RSVPs
        assignments_col.insert_one({
            "id": "asgn_w_01", "guest_id": "g_01", "event_id": wedding_id,
            "family_name": "Verma Family", "primary_name": "Sunil Verma", "phone": "+919811223344",
            "invited_adults": 3, "invited_children": 1, "relation_group": "Bride Side",
            "invitation_status": "delivered", "rsvp_token": "token_verma_wedding_2026",
            "rsvp_status": "confirmed", "confirmed_adults": 3, "confirmed_children": 1,
            "dietary_veg": 3, "dietary_non_veg": 1, "dietary_jain": 0, "arrival_time": "18:00",
            "is_checked_in": True, "checked_in_count": 4, "checked_in_at": "2026-12-14T18:15:00"
        })
        assignments_col.insert_one({
            "id": "asgn_w_02", "guest_id": "g_02", "event_id": wedding_id,
            "family_name": "Gupta Family", "primary_name": "Vikram Gupta", "phone": "+919822334455",
            "invited_adults": 2, "invited_children": 2, "relation_group": "Groom Side",
            "invitation_status": "delivered", "rsvp_token": "token_gupta_wedding_2026",
            "rsvp_status": "confirmed", "confirmed_adults": 2, "confirmed_children": 2,
            "dietary_veg": 4, "dietary_non_veg": 0, "dietary_jain": 0, "arrival_time": "18:30",
            "is_checked_in": True, "checked_in_count": 4, "checked_in_at": "2026-12-14T18:40:00"
        })
        assignments_col.insert_one({
            "id": "asgn_w_03", "guest_id": "g_03", "event_id": wedding_id,
            "family_name": "Kapoor Family", "primary_name": "Rohan Kapoor", "phone": "+919833445566",
            "invited_adults": 2, "invited_children": 0, "relation_group": "Friends",
            "invitation_status": "delivered", "rsvp_token": "token_kapoor_wedding_2026",
            "rsvp_status": "confirmed", "confirmed_adults": 2, "confirmed_children": 0,
            "dietary_veg": 1, "dietary_non_veg": 1, "dietary_jain": 0, "arrival_time": "19:00",
            "is_checked_in": False, "checked_in_count": 0
        })
        assignments_col.insert_one({
            "id": "asgn_w_04", "guest_id": "g_04", "event_id": wedding_id,
            "family_name": "Patel Family", "primary_name": "Bhavin Patel", "phone": "+919844556677",
            "invited_adults": 4, "invited_children": 1, "relation_group": "VIP",
            "invitation_status": "delivered", "rsvp_token": "token_patel_wedding_2026",
            "rsvp_status": "confirmed", "confirmed_adults": 4, "confirmed_children": 1,
            "dietary_veg": 0, "dietary_non_veg": 0, "dietary_jain": 5, "arrival_time": "17:45",
            "is_checked_in": False, "checked_in_count": 0
        })
        assignments_col.insert_one({
            "id": "asgn_w_05", "guest_id": "g_05", "event_id": wedding_id,
            "family_name": "Mehta Family", "primary_name": "Sanjay Mehta", "phone": "+919855667788",
            "invited_adults": 2, "invited_children": 1, "relation_group": "Family",
            "invitation_status": "sent", "rsvp_token": "token_mehta_wedding_2026",
            "rsvp_status": "awaiting", "confirmed_adults": 0, "confirmed_children": 0,
            "is_checked_in": False, "checked_in_count": 0
        })
        assignments_col.insert_one({
            "id": "asgn_w_06", "guest_id": "g_06", "event_id": wedding_id,
            "family_name": "Singhania Family", "primary_name": "Dev Singhania", "phone": "+919866778899",
            "invited_adults": 2, "invited_children": 0, "relation_group": "Colleagues",
            "invitation_status": "delivered", "rsvp_token": "token_singhania_wedding_2026",
            "rsvp_status": "declined", "confirmed_adults": 0, "confirmed_children": 0,
            "is_checked_in": False, "checked_in_count": 0
        })

    # 3. Event B: Birthday Party
    birthday_id = "evt_birthday_02"
    if not events_col.find_one({"id": birthday_id}):
        bday_engine = get_event_engine_config(EventType.BIRTHDAY)
        events_col.insert_one({
            "id": birthday_id,
            "title": "Aarav's 5th Superhero Birthday Bash",
            "event_type": EventType.BIRTHDAY,
            "date": "2026-11-20",
            "time": "16:30",
            "venue_name": "Funky Monkey Kidzone",
            "venue_address": "Phoenix Marketcity, Kurla, Mumbai",
            "host_names": "Vikram & Anita Patel",
            "city": "Mumbai",
            "description": "Join us for an exciting afternoon of games, superhero cape party, cake cutting, and snacks!",
            "primary_person_name": "Aarav Patel",
            "secondary_person_name": "Avengers Theme",
            "birthday_age": 5,
            "target_budget": 85000.0,
            "rsvp_deadline": "2026-11-12",
            "rituals": bday_engine["default_rituals"],
            "created_by": user_id,
            "created_at": datetime.utcnow().isoformat()
        })
        designs_col.insert_one({
            "id": "card_bday_02",
            "event_id": birthday_id,
            "template_id": "kids_cartoon",
            "aspect_ratio": "portrait",
            "language": "en",
            "header_text": "⭐ IT'S PARTY TIME! ⭐",
            "title": "Aarav is Turning 5!",
            "subtitle": "Join the Superhero League",
            "honoree_text": "Aarav Patel",
            "event_date_text": "Friday, November 20, 2026",
            "event_time_text": "4:30 PM to 8:30 PM",
            "venue_text": "Funky Monkey Kidzone",
            "address_text": "Phoenix Marketcity, Mumbai",
            "invitation_body": "Calling all little superheroes! Put on your favorite costume and fly over for a day of fun, games, yummy snacks, and birthday cake!",
            "rsvp_note": "Please RSVP with number of kids & adults for playzone entry passes",
            "host_signature": "Patel Family",
            "contact_phone": "+91 98445 56677",
            "theme_preset": "neon_celebration",
            "background_color": "#0284C7",
            "accent_color": "#FBBF24",
            "text_color": "#FFFFFF",
            "secondary_text_color": "#E0F2FE",
            "font_family": "Plus Jakarta Sans",
            "decorative_border": "modern_thin",
            "motif_symbol": "birthday_cake",
            "show_qr_code": True,
            "show_map_link": True
        })
        food_config_col.insert_one({
            "event_id": birthday_id,
            "price_per_veg": 450.0,
            "price_per_non_veg": 550.0,
            "price_per_child": 350.0,
            "buffer_percentage": 10.0,
            "catering_minimum_guarantee": 30,
            "fixed_service_fee": 5000.0,
            "cake_cost_estimate": 4500.0
        })
        # Seed birthday guest assignments
        assignments_col.insert_one({
            "id": "asgn_b_01", "guest_id": "g_02", "event_id": birthday_id,
            "family_name": "Gupta Family", "primary_name": "Vikram Gupta", "phone": "+919822334455",
            "invited_adults": 2, "invited_children": 2, "relation_group": "Friends",
            "invitation_status": "delivered", "rsvp_token": "token_gupta_bday_2026",
            "rsvp_status": "confirmed", "confirmed_adults": 2, "confirmed_children": 2,
            "dietary_veg": 4, "dietary_non_veg": 0, "dietary_jain": 0,
            "birthday_children_ages": "Ages 4 and 6", "arrival_time": "16:30",
            "is_checked_in": True, "checked_in_count": 4, "checked_in_at": "2026-11-20T16:35:00"
        })
        assignments_col.insert_one({
            "id": "asgn_b_02", "guest_id": "g_05", "event_id": birthday_id,
            "family_name": "Mehta Family", "primary_name": "Sanjay Mehta", "phone": "+919855667788",
            "invited_adults": 2, "invited_children": 1, "relation_group": "Family",
            "invitation_status": "delivered", "rsvp_token": "token_mehta_bday_2026",
            "rsvp_status": "confirmed", "confirmed_adults": 2, "confirmed_children": 1,
            "dietary_veg": 3, "dietary_non_veg": 0, "dietary_jain": 0,
            "birthday_children_ages": "Age 5", "arrival_time": "17:00",
            "is_checked_in": False, "checked_in_count": 0
        })

    # 4. Event C: Pooja / Religious Ceremony
    pooja_id = "evt_pooja_03"
    if not events_col.find_one({"id": pooja_id}):
        pooja_engine = get_event_engine_config(EventType.POOJA)
        events_col.insert_one({
            "id": pooja_id,
            "title": "Shri Satyanarayan Katha & Maha Havan",
            "event_type": EventType.POOJA,
            "date": "2026-11-05",
            "time": "09:30",
            "venue_name": "Sharma Nivas",
            "venue_address": "Plot 42, Shanti Vihar, Baner, Pune",
            "host_names": "Manoj & Radhika Joshi",
            "city": "Pune",
            "description": "Seeking Lord Satyanarayan's divine blessings for family health, peace, and prosperity.",
            "primary_person_name": "Satyanarayan Katha",
            "secondary_person_name": "Pandit Vidyadhar Shastri",
            "pooja_name": "Shri Satyanarayan Bhagwan Vrat Katha",
            "muhurat_time": "Auspicious Muhurat: 10:15 AM to 11:45 AM",
            "prasad_offering": "Panchamrit, Sheera / Panjiri Prasad & Fresh Fruits",
            "target_budget": 65000.0,
            "rsvp_deadline": "2026-11-01",
            "rituals": pooja_engine["default_rituals"],
            "created_by": user_id,
            "created_at": datetime.utcnow().isoformat()
        })
        designs_col.insert_one({
            "id": "card_pooja_03",
            "event_id": pooja_id,
            "template_id": "traditional_saffron",
            "aspect_ratio": "portrait",
            "language": "hi",
            "header_text": "|| ॐ नमो भगवते वासुदेवाय नमः ||",
            "title": "श्री सत्यनारायण कथा एवं महाहवन",
            "subtitle": "सपरिवार सादर आमंत्रण",
            "honoree_text": "श्री सत्यनारायण भगवान व्रत कथा",
            "event_date_text": "गुरुवार, 5 नवम्बर 2026",
            "event_time_text": "प्रातः 9:30 बजे से",
            "venue_text": "जोशी निवास, पुणे",
            "address_text": "प्लॉट 42, शांति विहार, बानेर, पुणे",
            "invitation_body": "परमपिता परमात्मा के आशीर्वाद से हमारे निवास पर श्री सत्यनारायण भगवान की पावन कथा एवं महाहवन का आयोजन किया गया है। आप सपरिवार पधारकर महाप्रसाद ग्रहण करें।",
            "rsvp_note": "कृपया महाप्रसाद व्यवस्था हेतु अपनी उपस्थिति सुनिश्चित करें",
            "host_signature": "विनीत: मनोज एवं राधिका जोशी",
            "contact_phone": "+91 98778 89900",
            "theme_preset": "divine_saffron",
            "background_color": "#B45309",
            "accent_color": "#F59E0B",
            "text_color": "#FFFBEB",
            "secondary_text_color": "#FEF3C7",
            "font_family": "Rozha One",
            "decorative_border": "ornate_gold",
            "motif_symbol": "om",
            "show_qr_code": True,
            "show_map_link": True
        })
        food_config_col.insert_one({
            "event_id": pooja_id,
            "price_per_veg": 350.0,
            "price_per_non_veg": 0.0,
            "price_per_child": 200.0,
            "buffer_percentage": 10.0,
            "catering_minimum_guarantee": 50,
            "fixed_service_fee": 3000.0,
            "prasad_cost_estimate": 8000.0
        })
        assignments_col.insert_one({
            "id": "asgn_p_01", "guest_id": "g_07", "event_id": pooja_id,
            "family_name": "Joshi Family", "primary_name": "Manoj Joshi", "phone": "+919877889900",
            "invited_adults": 3, "invited_children": 0, "relation_group": "Family",
            "invitation_status": "delivered", "rsvp_token": "token_joshi_pooja_2026",
            "rsvp_status": "confirmed", "confirmed_adults": 3, "confirmed_children": 0,
            "dietary_veg": 3, "prasad_count": 3, "arrival_time": "09:30",
            "is_checked_in": True, "checked_in_count": 3, "checked_in_at": "2026-11-05T09:20:00"
        })

    # 5. Event D: Engagement / Ring Ceremony
    eng_id = "evt_engagement_04"
    if not events_col.find_one({"id": eng_id}):
        eng_engine = get_event_engine_config(EventType.ENGAGEMENT)
        events_col.insert_one({
            "id": eng_id,
            "title": "Rohan & Simran's Ring Ceremony",
            "event_type": EventType.ENGAGEMENT,
            "date": "2026-11-28",
            "time": "17:30",
            "venue_name": "The Grand Hyatt Ballroom",
            "venue_address": "Bambolim, Goa 403201",
            "host_names": "Kapoor & Malhotra Families",
            "city": "Goa",
            "description": "Celebrating the beginning of a lifetime journey as Rohan & Simran exchange rings.",
            "primary_person_name": "Simran Malhotra",
            "secondary_person_name": "Rohan Kapoor",
            "target_budget": 350000.0,
            "rsvp_deadline": "2026-11-15",
            "rituals": eng_engine["default_rituals"],
            "created_by": user_id,
            "created_at": datetime.utcnow().isoformat()
        })
        designs_col.insert_one({
            "id": "card_eng_04",
            "event_id": eng_id,
            "template_id": "romantic_floral",
            "aspect_ratio": "portrait",
            "language": "en",
            "header_text": "💍 WITH LOVE & BLESSINGS 💍",
            "title": "Ring Ceremony",
            "subtitle": "Two hearts, one journey",
            "honoree_text": "Rohan & Simran",
            "event_date_text": "Saturday, November 28, 2026",
            "event_time_text": "5:30 PM onwards",
            "venue_text": "Grand Hyatt Ballroom",
            "address_text": "Bambolim, Goa",
            "invitation_body": "We request the pleasure of your company as we celebrate the engagement and ring exchange ceremony of our beloved Rohan and Simran.",
            "rsvp_note": "Kindly RSVP by November 15",
            "host_signature": "Kapoor & Malhotra Families",
            "contact_phone": "+91 98334 45566",
            "theme_preset": "pastel_floral",
            "background_color": "#831843",
            "accent_color": "#F472B6",
            "text_color": "#FFF1F2",
            "secondary_text_color": "#FCE7F3",
            "font_family": "Playfair Display",
            "decorative_border": "floral_wreath",
            "motif_symbol": "rings",
            "show_qr_code": True,
            "show_map_link": True
        })
        food_config_col.insert_one({
            "event_id": eng_id,
            "price_per_veg": 750.0,
            "price_per_non_veg": 950.0,
            "price_per_child": 400.0,
            "buffer_percentage": 10.0,
            "catering_minimum_guarantee": 80,
            "fixed_service_fee": 15000.0
        })

    return {"status": "success", "message": "Demo data successfully seeded for 4 Indian events"}
