import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { PetalShower } from '../components/PetalShower';
import { CardPreview } from '../components/CardPreview';
import { CardDesign } from '../types';
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
  Home,
  Flower2,
  TrendingDown,
  PartyPopper,
  MessageCircle,
  Github,
  Linkedin
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();
  const [showPetals, setShowPetals] = useState(true);
  const [selectedDemoType, setSelectedDemoType] = useState<'wedding' | 'birthday' | 'pooja' | 'engagement'>('wedding');

  // Interactive Live Showcase Cards
  const showcaseDesigns: Record<string, CardDesign> = {
    wedding: {
      id: 'showcase_wedding',
      event_id: 'evt_w',
      template_id: 'royal_maroon',
      aspect_ratio: 'portrait',
      language: 'en',
      header_text: '|| श्री गणेशाय नमः ||',
      title: "Aditi & Vikram's Royal Wedding",
      invitation_body: 'Two souls, one sacred journey. We invite you and your family to celebrate our holy union and give your heartfelt blessings.',
      event_date_text: 'Sunday, 14th December 2026',
      venue_text: 'The Taj Palace Grand Ballroom, New Delhi',
      theme_preset: 'royal_maroon',
      background_color: '#800020',
      accent_color: '#D4AF37',
      text_color: '#FAF7F2',
      secondary_text_color: '#EADBC8',
      font_family: 'Cinzel',
      decorative_border: 'ornate_gold',
      motif_symbol: 'ganesha',
      show_qr_code: true,
      show_map_link: true,
    },
    birthday: {
      id: 'showcase_birthday',
      event_id: 'evt_b',
      template_id: 'kids_cartoon',
      aspect_ratio: 'portrait',
      language: 'en',
      header_text: '⭐ SUPERHERO PARTY TIME ⭐',
      title: "Aarav's 5th Superhero Birthday",
      invitation_body: 'Put on your superhero capes! Join us for an afternoon of games, superhero challenges, yummy treats, and cake cutting!',
      event_date_text: 'Saturday, 20th November 2026 at 4:30 PM',
      venue_text: 'Funky Monkey Kidzone, Mumbai',
      theme_preset: 'kids_cartoon',
      background_color: '#0284C7',
      accent_color: '#FBBF24',
      text_color: '#FFFFFF',
      secondary_text_color: '#E0F2FE',
      font_family: 'Plus Jakarta Sans',
      decorative_border: 'minimal',
      motif_symbol: 'birthday_cake',
      show_qr_code: true,
      show_map_link: true,
    },
    pooja: {
      id: 'showcase_pooja',
      event_id: 'evt_p',
      template_id: 'traditional',
      aspect_ratio: 'portrait',
      language: 'en',
      header_text: '|| ॐ नमो भगवते वासुदेवाय ||',
      title: 'Maha Lakshmi Pooja & Havan',
      invitation_body: 'Seek the blessings of Goddess Lakshmi and Lord Ganesha. You are cordially invited with family for the sacred pooja, aarti, and Mahaprasad.',
      event_date_text: 'Friday, 6th November 2026 at 10:00 AM',
      venue_text: 'Anandam Nilayam, Bengaluru',
      theme_preset: 'traditional',
      background_color: '#C2410C',
      accent_color: '#FDE047',
      text_color: '#FFFBEB',
      secondary_text_color: '#FEF3C7',
      font_family: 'Cinzel',
      decorative_border: 'royal_arch',
      motif_symbol: 'kalash',
      show_qr_code: true,
      show_map_link: true,
    },
    engagement: {
      id: 'showcase_engagement',
      event_id: 'evt_e',
      template_id: 'romantic_floral',
      aspect_ratio: 'portrait',
      language: 'en',
      header_text: '✨ A LOVE STORY BEGINS ✨',
      title: "Rohan & Priya's Ring Ceremony",
      invitation_body: 'We found love, and today we make a promise for forever. Join us under the stars as we exchange rings and celebrate new beginnings.',
      event_date_text: 'Sunday, 18th October 2026 at 6:30 PM',
      venue_text: 'The Oberoi Sky Garden, Gurugram',
      theme_preset: 'romantic_floral',
      background_color: '#831843',
      accent_color: '#F472B6',
      text_color: '#FDF2F8',
      secondary_text_color: '#FCE7F3',
      font_family: 'Playfair Display',
      decorative_border: 'floral',
      motif_symbol: 'rings',
      show_qr_code: true,
      show_map_link: true,
    },
  };

  const handleConfettiBlast = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#800020', '#10B981', '#F59E0B', '#E11D48'],
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2D2D] relative selection:bg-[#D4AF37] selection:text-white overflow-x-hidden">
      {/* Floating Celebratory Petal Shower */}
      <PetalShower active={showPetals} />

      {/* Floating Petal Toggle in Corner */}
      <button
        onClick={() => setShowPetals(!showPetals)}
        className="fixed bottom-5 left-5 z-40 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D4AF37]/40 shadow-lg text-[11px] font-bold text-[#800020] flex items-center gap-1.5 hover:bg-white transition cursor-pointer"
        title="Toggle falling celebratory petals"
      >
        <Flower2
          className={`w-3.5 h-3.5 text-pink-600 ${showPetals ? 'animate-spin' : ''}`}
          style={{ animationDuration: '8s' }}
        />
        <span className="hidden sm:inline">{showPetals ? 'Petals Active' : 'Show Petals'}</span>
      </button>

      {/* Top Auspicious Notice Bar with Shimmer */}
      <div className="bg-[#800020] text-[#D4AF37] px-4 py-2 text-center text-xs font-semibold flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/30 shadow-xs relative overflow-hidden">
        <div className="absolute inset-0 shimmer-gold-border opacity-20 pointer-events-none" />
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <span className="animate-diya">🪔</span>
          <span>One Platform. Every Celebration. Dedicated Indian Event Management SaaS.</span>
          <span className="hidden md:inline text-white/80 font-normal">• Reduce Food Waste & Overspending</span>
        </div>
        <div className="flex items-center gap-2.5 mx-auto sm:mx-0 text-white/90 text-xs">
          <span>Created with pride by <strong className="text-amber-300 font-serif">Satyam Rai</strong></span>
          <span className="text-white/40">|</span>
          <a
            href="https://github.com/satyam14102008-design"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-300 transition flex items-center gap-1 text-stone-200 hover:scale-105"
            title="Satyam Rai on GitHub"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">GitHub</span>
          </a>
          <span className="text-white/40">•</span>
          <a
            href="https://www.linkedin.com/in/satyam-rai-65a298386/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-300 transition flex items-center gap-1 text-sky-200 hover:scale-105"
            title="Satyam Rai on LinkedIn"
          >
            <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
            <span className="hidden sm:inline text-[11px]">LinkedIn</span>
          </a>
        </div>
      </div>

      {/* HERO SECTION WITH 3D INTERACTIVE CARD SHOWCASE */}
      <section className="relative overflow-hidden pt-12 pb-20 md:py-24 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Ambient Golden Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#800020]/10 border border-[#800020]/30 text-[#800020] text-xs font-bold uppercase tracking-wider shadow-xs animate-badge-glow">
              <span className="animate-diya">🪔</span>
              <span>उत्सवसेतु • UTSAVSETU</span>
              <span className="text-stone-400">•</span>
              <span className="text-[#800020] font-semibold">Crafted by Satyam Rai</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 font-serif leading-[1.15]">
              Celebrate Beautifully. <br />
              <span className="text-[#800020]">Plan Intelligently.</span> <br />
              <span className="bg-gradient-to-r from-[#D4AF37] via-amber-600 to-[#800020] bg-clip-text text-transparent">
                Eliminate Food Waste.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              The all-in-one operating system for Indian weddings, birthdays, poojas, engagements, and griha pravesh. Design royal digital cards, manage guest RSVPs on WhatsApp, and automatically project exact food quantities.
            </p>

            {/* Call to Actions with Golden Halos */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              {user ? (
                <Link
                  to="/dashboard"
                  className="px-8 py-4 rounded-2xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-sm shadow-xl flex items-center gap-2 transition hover:scale-105 golden-halo cursor-pointer"
                >
                  Go to My Celebrations <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <button
                    onClick={demoLogin}
                    className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#800020] via-[#9B1238] to-[#800020] hover:from-[#580c1f] hover:to-[#580c1f] text-white font-bold text-sm shadow-xl flex items-center gap-2.5 transition hover:scale-105 active:scale-95 golden-halo cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Explore Live Demo (1-Click)</span>
                  </button>
                  <Link
                    to="/register"
                    className="px-8 py-4 rounded-2xl bg-white hover:bg-stone-50 border-2 border-stone-200 text-stone-800 font-bold text-sm shadow-sm transition hover:border-[#D4AF37]"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>

            {/* Social Trust Bullet Points */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Free Demo Access
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> WhatsApp & Instagram Sharing
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Veg / Jain / Non-Veg RSVP
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Live Card Showcase */}
          <div className="lg:col-span-5 relative flex flex-col items-center">
            {/* Interactive Celebration Type Switcher Pills */}
            <div className="flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#D4AF37]/40 shadow-md mb-4 z-20">
              {[
                { id: 'wedding', label: '👑 Wedding', desc: 'Aditi & Vikram' },
                { id: 'birthday', label: '🎂 Birthday', desc: 'Aarav 5th' },
                { id: 'pooja', label: '🪔 Pooja', desc: 'Maha Lakshmi' },
                { id: 'engagement', label: '💍 Roka', desc: 'Rohan & Priya' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDemoType(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDemoType === tab.id
                      ? 'bg-[#800020] text-white shadow-xs scale-105'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Floating Live Card Canvas with Animation */}
            <div className="relative group w-full max-w-[340px] sm:max-w-[360px]">
              {/* Floating Feature Tag 1: Savings Badge */}
              <div className="absolute -top-3 -right-4 z-30 px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xl text-emerald-900 text-xs font-bold flex items-center gap-1.5 animate-badge-glow">
                <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                <span>₹1,20,000 Food Saved</span>
              </div>

              {/* Floating Feature Tag 2: WhatsApp RSVPs */}
              <div className="absolute -bottom-4 -left-4 z-30 px-3.5 py-1.5 rounded-2xl bg-[#25D366]/15 backdrop-blur-md border border-[#25D366]/40 shadow-xl text-[#075E54] text-xs font-bold flex items-center gap-1.5 animate-badge-glow">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-current" />
                <span>1-Click WhatsApp RSVPs</span>
              </div>

              {/* Floating 3D Card Container */}
              <div className="animate-float shadow-2xl rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 golden-halo transition-all hover:scale-[1.02] duration-300">
                <CardPreview
                  design={showcaseDesigns[selectedDemoType]}
                  rsvpToken="demo-live-preview"
                />
              </div>

              {/* Interactive Confetti Test Trigger */}
              <div className="text-center mt-6">
                <button
                  onClick={handleConfettiBlast}
                  className="px-4 py-2 rounded-xl bg-white/90 hover:bg-white border border-[#D4AF37]/40 shadow-sm text-xs font-bold text-[#800020] flex items-center gap-1.5 mx-auto transition cursor-pointer hover:scale-105"
                >
                  <PartyPopper className="w-4 h-4 text-[#D4AF37]" />
                  <span>Tap to Test Celebratory Confetti!</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED LIVE METRIC STATS TICKER */}
      <section className="py-8 bg-white border-y border-[#D4AF37]/30 shadow-xs relative">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-serif text-[#800020]">
              ₹4.8L+
            </p>
            <p className="text-xs text-stone-500 font-medium">Avg. Food Overspending Prevented</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-serif text-[#800020]">
              98.4%
            </p>
            <p className="text-xs text-stone-500 font-medium">Headcount Prediction Accuracy</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-serif text-[#800020]">
              8+ Events
            </p>
            <p className="text-xs text-stone-500 font-medium">Weddings, Poojas, Birthdays & More</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold font-serif text-[#800020]">
              30 Sec
            </p>
            <p className="text-xs text-stone-500 font-medium">Avg. WhatsApp RSVP Confirmation</p>
          </div>
        </div>
      </section>

      {/* THE PROBLEM WE SOLVE (COMPARISON) */}
      <section className="py-16 bg-[#FAF7F2] px-4 md:px-8">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#800020]">
              The Core Problem
            </span>
            <h2 className="text-3xl font-bold font-serif text-stone-900">
              Why Indian Families Overspend on Celebrations
            </h2>
            <p className="text-sm text-stone-600">
              Traditional coordination across notebooks and WhatsApp chats leads to severe financial waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-3 hover:border-rose-400 transition">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 font-serif">Excess Food Wastage</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                400 guests invited, food prepared for 400, but only 280 arrive. At ₹800–₹1,500/plate, Indian families lose ₹96,000–₹1,80,000 on discarded food.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-3 hover:border-amber-400 transition">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 font-serif">WhatsApp Chat Chaos</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                RSVPs, arrival times, and family member counts are scattered across hundreds of individual WhatsApp chats, phone calls, and loose paper notes.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-sm space-y-3 hover:border-emerald-400 transition">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-stone-900 font-serif">Dietary Confusion</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                No reliable way to know how many Pure Vegetarian, Non-Vegetarian, or Jain (No onion-garlic) meals are needed, causing caterer disputes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EVENT TYPES ADAPTIVE EXPERIENCE */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#800020] font-bold">
            Event-Aware Engine
          </span>
          <h2 className="text-3xl font-bold font-serif text-stone-900">
            One Platform. Every Celebration.
          </h2>
          <p className="text-sm text-stone-600">
            UtsavSetu is not a wedding-only platform. Select your occasion and the entire app adapts dynamically.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Wedding (विवाह)', desc: 'Couple names, multi-rituals, royal invites, veg/NV breakdown', icon: Heart, color: 'text-[#800020]', bg: 'hover:border-[#800020]' },
            { title: 'Birthday (जन्मदिन)', desc: 'Age, kids/adult counts, cartoon themes, cake estimates', icon: Cake, color: 'text-sky-600', bg: 'hover:border-sky-500' },
            { title: 'Pooja & Havan', desc: 'Auspicious muhurat, satvik meals, prasad box planning', icon: Flame, color: 'text-amber-600', bg: 'hover:border-amber-500' },
            { title: 'Engagement / Roka', desc: 'Couple celebration, ring ceremony timing, floral themes', icon: Sparkles, color: 'text-pink-600', bg: 'hover:border-pink-500' },
            { title: 'Griha Pravesh', desc: 'New house address, Google Maps, Vastu shanti pooja', icon: Home, color: 'text-emerald-700', bg: 'hover:border-emerald-600' },
            { title: 'Anniversary', desc: 'Milestone years, banquet seating, video tribute planning', icon: ShieldCheck, color: 'text-purple-700', bg: 'hover:border-purple-500' },
            { title: 'Baby Shower', desc: 'Godh bharai traditions, pastel invitations, game kits', icon: UserCheck, color: 'text-rose-600', bg: 'hover:border-rose-500' },
            { title: 'Custom Celebrations', desc: 'Retirements, graduations, festivals & community feasts', icon: Sparkles, color: 'text-stone-700', bg: 'hover:border-stone-500' },
          ].map((item, i) => (
            <div
              key={i}
              className={`p-5 rounded-3xl bg-white border border-stone-200/80 shadow-xs transition-all hover:scale-105 duration-200 cursor-pointer ${item.bg}`}
            >
              <item.icon className={`w-7 h-7 ${item.color} mb-3`} />
              <h4 className="font-bold text-sm text-stone-900 font-serif">{item.title}</h4>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE SHOWCASE GRID */}
      <section className="py-16 bg-[#F4ECE1] px-4 md:px-8 border-t border-[#D4AF37]/30">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold tracking-widest text-[#800020]">
              Full Feature Suite
            </span>
            <h2 className="text-3xl font-bold font-serif text-stone-900">
              Built for Families & Event Planners
            </h2>
            <p className="text-sm text-stone-600">
              Everything you need from designing the card to guest check-in at the banquet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-3 hover:border-[#D4AF37] transition">
              <Palette className="w-7 h-7 text-[#800020]" />
              <h3 className="font-bold text-base text-stone-900 font-serif">Live Invitation Studio</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Design royal Indian cards in English and Hindi. Pick themes, colors, ornate borders, and auspicious motifs. Export WhatsApp-friendly images or printable PDFs.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-3 hover:border-[#D4AF37] transition">
              <Send className="w-7 h-7 text-emerald-700" />
              <h3 className="font-bold text-base text-stone-900 font-serif">WhatsApp & Demo Messaging</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Send personalized WhatsApp links with 1-click wa.me buttons or Meta Cloud API. Guests confirm attendance, meal types, and arrival time in 30 seconds.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-3 hover:border-[#D4AF37] transition">
              <UtensilsCrossed className="w-7 h-7 text-amber-700" />
              <h3 className="font-bold text-base text-stone-900 font-serif">Food & Buffer Calculator</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Automatic plate calculation for veg, non-veg, and children meals with organizer buffer % and caterer minimums. Transparent savings estimates.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-3 hover:border-[#D4AF37] transition">
              <UserCheck className="w-7 h-7 text-indigo-700" />
              <h3 className="font-bold text-base text-stone-900 font-serif">Mobile Event-Day Check-in</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Front-desk staff can search guests or scan QR codes instantly. Accidental duplicate check-in prevention warns if a family was already logged.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-3 hover:border-[#D4AF37] transition">
              <Sparkles className="w-7 h-7 text-[#D4AF37]" />
              <h3 className="font-bold text-base text-stone-900 font-serif">Smart AI Assistant</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Heuristics highlight guests awaiting responses, confirmed guests missing meal choices, budget category overruns, and duplicate phone numbers.
              </p>
            </div>

            <div className="p-6 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-3 hover:border-[#D4AF37] transition">
              <CheckCircle2 className="w-7 h-7 text-teal-700" />
              <h3 className="font-bold text-base text-stone-900 font-serif">Caterer PDF & Reports</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Export printable PDF catering order sheets, guest rosters, and budget balance CSVs with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CALL TO ACTION BANNER */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto text-center">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-[#800020] via-[#5C0617] to-[#800020] text-white border-2 border-[#D4AF37]/50 shadow-2xl space-y-6 golden-halo">
          <span className="text-3xl animate-diya">🪔</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-serif">
            Ready to Plan Your Next Celebration?
          </h2>
          <p className="text-xs sm:text-sm text-stone-200 max-w-lg mx-auto">
            Join families across India who are planning memorable weddings, poojas, and birthdays without food waste and budget anxiety.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              onClick={demoLogin}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] text-stone-900 font-bold text-sm shadow-xl hover:scale-105 transition cursor-pointer"
            >
              Explore Instant Demo
            </button>
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/40 text-white font-bold text-sm transition"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-stone-900 text-stone-300 text-xs border-t border-stone-800">
        <div className="max-w-6xl mx-auto px-4 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-stone-800">
            {/* Left: Brand & Mission */}
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-2xl animate-diya">🪔</span>
                <span className="font-serif text-lg font-bold text-white tracking-wide">
                  UtsavSetu <span className="text-[#D4AF37]">(उत्सवसेतु)</span>
                </span>
              </div>
              <p className="text-stone-400 text-xs max-w-md leading-relaxed">
                Empowering Indian families & celebration hosts with smart RSVP tracking, catering accuracy, and royal digital invitations.
              </p>
            </div>

            {/* Right: Creator Profile & Socials */}
            <div className="flex flex-col items-center md:items-end gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-400">Designed & Developed by</span>
                <span className="text-amber-300 font-bold font-serif text-sm px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 shadow-xs">
                  Satyam Rai
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com/satyam14102008-design"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 hover:border-[#D4AF37] transition shadow-xs group"
                >
                  <Github className="w-4 h-4 text-stone-300 group-hover:text-white transition" />
                  <span className="font-medium text-xs">GitHub Profile</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/satyam-rai-65a298386/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0A66C2]/15 hover:bg-[#0A66C2]/30 text-sky-200 border border-[#0A66C2]/40 hover:border-sky-400 transition shadow-xs group"
                >
                  <Linkedin className="w-4 h-4 text-[#0A66C2] group-hover:text-sky-300 transition" />
                  <span className="font-medium text-xs">LinkedIn Profile</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Navigation Links */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
            <p>© 2026 UtsavSetu (उत्सवसेतु) • Crafted by Satyam Rai</p>
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-white transition">Sign In</Link>
              <Link to="/register" className="hover:text-white transition">Register</Link>
              <button onClick={demoLogin} className="hover:text-amber-400 transition cursor-pointer">Quick Demo</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
