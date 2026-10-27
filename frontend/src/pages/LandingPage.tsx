import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Heart,
  Send,
  PieChart,
  UserCheck,
  Palette,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed,
  Cake,
  Flame,
  Home
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D]">
      {/* Top Notice Bar */}
      <div className="bg-[#800020] text-[#D4AF37] px-4 py-2 text-center text-xs font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4 text-[#D4AF37]" />
        <span>One Platform. Every Celebration. Dedicated Indian Event Management SaaS.</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle decorative circles */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#800020]/10 border border-[#800020]/30 text-[#800020] text-xs font-semibold uppercase tracking-wider">
            <span>✨ उत्सवसेतु • UTSAVSETU</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-stone-900 font-serif leading-tight">
            Celebrate Beautifully. Invite Easily. <br />
            <span className="text-[#800020]">Plan Intelligently. Avoid Waste.</span>
          </h1>

          <p className="text-base md:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one platform for Indian weddings, birthdays, engagements, poojas, anniversaries, and family celebrations. Manage guests on WhatsApp, collect dietary RSVPs, calculate food quantities, and track actual attendance.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            {user ? (
              <Link
                to="/dashboard"
                className="px-8 py-3.5 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <button
                  onClick={demoLogin}
                  className="px-8 py-3.5 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Explore Live Demo (Instant)
                </button>
                <Link
                  to="/register"
                  className="px-8 py-3.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-sm shadow-sm transition"
                >
                  Create Free Account
                </Link>
              </>
            )}
          </div>

          <p className="text-xs text-stone-500 pt-2">
            No credit card required • Pre-seeded with realistic Indian weddings, birthdays, poojas & engagements
          </p>
        </div>
      </section>

      {/* The Core Problem We Solve */}
      <section className="py-12 bg-white border-y border-[#D4AF37]/20 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold font-serif text-stone-900">
              The Real Challenges in Indian Celebrations
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Indian families invite hundreds of guests, but scattered communication leads to huge food waste and unnecessary budget overspending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900">Costly Food Wastage</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                400 people invited, food prepared for 400, but only 280 arrive. At ₹800/plate, that is ₹96,000 paid for food thrown away.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900">WhatsApp Chaos</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Important details scattered across hundreds of individual chats, phone calls, paper notebooks, and unorganized spreadsheets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900">Dietary & Ritual Confusion</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                No reliable way to know how many Vegetarian, Non-Vegetarian, or Jain meals are needed, leading to shortages or excess.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Event Types Adaptive Experience */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs uppercase tracking-widest text-[#800020] font-bold">
            Event-Aware Engine
          </span>
          <h2 className="text-3xl font-bold font-serif text-stone-900 mt-1">
            One Platform. Every Celebration.
          </h2>
          <p className="text-sm text-stone-600 mt-2">
            UtsavSetu adapts its templates, fields, RSVP questions, and budgeting tools to your celebration.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Wedding (विवाह)', desc: 'Couple names, multi-rituals, royal invites, veg/NV breakdown', icon: Heart, color: 'text-[#800020]' },
            { title: 'Birthday (जन्मदिन)', desc: 'Age, kids/adult counts, cartoon themes, cake estimates', icon: Cake, color: 'text-sky-600' },
            { title: 'Pooja & Havan', desc: 'Auspicious muhurat, satvik meals, prasad box planning', icon: Flame, color: 'text-amber-600' },
            { title: 'Engagement / Roka', desc: 'Couple celebration, ring ceremony timing, floral themes', icon: Sparkles, color: 'text-pink-600' },
            { title: 'Griha Pravesh', desc: 'New house address, Google Maps, Vastu shanti pooja', icon: Home, color: 'text-emerald-700' },
            { title: 'Anniversary', desc: 'Milestone years, banquet seating, video tribute planning', icon: ShieldCheck, color: 'text-purple-700' },
            { title: 'Baby Shower', desc: 'Godh bharai traditions, pastel invitations, game kits', icon: UserCheck, color: 'text-rose-600' },
            { title: 'Custom Celebrations', desc: 'Retirements, graduations, festivals & community feasts', icon: Sparkles, color: 'text-stone-700' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white border border-stone-200/80 shadow-xs hover:border-[#D4AF37] transition">
              <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
              <h4 className="font-bold text-sm text-stone-900">{item.title}</h4>
              <p className="text-xs text-stone-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-[#F4ECE1] px-4 md:px-8 border-t border-[#D4AF37]/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold font-serif text-stone-900">
              Built for Families & Event Planners
            </h2>
            <p className="text-sm text-stone-600 mt-2">
              Everything you need from designing the card to guest check-in at the banquet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200 space-y-3">
              <Palette className="w-6 h-6 text-[#800020]" />
              <h3 className="font-bold text-base text-stone-900">Live Invitation Studio</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Design royal Indian cards in English and Hindi. Pick themes, colors, ornate borders, and auspicious motifs. Export WhatsApp-friendly images or printable PDFs.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200 space-y-3">
              <Send className="w-6 h-6 text-emerald-700" />
              <h3 className="font-bold text-base text-stone-900">WhatsApp & Demo Messaging</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Send personalized WhatsApp links with 1-click wa.me buttons or Meta Cloud API. Guests confirm attendance, meal types, and arrival time in 30 seconds.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200 space-y-3">
              <UtensilsCrossed className="w-6 h-6 text-amber-700" />
              <h3 className="font-bold text-base text-stone-900">Food & Buffer Calculator</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Automatic plate calculation for veg, non-veg, and children meals with organizer buffer % and caterer minimums. Transparent savings estimates.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200 space-y-3">
              <UserCheck className="w-6 h-6 text-indigo-700" />
              <h3 className="font-bold text-base text-stone-900">Mobile Event-Day Check-in</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Front-desk staff can search guests or scan QR codes instantly. Accidental duplicate check-in prevention warns if a family was already logged.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200 space-y-3">
              <Sparkles className="w-6 h-6 text-[#D4AF37]" />
              <h3 className="font-bold text-base text-stone-900">Smart AI Assistant</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Heuristics highlight guests awaiting responses, confirmed guests missing meal choices, budget category overruns, and duplicate phone numbers.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl shadow-sm border border-stone-200 space-y-3">
              <CheckCircle2 className="w-6 h-6 text-teal-700" />
              <h3 className="font-bold text-base text-stone-900">Caterer PDF & Reports</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Export printable PDF catering order sheets, guest rosters, and budget balance CSVs with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-900 text-stone-400 text-center text-xs border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 UtsavSetu (उत्सवसेतु). AI-Powered Indian Event, Invitation & Guest Management.</p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-white transition">Sign In</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
            <button onClick={demoLogin} className="hover:text-amber-400 transition cursor-pointer">Quick Demo Mode</button>
          </div>
        </div>
      </footer>
    </div>
  );
};

