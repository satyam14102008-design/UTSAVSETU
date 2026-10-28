# ॐ UtsavSetu (उत्सवसेतु)
### AI-Powered Indian Event, Invitation, Guest & Budget Management Platform

> **"One Platform. Every Celebration."**
> A production-minded full-stack web application designed for Indian families and event planners to eliminate food waste, reduce financial overspending, simplify guest coordination, and create personalized invitation cards across all types of celebrations.

---

## 🌟 The Core Problem We Solve

Indian celebrations—weddings, engagements, birthdays, poojas, griha pravesh, anniversaries, naming ceremonies—are joyous, large-scale community events. However, organizers face severe operational challenges:

1. **Massive Food Waste & Financial Overspending**: When an organizer invites 400 guests, caterers often prepare for 400 meals. If only 270 arrive, the family loses tens of thousands of rupees on wasted food and surplus plates.
2. **Scattered Coordination**: RSVPs, arrival times, dietary restrictions, and gift notes are scattered across WhatsApp messages, phone calls, spreadsheets, and paper notebooks.
3. **Multi-Ceremony Confusion**: A single wedding can involve Haldi, Mehendi, Sangeet, Shaadi, and Reception—each with different guest subsets, dress codes, and headcounts.
4. **Disjointed Invitation Workflows**: Designing cards requires graphic designers; distributing them requires manual WhatsApp messaging; tracking responses requires manual tallying.

**UtsavSetu brings the entire lifecycle into a unified, event-aware operating system.**

---

## 🚀 Key Features & Capabilities

### 1. Event-Aware Experience Engine
UtsavSetu is **not a wedding-only platform**. A dynamic registry engine adapts the UI, dashboard metrics, invitation cards, RSVP questions, checklists, and food formulas based on the celebration type:
- **Wedding (विवाह उत्सव)**: Couple details, multi-ritual schedules, veg/non-veg/jain dietary tracking, family guest groups, caterer buffer management.
- **Birthday (जन्मदिन)**: Age milestones, cake cutting time, children vs. adult counters, party checklist, budget tracker.
- **Pooja / Religious Ceremony (पूजा / धार्मिक अनुष्ठान)**: Devotional themes, host family details, muhurat timing, prasad and satvik meal quantity planning.
- **Engagement / Ring Ceremony (सगाई / रोका)**: Couple names, auspicious ceremony time, ring ceremony card themes, meal counts.
- **Housewarming / Griha Pravesh (गृह प्रवेश)**: New home address with Google Maps integration, Vastu pooja timing, feast RSVP.
- **Anniversary (वैवाहिक वर्षगांठ)**: Milestone years, elegant gold/champagne themes, reception guest lists.
- **Baby Shower / Godh Bharai (गोद भराई)**: Parents-to-be, blessing ceremony schedule, high-tea/lunch headcounts.
- **Naming Ceremony / Namkaran (नामकरण संस्कार)**: Baby name announcement, family lineage, traditional invitation templates.
- **Custom Celebrations (अन्य उत्सव)**: Retirements, community gatherings, cultural festivals with configurable fields.

### 2. Live Invitation Card Studio
Create and customize Indian invitation cards without third-party design tools:
- **Live Visual Canvas**: Instant real-time updates as fields change.
- **Auspicious Motifs**: Traditional Indian symbols including Ganesha (ॐ), Kalash, Diya, Floral Garland, and Peacock Feather.
- **Ornate Border Styles**: Double gold borders, royal Mughal arches, festive marigold trims, and minimalist frames.
- **Dual-Language Wording Generator**: 1-click automatic Hindi and English invitation wording tailored to the specific celebration type.
- **QR Code Integration**: Automatically generates scannable QR codes linking directly to the guest's personalized RSVP portal.
- **Aspect Ratio Switching**: Portrait (9:16 mobile WhatsApp status), Square (1:1 feed post), and Landscape formats.

### 3. WhatsApp Invitation & RSVP Workflow
- **Interactive Demo Mode (Zero Credentials Required)**: Generates direct `https://wa.me/?text=...` links pre-filled with the guest's name, personalized message, and unique RSVP token URL. Organizers can test the end-to-end flow with a single click.
- **Meta WhatsApp Cloud API Adapter**: Production-ready service supporting official template broadcasts, delivery status webhooks (`sent`, `delivered`, `read`), and tokenized RSVP links.
- **Audit Logs**: Full audit trail recording timestamps, recipient numbers, delivery states, and error reasons.

### 4. Public Guest RSVP Portal (`/rsvp/:token`)
- Mobile-optimized, public-facing portal for invited guests.
- Live card preview with event date, venue, and map directions.
- Single-click confirmation (**Attending**, **Declined**, **Tentative**).
- Dynamic family headcount selector (Adults, Children).
- Precise dietary breakdown (**Pure Vegetarian**, **Non-Vegetarian**, **Jain / No Onion-Garlic**).
- Personal blessing or message submission to the host family.
- Festive celebratory confetti upon submission.

### 5. Smart Food & Catering Calculator (Section 8)
Transparent mathematical formulas to prevent food wastage:
$$\text{Expected Attendance} = \text{Confirmed} + (0.35 \times \text{Tentative}) + \text{Walk-in Reserve}$$
$$\text{Recommended Food Quantity} = \max(\lceil\text{Expected} \times (1 + \text{Buffer } \%)\rceil, \text{Caterer Min Guarantee})$$
$$\text{Estimated Food Cost} = \text{Recommended Plates} \times \text{Cost per Plate}$$
$$\text{Estimated Financial Waste Prevented} = \max(0, (\text{Invited Headcount} - \text{Recommended Plates}) \times \text{Cost per Plate})$$
- Configurable safety buffer slider (5% to 25%).
- Clear disclaimer: *Estimates are directional planning recommendations, not guaranteed savings.*

### 6. Event-Day Mobile Check-in
- Real-time guest roster search by name, phone, or family name.
- Single-tap check-in recording actual headcounts.
- **Duplicate Check-in Warning**: Detects if a guest or family has already checked in and displays a confirmation dialog before allowing an override.
- **Walk-in Guest Registration**: Fast registration modal for uninvited or additional guests with immediate dietary assignment.
- Real-time attendance vs. RSVP comparison metrics.

### 7. Reports & PDF Export
- **Printable Catering Preparation Order Sheet**: PDF generated via Python ReportLab detailing exact plate counts, dietary breakdown (Veg, Non-Veg, Jain), serving schedules, and caterer sign-off boxes.
- **Guest Attendance Roster PDF**: Formatted guest list with contact details, family headcount, and check-in status.
- **CSV Data Exports**: Downloadable spreadsheet data for guests and financial transactions.

---

## 🏗️ Architecture & Technology Stack

```
UTSAVSETU ARCHITECTURE
├── backend/                  FastAPI (Python 3.10+)
│   ├── app/
│   │   ├── config.py         Pydantic settings with environment variable validation
│   │   ├── database.py       Dual-mode store: Real MongoDB with auto JSON fallback
│   │   ├── auth.py           JWT access tokens + Passlib bcrypt password hashing
│   │   ├── models/           Pydantic schemas (User, Event, Guest, RSVP, Budget, Attendance)
│   │   ├── services/         Event Engine, Food Calculator, WhatsApp Service, PDF Generator, Seed Data
│   │   └── routers/          10 RESTful routers mounted under /api/v1
│   ├── tests/                Pytest suite covering all core business logic
│   └── run.py                Development server launcher with seed data initialization
└── frontend/                 React 18 + TypeScript + Vite + Tailwind CSS
    ├── src/
    │   ├── components/       CardPreview, EventTypeBadge, Navbar, Sidebar, QRModal
    │   ├── context/          AuthContext, EventContext (multi-event switcher), ToastContext
    │   ├── pages/            16 responsive, festive pages
    │   └── services/         Axios API client with JWT interceptors
    └── tailwind.config.js    Indian festive palette: Royal Maroon, Warm Gold, Ivory, Terracotta
```

### Color Palette & Aesthetic Design
- **Royal Maroon (`#800020`)**: Traditional celebration dignity.
- **Warm Gold (`#D4AF37`)**: Auspicious ceremonial accent.
- **Ivory Silk (`#FAF7F2`)**: Clean, distraction-free backdrop.
- **Deep Charcoal (`#2D2D2D`)**: High-contrast typography.
- **Festive Accents**: Emerald Green (confirmed), Saffron (pending), Ruby Red (declined).

---

## ⚡ Quick Start Guide

### Prerequisites
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **MongoDB**: Optional (If MongoDB is not running locally, UtsavSetu automatically initializes its built-in JSON file store under `backend/.data/`)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/utsavsetu.git
cd utsavsetu
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server (Seeds database automatically)
python run.py
```
Backend will start on: **`http://localhost:8000`**
- Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 3. Frontend Setup
In a new terminal window:
```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will start on: **`http://localhost:5173`**

---

## 🔑 Pre-Seeded Demo Account

UtsavSetu automatically boots with a realistic demo dataset. You can log in with one click using the **"Explore with Demo Account"** button on the login page, or manually:

- **Email**: `demo@utsavsetu.com`
- **Password**: `password123`

### Pre-Seeded Celebrations Included:
1. **Aditi & Vikram's Royal Wedding**: Multi-day wedding with 8 pre-loaded guests, dietary preferences, WhatsApp logs, and budget transactions.
2. **Aarav's 5th Superhero Birthday Party**: Kids birthday with children/adult counters and game checklist.
3. **Maha Lakshmi Pooja & Griha Pravesh**: Sacred pooja with muhurat schedule and satvik meal quantity calculator.
4. **Rohan & Priya's Ring Ceremony**: Intimate engagement ceremony with romantic floral invitation card.

---

## 📱 WhatsApp Business Cloud API Configuration

### Demo Mode vs. Live Production Mode

| Capability | Demo Mode (Default) | Meta Cloud API (Live) |
| :--- | :--- | :--- |
| **Credentials Required** | None | Meta Developer Account & Phone Number ID |
| **Cost** | 100% Free | Meta Business conversation charges |
| **Dispatch Mechanism** | Direct `wa.me` URL with pre-filled message | Official Graph API HTTP POST |
| **RSVP Link Format** | Fully functional tokenized URL | Fully functional tokenized URL |
| **Audit Logs** | Recorded in database with simulated timestamp | Verified message IDs & delivery statuses |

To switch from Demo Mode to Live WhatsApp Cloud API:
1. Go to [developers.facebook.com](https://developers.facebook.com) and create a WhatsApp Business App.
2. Retrieve your **Access Token**, **Phone Number ID**, and **Business Account ID**.
3. Create a `.env` file in the root directory (copied from `.env.example`):
```env
WHATSAPP_TOKEN=your_meta_system_user_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_waba_id
WHATSAPP_VERIFY_TOKEN=utsavsetu_verify_webhook_secret
```
4. Configure your webhook endpoint in Meta App Dashboard: `https://your-domain.com/api/v1/whatsapp/webhook`

---

## 🧪 Automated Testing Suite

The backend includes a comprehensive pytest suite verifying authentication, event type adapting engine, food calculation formulas, RSVP state machines, check-in duplicate prevention, and report generation:

```bash
# Run test suite
python -m pytest backend/tests -v
```

All 12 test suites execute in seconds:
- `test_user_registration_and_login`
- `test_event_engine_configurations`
- `test_create_and_fetch_event`
- `test_guest_creation_and_listing`
- `test_public_rsvp_flow`
- `test_food_catering_calculation_formulas`
- `test_attendance_checkin_and_duplicate_warning`
- `test_attendance_walkin_registration`
- `test_whatsapp_demo_invite_link_generation`
- `test_smart_assist_recommendations`
- `test_pdf_catering_sheet_generation`
- `test_csv_export_generation`

---

## 👨‍💻 Creator & Developer

**Satyam Rai**  
- **GitHub**: [https://github.com/satyam14102008-design](https://github.com/satyam14102008-design)  
- **LinkedIn**: [https://www.linkedin.com/in/satyam-rai-65a298386/](https://www.linkedin.com/in/satyam-rai-65a298386/)

---

## 📄 License & Credits
Built with devotion for Indian families celebrating life's most precious milestones.  
Designed and engineered by **Satyam Rai**.

