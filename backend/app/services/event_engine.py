from typing import Dict, Any, List
from backend.app.models.event import EventType

EVENT_CONFIGS: Dict[str, Dict[str, Any]] = {
    EventType.WEDDING: {
        "name": "Wedding Celebration (विवाह उत्सव)",
        "badge": "Wedding",
        "icon": "heart",
        "description": "Grand multi-function Indian wedding with ceremonies, catering, and guest groups.",
        "theme_color": "#800020",
        "accent_color": "#D4AF37",
        "default_title": "Wedding Celebration of",
        "fields": {
            "primary_person_label": "Bride's Name",
            "secondary_person_label": "Groom's Name",
            "host_names_placeholder": "E.g. Mr. & Mrs. Sharma & Mr. & Mrs. Verma",
            "show_rituals": True,
            "show_age": False,
            "show_years": False,
            "show_muhurat": True,
            "show_prasad": False,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Mehendi Ceremony", "date": "", "time": "16:00", "description": "Henna & folk songs"},
            {"name": "Sangeet & Cocktail", "date": "", "time": "19:30", "description": "Dance, music, dinner"},
            {"name": "Haldi Ceremony", "date": "", "time": "10:00", "description": "Turmeric ritual"},
            {"name": "Baraat & Varmala", "date": "", "time": "18:00", "description": "Groom arrival & garland exchange"},
            {"name": "Pheras / Wedding Rituals", "date": "", "time": "20:00", "description": "Sacred vows & auspicious mantras"},
            {"name": "Reception Dinner", "date": "", "time": "21:30", "description": "Grand royal feast"}
        ],
        "default_budget_categories": [
            {"name": "Venue & Banquets", "allocated_amount": 350000.0, "icon": "building"},
            {"name": "Catering & Royal Feast", "allocated_amount": 400000.0, "icon": "utensils"},
            {"name": "Mandap & Floral Decor", "allocated_amount": 150000.0, "icon": "flower"},
            {"name": "Photography & Cinematic Video", "allocated_amount": 120000.0, "icon": "camera"},
            {"name": "Music, DJ & Entertainment", "allocated_amount": 60000.0, "icon": "music"},
            {"name": "Invitations & WhatsApp Messaging", "allocated_amount": 15000.0, "icon": "mail"},
            {"name": "Gifts, Sweets & Return Favors", "allocated_amount": 80000.0, "icon": "gift"},
            {"name": "Guest Accommodation & Transport", "allocated_amount": 100000.0, "icon": "car"},
            {"name": "Miscellaneous & Emergency Fund", "allocated_amount": 50000.0, "icon": "coins"}
        ],
        "default_checklist": [
            "Finalize wedding venue and mahurat timing",
            "Select and customize royal invitation card",
            "Import guest list and group into Bride/Groom families",
            "Send WhatsApp digital invitations with RSVP tracking",
            "Follow up on awaiting responses 2 weeks before wedding",
            "Coordinate confirmed veg and non-veg counts with caterer",
            "Arrange welcome staff for event-day mobile check-in"
        ],
        "messages": {
            "en": "Together with our families, we joyfully invite you to grace the auspicious wedding ceremony of {primary_person} and {secondary_person}. Your warm presence and heartfelt blessings will make this day truly unforgettable.",
            "hi": "परमपिता परमात्मा की असीम अनुकम्पा से, हमारे परिवार की ओर से {primary_person} एवं {secondary_person} के शुभ विवाह उत्सव में आप सपरिवार सादर आमंत्रित हैं। आपकी गरिमामयी उपस्थिति हमारे आनंद को द्विगुणित करेगी।"
        },
        "dietary_options": ["Vegetarian", "Non-Vegetarian", "Jain", "Pure Satvik"]
    },
    EventType.ENGAGEMENT: {
        "name": "Engagement / Ring Ceremony (सगाई / रोका)",
        "badge": "Engagement",
        "icon": "sparkles",
        "description": "Ring exchange, cocktail celebration, and family bonding.",
        "theme_color": "#831843",
        "accent_color": "#F472B6",
        "default_title": "Ring Ceremony & Engagement of",
        "fields": {
            "primary_person_label": "Bride-to-be Name",
            "secondary_person_label": "Groom-to-be Name",
            "host_names_placeholder": "E.g. Sharma and Gupta Families",
            "show_rituals": True,
            "show_age": False,
            "show_years": False,
            "show_muhurat": False,
            "show_prasad": False,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Welcome Drinks & High Tea", "date": "", "time": "17:00", "description": "Arrival of esteemed guests"},
            {"name": "Ring Exchange Ritual", "date": "", "time": "18:30", "description": "Exchange of auspicious rings"},
            {"name": "Cake Cutting & Toasts", "date": "", "time": "19:30", "description": "Celebratory toast to the couple"},
            {"name": "Dinner & Dancing", "date": "", "time": "20:30", "description": "Gala dinner feast"}
        ],
        "default_budget_categories": [
            {"name": "Venue & Hall", "allocated_amount": 80000.0, "icon": "building"},
            {"name": "Catering & Mocktails", "allocated_amount": 120000.0, "icon": "utensils"},
            {"name": "Floral Stage & Ring Setup", "allocated_amount": 40000.0, "icon": "flower"},
            {"name": "Photography", "allocated_amount": 35000.0, "icon": "camera"},
            {"name": "Invitations & WhatsApp", "allocated_amount": 8000.0, "icon": "mail"},
            {"name": "Return Gifts", "allocated_amount": 25000.0, "icon": "gift"}
        ],
        "default_checklist": [
            "Book engagement hall and sound system",
            "Customize romantic floral invitation card",
            "Send WhatsApp invites with personalized RSVP links",
            "Finalize appetizers and dinner menu with caterer",
            "Set up mobile check-in for welcoming guests"
        ],
        "messages": {
            "en": "We request the honor of your presence to celebrate the Engagement Ceremony of {primary_person} and {secondary_person}. Please join us for an evening of love, laughter, and lifelong promises.",
            "hi": "हमारे प्रिय {primary_person} और {secondary_person} के शुभ सगाई एवं मुद्रिका उत्सव के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। कृपया पधारकर नवयुगल को अपना स्नेहिल आशीर्वाद प्रदान करें।"
        },
        "dietary_options": ["Vegetarian", "Non-Vegetarian", "Jain"]
    },
    EventType.BIRTHDAY: {
        "name": "Birthday Celebration (जन्मदिन उत्सव)",
        "badge": "Birthday",
        "icon": "cake",
        "description": "Fun-filled birthday celebration for kids, teens, or adults with games, cake, and food.",
        "theme_color": "#0284C7",
        "accent_color": "#FBBF24",
        "default_title": "Birthday Bash of",
        "fields": {
            "primary_person_label": "Birthday Boy/Girl Name",
            "secondary_person_label": "Theme / Tagline (Optional)",
            "host_names_placeholder": "E.g. Proud Parents Anita & Vikram Patel",
            "show_rituals": False,
            "show_age": True,
            "show_years": False,
            "show_muhurat": False,
            "show_prasad": False,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Welcome & Fun Games", "date": "", "time": "17:00", "description": "Kids games and entertainment"},
            {"name": "Grand Cake Cutting", "date": "", "time": "18:30", "description": "Birthday song & sparklers"},
            {"name": "Magic Show / DJ Dance", "date": "", "time": "19:00", "description": "Interactive entertainment"},
            {"name": "Dinner & Party Treats", "date": "", "time": "19:45", "description": "Yummy food & desserts"}
        ],
        "default_budget_categories": [
            {"name": "Party Venue / Playzone", "allocated_amount": 25000.0, "icon": "building"},
            {"name": "Food & Snacks", "allocated_amount": 35000.0, "icon": "utensils"},
            {"name": "Custom Themed Cake", "allocated_amount": 5000.0, "icon": "cake"},
            {"name": "Theme Balloon Decor", "allocated_amount": 12000.0, "icon": "sparkles"},
            {"name": "Magician / Emcee / Games", "allocated_amount": 10000.0, "icon": "smile"},
            {"name": "Return Gifts / Party Favors", "allocated_amount": 10000.0, "icon": "gift"},
            {"name": "Photography", "allocated_amount": 8000.0, "icon": "camera"}
        ],
        "default_checklist": [
            "Select party theme (Superhero, Princess, Bollywood, Retro)",
            "Order custom birthday cake with accurate weight",
            "Send digital birthday card on WhatsApp with child/adult count fields",
            "Prepare party favor bags for confirmed kids",
            "Confirm kids snack boxes vs adult dinner portions"
        ],
        "messages": {
            "en": "Hip hip hurray! Our darling {primary_person} is turning {age}! Join us for an afternoon full of games, magic, delicious treats, and joyous celebration.",
            "hi": "हमारे प्रिय {primary_person} के {age}वें जन्मदिन के शुभ अवसर पर ढेर सारी मस्ती, खेलों और स्वादिष्ट दावत के लिए आप सपरिवार सादर आमंत्रित हैं!"
        },
        "dietary_options": ["Vegetarian", "Non-Vegetarian", "Kids Special Menu"]
    },
    EventType.POOJA: {
        "name": "Pooja & Religious Ceremony (पूजा एवं धार्मिक अनुष्ठान)",
        "badge": "Pooja",
        "icon": "flame",
        "description": "Satyanarayan, Havan, Vastu, Ganesh, or Mata Ki Chowki pooja with prasad and satvik prasad meals.",
        "theme_color": "#B45309",
        "accent_color": "#F59E0B",
        "default_title": "Auspicious Pooja Ceremony",
        "fields": {
            "primary_person_label": "Occasion / Pooja Name (e.g. Satyanarayan Katha)",
            "secondary_person_label": "Officiating Panditji / Temple (Optional)",
            "host_names_placeholder": "E.g. The Joshi Family",
            "show_rituals": True,
            "show_age": False,
            "show_years": False,
            "show_muhurat": True,
            "show_prasad": True,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Sankalpa & Ganesh Pooja", "date": "", "time": "09:30", "description": "Beginning rituals & invocation"},
            {"name": "Main Pooja & Havan", "date": "", "time": "10:30", "description": "Sacred fire offering"},
            {"name": "Maha Aarti & Bhajans", "date": "", "time": "12:00", "description": "Devotional hymns and aarti"},
            {"name": "Prasad Distribution & Bhojan", "date": "", "time": "12:45", "description": "Mahaprasad pure satvik meal"}
        ],
        "default_budget_categories": [
            {"name": "Samagri & Panditji Dakshina", "allocated_amount": 20000.0, "icon": "flame"},
            {"name": "Pure Satvik Mahaprasad Bhoj", "allocated_amount": 45000.0, "icon": "utensils"},
            {"name": "Mithai, Dry Fruits & Prasad", "allocated_amount": 15000.0, "icon": "gift"},
            {"name": "Mandir & Floral Decoration", "allocated_amount": 18000.0, "icon": "flower"},
            {"name": "Tents, Chairs & Sound System", "allocated_amount": 15000.0, "icon": "speaker"},
            {"name": "Digital Invites & Reminders", "allocated_amount": 3000.0, "icon": "mail"}
        ],
        "default_checklist": [
            "Confirm auspicious muhurat time with Panditji",
            "Procure pooja samagri checklist",
            "Send traditional saffron digital card with Mahaprasad RSVP",
            "Calculate prasad boxes based on confirmed devotee responses",
            "Arrange clean seating & satvik food preparation"
        ],
        "messages": {
            "en": "You and your family are cordially invited to seek divine blessings at our {pooja_name}. Your presence will bestow grace upon our ceremony. Mahaprasad will follow.",
            "hi": "|| श्री गणेशाय नमः || हमारे निवास पर आयोजित श्री {pooja_name} के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। कृपा पधारकर भगवान का प्रसाद एवं आशीर्वाद ग्रहण करें।"
        },
        "dietary_options": ["Pure Satvik (No Onion/Garlic)", "Jain", "Standard Vegetarian"]
    },
    EventType.ANNIVERSARY: {
        "name": "Wedding Anniversary (विवाह वर्षगाँठ)",
        "badge": "Anniversary",
        "icon": "award",
        "description": "Milestone anniversary celebration (Silver 25th, Golden 50th, or yearly celebration).",
        "theme_color": "#4A044E",
        "accent_color": "#FBBF24",
        "default_title": "Anniversary Celebration of",
        "fields": {
            "primary_person_label": "Wife's Name",
            "secondary_person_label": "Husband's Name",
            "host_names_placeholder": "E.g. Children & Grandchildren",
            "show_rituals": False,
            "show_age": False,
            "show_years": True,
            "show_muhurat": False,
            "show_prasad": False,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Guest Arrival & Welcome", "date": "", "time": "18:30", "description": "Welcome drinks and appetizers"},
            {"name": "Milestone Audio-Visual Tribute", "date": "", "time": "19:45", "description": "Memories across the years"},
            {"name": "Garland & Ring Re-exchange", "date": "", "time": "20:30", "description": "Renewing marital vows"},
            {"name": "Celebration Dinner & Music", "date": "", "time": "21:00", "description": "Gourmet dinner buffet"}
        ],
        "default_budget_categories": [
            {"name": "Venue Banquet", "allocated_amount": 75000.0, "icon": "building"},
            {"name": "Catering Buffet", "allocated_amount": 95000.0, "icon": "utensils"},
            {"name": "Gold / Silver Theme Decor", "allocated_amount": 30000.0, "icon": "sparkles"},
            {"name": "Live Ghazal / Music Band", "allocated_amount": 25000.0, "icon": "music"},
            {"name": "Photo & Video Memory Book", "allocated_amount": 20000.0, "icon": "camera"},
            {"name": "Return Keepsakes", "allocated_amount": 15000.0, "icon": "gift"}
        ],
        "default_checklist": [
            "Compile vintage wedding photographs for tribute video",
            "Create golden/silver themed digital invitation card",
            "Collect attendee RSVP to reserve banquet tables",
            "Coordinate with caterer on specialty desserts"
        ],
        "messages": {
            "en": "Join us as we celebrate {years} years of companionship, love, and laughter of {primary_person} & {secondary_person}. Your presence will add warmth to our joyful celebration.",
            "hi": "हमारे आदरणीय {primary_person} एवं {secondary_person} के दांपत्य जीवन के {years} गौरवमयी वर्ष पूर्ण होने पर आयोजित स्नेह मिलन एवं प्रीतिभोज में आप सपरिवार सादर आमंत्रित हैं।"
        },
        "dietary_options": ["Vegetarian", "Non-Vegetarian", "Jain"]
    },
    EventType.HOUSEWARMING: {
        "name": "Housewarming / Griha Pravesh (गृह प्रवेश)",
        "badge": "Griha Pravesh",
        "icon": "home",
        "description": "Blessing a new home with Vastu Shanti, Havan, and welcoming friends & family.",
        "theme_color": "#14532D",
        "accent_color": "#86EFAC",
        "default_title": "Griha Pravesh & Housewarming of",
        "fields": {
            "primary_person_label": "Homeowner / Family Name",
            "secondary_person_label": "New Home Name (e.g. 'Shree Nivas')",
            "host_names_placeholder": "E.g. Sunita & Rajesh Gupta",
            "show_rituals": True,
            "show_age": False,
            "show_years": False,
            "show_muhurat": True,
            "show_prasad": True,
            "show_house_name": True,
        },
        "default_rituals": [
            {"name": "Dwaar Pooja & Threshold Entry", "date": "", "time": "08:30", "description": "Entering new home with cow/milk ritual"},
            {"name": "Vastu Shanti & Navagraha Havan", "date": "", "time": "09:30", "description": "Sacred fire to purify the new residence"},
            {"name": "Mahaprasad Lunch Feast", "date": "", "time": "12:30", "description": "Traditional feast for loved ones"}
        ],
        "default_budget_categories": [
            {"name": "Panditji & Vastu Samagri", "allocated_amount": 18000.0, "icon": "flame"},
            {"name": "Catering & Traditional Lunch", "allocated_amount": 60000.0, "icon": "utensils"},
            {"name": "Toran, Rangoli & Floral Decor", "allocated_amount": 15000.0, "icon": "flower"},
            {"name": "Housewarming Mementos / Sweets", "allocated_amount": 15000.0, "icon": "gift"},
            {"name": "Digital WhatsApp Invites", "allocated_amount": 3000.0, "icon": "mail"}
        ],
        "default_checklist": [
            "Confirm auspicious Griha Pravesh muhurat time",
            "Include accurate Google Maps venue link in invitation",
            "Send digital invite with Google Map direction & parking info",
            "Track veg and Jain attendance counts for lunch caterer"
        ],
        "messages": {
            "en": "A dream made of love, brick, and dreams has finally come true! Please join us as we step into our new abode '{house_name}' and celebrate our Griha Pravesh ceremony.",
            "hi": "प्रभु कृपा से हमारा नया आशियाना '{house_name}' बनकर तैयार है। गृह प्रवेश एवं वास्तु शांति के पावन अवसर पर आप सपरिवार सादर आमंत्रित हैं। कृपा पधारकर नए घर को अपने शुभाशीर्वाद से अभिसिंचित करें।"
        },
        "dietary_options": ["Pure Vegetarian", "Jain", "Standard Vegetarian"]
    },
    EventType.BABY_SHOWER: {
        "name": "Baby Shower / Godh Bharai (गोद भराई)",
        "badge": "Godh Bharai",
        "icon": "smile",
        "description": "Blessing the expectant mother with traditional rituals, songs, games, and feast.",
        "theme_color": "#701A75",
        "accent_color": "#F472B6",
        "default_title": "Godh Bharai & Baby Shower of",
        "fields": {
            "primary_person_label": "Mother-to-be Name",
            "secondary_person_label": "Father-to-be Name",
            "host_names_placeholder": "E.g. The Agarwal Family",
            "show_rituals": True,
            "show_age": False,
            "show_years": False,
            "show_muhurat": False,
            "show_prasad": False,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Arrival & Welcome Haldi-Kumkum", "date": "", "time": "15:00", "description": "Welcoming women and families"},
            {"name": "Traditional Godh Bharai Ritual", "date": "", "time": "16:00", "description": "Filling the mother's lap with fruits & blessings"},
            {"name": "Baby Trivia & Fun Games", "date": "", "time": "17:15", "description": "Guessing baby gender, fun quizzes"},
            {"name": "High Tea & Dinner", "date": "", "time": "18:30", "description": "Delicious traditional delicacies"}
        ],
        "default_budget_categories": [
            {"name": "Venue / Banquet Room", "allocated_amount": 35000.0, "icon": "building"},
            {"name": "Catering & Snacks", "allocated_amount": 45000.0, "icon": "utensils"},
            {"name": "Pastel Floral & Cradle Decor", "allocated_amount": 20000.0, "icon": "flower"},
            {"name": "Gift Baskets for Guests", "allocated_amount": 15000.0, "icon": "gift"},
            {"name": "Photo Session", "allocated_amount": 12000.0, "icon": "camera"}
        ],
        "default_checklist": [
            "Customize pastel-themed baby shower invitation",
            "Add sweet craving preferences to catering menu",
            "Track attendee count for game kits and seating"
        ],
        "messages": {
            "en": "A little bundle of joy is on the way! Please join us in showering love and blessings upon {primary_person} at her Godh Bharai ceremony.",
            "hi": "हमारे परिवार में नन्हे मेहमान के आगमन की पूर्व संध्या पर श्रीमती {primary_person} के गोद भराई उत्सव में आप सपरिवार सादर आमंत्रित हैं।"
        },
        "dietary_options": ["Vegetarian", "Jain", "Non-Vegetarian"]
    },
    EventType.NAMING_CEREMONY: {
        "name": "Naming Ceremony / Namkaran (नामकरण संस्कार)",
        "badge": "Namkaran",
        "icon": "sparkles",
        "description": "Welcoming the newborn with traditional astrological naming and family feast.",
        "theme_color": "#065F46",
        "accent_color": "#34D399",
        "default_title": "Namkaran Sanskar Ceremony",
        "fields": {
            "primary_person_label": "Baby's Name (if revealed) / Baby Boy/Girl",
            "secondary_person_label": "Parents' Names",
            "host_names_placeholder": "E.g. Grandparents & Parents",
            "show_rituals": True,
            "show_age": False,
            "show_years": False,
            "show_muhurat": True,
            "show_prasad": False,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Ganesh & Kuldevta Pooja", "date": "", "time": "10:00", "description": "Ancestral blessing invocation"},
            {"name": "Whispering Name in Baby's Ear", "date": "", "time": "11:15", "description": "Father/Bua whispering the sacred name"},
            {"name": "Cradle Ceremony (Palna)", "date": "", "time": "12:00", "description": "Placing baby into decorated cradle"},
            {"name": "Celebration Lunch", "date": "", "time": "12:45", "description": "Traditional feast"}
        ],
        "default_budget_categories": [
            {"name": "Pooja & Panditji", "allocated_amount": 10000.0, "icon": "flame"},
            {"name": "Catering Lunch", "allocated_amount": 35000.0, "icon": "utensils"},
            {"name": "Floral Cradle Decoration", "allocated_amount": 12000.0, "icon": "flower"},
            {"name": "Mithai & Return Boxes", "allocated_amount": 10000.0, "icon": "gift"},
            {"name": "Photography", "allocated_amount": 10000.0, "icon": "camera"}
        ],
        "default_checklist": [
            "Confirm Rashi initial letter with Astrologer/Panditji",
            "Design gentle pastel naming ceremony card",
            "Track RSVP counts for catering orders"
        ],
        "messages": {
            "en": "We are overjoyed to introduce our little one to the world! Please bless our baby at the Namkaran Sanskar (Naming Ceremony) followed by lunch.",
            "hi": "ईश्वर की कृपा से हमारे कुलदीपक / लाडली के नामकरण संस्कार के मांगलिक अवसर पर आप सपरिवार सादर आमंत्रित हैं। पधारकर शिशु को अपना स्नेह एवं शुभाशीर्वाद दें।"
        },
        "dietary_options": ["Vegetarian", "Jain", "Non-Vegetarian"]
    },
    EventType.OTHER: {
        "name": "Custom Celebration (अन्य उत्सव / समारोह)",
        "badge": "Celebration",
        "icon": "party-popper",
        "description": "Retirement, Graduation, Community Festival, Reunion, or Corporate milestone.",
        "theme_color": "#1E293B",
        "accent_color": "#38BDF8",
        "default_title": "Grand Celebration",
        "fields": {
            "primary_person_label": "Honoree / Celebration Focus",
            "secondary_person_label": "Occasion / Subtitle",
            "host_names_placeholder": "E.g. Organizing Committee / Hosts",
            "show_rituals": True,
            "show_age": False,
            "show_years": False,
            "show_muhurat": False,
            "show_prasad": False,
            "show_house_name": False,
        },
        "default_rituals": [
            {"name": "Reception & Welcome", "date": "", "time": "18:00", "description": "Registration and networking"},
            {"name": "Main Program / Speeches", "date": "", "time": "19:00", "description": "Keynote and felicitations"},
            {"name": "Dinner & Social Gathering", "date": "", "time": "20:30", "description": "Buffet dinner"}
        ],
        "default_budget_categories": [
            {"name": "Venue Rental", "allocated_amount": 50000.0, "icon": "building"},
            {"name": "Catering & Beverages", "allocated_amount": 70000.0, "icon": "utensils"},
            {"name": "Audio/Visual & Lighting", "allocated_amount": 20000.0, "icon": "speaker"},
            {"name": "Mementos & Gifts", "allocated_amount": 15000.0, "icon": "gift"}
        ],
        "default_checklist": [
            "Configure custom event parameters",
            "Customize invitation styling and RSVP questions",
            "Invite guests and monitor response rates",
            "Coordinate headcounts with vendors"
        ],
        "messages": {
            "en": "You are cordially invited to celebrate this memorable occasion of {primary_person} with us. We look forward to your gracious presence.",
            "hi": "हमारे इस विशिष्ट समारोह में आप सपरिवार सादर आमंत्रित हैं। आपकी उपस्थिति से कार्यक्रम की शोभा में चार चाँद लगेंगे।"
        },
        "dietary_options": ["Vegetarian", "Non-Vegetarian", "Jain"]
    }
}

def get_event_engine_config(event_type: str) -> Dict[str, Any]:
    return EVENT_CONFIGS.get(event_type, EVENT_CONFIGS[EventType.OTHER])

def format_invitation_message(event_type: str, language: str, event_data: Dict[str, Any]) -> str:
    config = get_event_engine_config(event_type)
    templates = config.get("messages", {})
    template = templates.get(language, templates.get("en", ""))
    
    primary = event_data.get("primary_person_name") or "Our Guest of Honor"
    secondary = event_data.get("secondary_person_name") or "Beloved"
    age = str(event_data.get("birthday_age") or "")
    years = str(event_data.get("anniversary_years") or "")
    pooja_name = event_data.get("pooja_name") or "Pooja"
    house_name = event_data.get("house_name") or "New Abode"
    
    formatted = template.replace("{primary_person}", primary)\
                        .replace("{secondary_person}", secondary)\
                        .replace("{age}", age)\
                        .replace("{years}", years)\
                        .replace("{pooja_name}", pooja_name)\
                        .replace("{house_name}", house_name)
    return formatted

