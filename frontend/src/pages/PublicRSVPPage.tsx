import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ApiService } from '../services/api';
import { PublicInvitationData, RSVPSubmissionPayload } from '../types';
import { CardPreview } from '../components/CardPreview';
import { PetalShower } from '../components/PetalShower';
import { EventTypeBadge } from '../components/EventTypeBadge';
import { decodeShareableInvitationData } from '../services/shareUrlHelper';
import {
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UtensilsCrossed,
  Sparkles,
  Heart,
  MessageSquare,
  Users,
  Flower2,
  Flame,
  ChevronDown,
  Github,
  Linkedin
} from 'lucide-react';

export const PublicRSVPPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();

  const [data, setData] = useState<PublicInvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // High-Level Animation States
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [showPetals, setShowPetals] = useState(true);

  // Form states
  const [status, setStatus] = useState<'confirmed' | 'declined' | 'maybe'>('confirmed');
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [dietaryVeg, setDietaryVeg] = useState<number>(2);
  const [dietaryNonVeg, setDietaryNonVeg] = useState<number>(0);
  const [dietaryJain, setDietaryJain] = useState<number>(0);
  const [dietaryNotes, setDietaryNotes] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [prasadCount, setPrasadCount] = useState<number>(2);
  const [birthdayAges, setBirthdayAges] = useState<string>('');
  const [guestWishes, setGuestWishes] = useState<string>('');
  const [guestNameInput, setGuestNameInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const currentToken = token || 'invitation';
    let loadedData: PublicInvitationData | null = null;

    // STEP 1: Check for encoded celebration data in the URL (?d= or ?data=)
    const encodedParam = searchParams.get('d') || searchParams.get('data');
    if (encodedParam) {
      loadedData = decodeShareableInvitationData(currentToken, encodedParam);
    }

    // STEP 2: Check for locally cached invitation on this device
    if (!loadedData) {
      try {
        const cached = localStorage.getItem(`utsavsetu_invitation_${currentToken}`);
        if (cached) {
          loadedData = JSON.parse(cached);
        }
      } catch (_) {}
    }

    // If we have URL or cached data, render it immediately for zero-delay loading
    if (loadedData) {
      setData(loadedData);
      setLoading(false);
    }

    // STEP 3: Attempt live backend fetch to get fresh server data / RSVPs
    ApiService.getPublicInvitation(currentToken)
      .then((inv) => {
        setData(inv);
        if (inv.existing_response) {
          const resp = inv.existing_response;
          setStatus((resp.status as any) || 'confirmed');
          setAdults(resp.attending_adults || inv.invited_adults || 2);
          setChildren(resp.attending_children || 0);
          setDietaryVeg(resp.dietary_veg || 0);
          setDietaryNonVeg(resp.dietary_non_veg || 0);
          setDietaryJain(resp.dietary_jain || 0);
          setDietaryNotes(resp.special_dietary_notes || '');
          setArrivalTime(resp.arrival_time || '');
          setPrasadCount(resp.prasad_count || 0);
          setBirthdayAges(resp.birthday_children_ages || '');
          setGuestWishes(resp.guest_wishes || '');
          setSubmitted(true);
        }
      })
      .catch(() => {
        // If API fails but we already got the host's encoded data from the URL, keep it!
        if (!loadedData) {
          // General fallback only if completely empty
          const fallbackData: PublicInvitationData = {
            token: currentToken,
            guest_name: 'Honored Guest',
            family_name: 'Guest Family',
            invited_adults: 2,
            invited_children: 0,
            current_rsvp_status: 'awaiting',
            event: {
              id: currentToken,
              title: 'Auspicious Celebration',
              event_type: 'wedding',
              date: '2026-12-14',
              time: '17:30',
              venue_name: 'Royal Palace Banquet Hall',
              venue_address: 'Grand Celebration Road',
              map_url: 'https://maps.google.com',
              host_names: 'The Host Family',
              description: 'With joyful hearts, we cordially invite you and your family to celebrate this blessed occasion with us.',
              primary_person_name: 'Host & Family',
              created_by: 'host',
              rituals: [
                { name: 'Ceremony Welcome & Milni', date: '2026-12-14', time: '17:30', description: 'Welcoming guests with ceremonial sweets' },
                { name: 'Main Rituals & Blessings', date: '2026-12-14', time: '19:00', description: 'Sacred ceremonies and rituals' },
                { name: 'Celebration Banquet Feast', date: '2026-12-14', time: '20:30', description: 'Traditional festive dinner' }
              ]
            },
            card_design: {
              id: 'card_fallback',
              event_id: currentToken,
              template_id: 'royal_maroon',
              aspect_ratio: 'portrait',
              language: 'en',
              header_text: '|| श्री गणेशाय नमः ||',
              title: 'Auspicious Celebration',
              invitation_body: 'Two souls, one sacred journey. We invite you to be a part of our happiest celebration as we begin our new life together.',
              event_date_text: 'Sunday, 14th December 2026 at 5:30 PM',
              venue_text: 'Royal Palace Banquet Hall',
              theme_preset: 'royal_maroon',
              background_color: '#800020',
              accent_color: '#D4AF37',
              text_color: '#FAF7F2',
              secondary_text_color: '#EADBC8',
              font_family: 'Cinzel',
              decorative_border: 'ornate_gold',
              motif_symbol: 'ganesha',
              show_qr_code: true,
              show_map_link: true
            },
            dietary_options: ['Vegetarian', 'Non-Vegetarian', 'Jain'],
            existing_response: undefined
          };
          setData(fallbackData);
        }
      })
      .finally(() => setLoading(false));
  }, [token, searchParams]);

  // Interactive Royal Envelope / Seal Opening Function
  const handleOpenEnvelope = () => {
    // Burst celebratory confetti upon opening
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#D4AF37', '#800020', '#F59E0B', '#FFF4D2'],
    });

    setEnvelopeOpened(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;
    setValidationError(null);

    const totalAttendees = adults + children;

    if (status === 'confirmed' && totalAttendees === 0) {
      setValidationError('Please select at least 1 attending guest (adult or child).');
      return;
    }

    const totalMeals = dietaryVeg + dietaryNonVeg + dietaryJain;
    if (status === 'confirmed' && totalMeals > totalAttendees) {
      setValidationError(`Total meal preferences (${totalMeals}) cannot exceed total attending guests (${totalAttendees}).`);
      return;
    }

    setSubmitting(true);
    try {
      const payload: RSVPSubmissionPayload = {
        token: token || 'open_invite',
        status,
        attending_adults: status === 'declined' ? 0 : adults,
        attending_children: status === 'declined' ? 0 : children,
        dietary_veg: status === 'declined' ? 0 : dietaryVeg,
        dietary_non_veg: status === 'declined' ? 0 : dietaryNonVeg,
        dietary_jain: status === 'declined' ? 0 : dietaryJain,
        special_dietary_notes: dietaryNotes,
        arrival_time: arrivalTime,
        prasad_count: prasadCount,
        birthday_children_ages: birthdayAges,
        guest_wishes: guestWishes,
      };

      try {
        await ApiService.submitPublicRSVP(payload);
      } catch (_) {
        // Resilient fallback storage
        try {
          localStorage.setItem(`utsavsetu_rsvp_${token}`, JSON.stringify(payload));
        } catch (_) {}
      }

      setSubmitted(true);

      // Trigger High-Level Fireworks Confetti celebration
      const end = Date.now() + 2.5 * 1000;
      const colors = ['#800020', '#D4AF37', '#10B981', '#F59E0B', '#E11D48'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();

    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-serif text-3xl font-bold mx-auto golden-halo animate-pulse">
            ॐ
          </div>
          <p className="font-serif font-bold text-sm text-[#800020] tracking-wider uppercase animate-pulse">
            Opening Auspicious Celebration...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-rose-200 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif text-stone-900">Celebration Details</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Please ask the host family for their active invitation link.
          </p>
        </div>
      </div>
    );
  }

  const { event, card_design } = data;
  const isPooja = event.event_type === 'pooja';
  const isBirthday = event.event_type === 'birthday';
  const totalAttending = adults + children;

  // ============================================================================
  // ROYAL ENVELOPE / SEAL OPENING CEREMONY SCREEN
  // ============================================================================
  if (!envelopeOpened) {
    return (
      <div className="min-h-screen bg-[#2A0812] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-[#D4AF37] selection:text-stone-900">
        {/* Floating Petals Shower */}
        <PetalShower active={showPetals} />

        {/* Ambient Golden Background Glow */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-[#D4AF37]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl pointer-events-none" />

        {/* Ceremonial Royal Envelope Container */}
        <div className="relative z-20 max-w-md w-full text-center space-y-6 p-8 rounded-3xl bg-gradient-to-b from-[#3D0C1A] to-[#1F050D] border-2 border-[#D4AF37]/60 shadow-2xl golden-halo">
          {/* Sacred Auspicious Header */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-4xl filter drop-shadow-md animate-diya">🪔</span>
            <span className="text-xs font-serif tracking-widest text-[#D4AF37] font-semibold mt-1">
              || श्री गणेशाय नमः ||
            </span>
          </div>

          {/* Invitation Titles */}
          <div className="space-y-2 py-2">
            <span className="inline-block text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
              Personal Invitation • सादर आमंत्रण
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-white leading-snug drop-shadow-md">
              {event.title}
            </h1>
            <p className="text-xs text-stone-300 font-medium">
              Warmly Invited by: <b className="text-[#D4AF37]">{event.host_names}</b>
            </p>
            <p className="text-xs text-amber-200/90 pt-1">
              📅 {event.date} {event.time ? `• ⏰ ${event.time}` : ''}
            </p>
          </div>

          {/* Golden Wax Seal Opening Button */}
          <div className="pt-4 flex flex-col items-center space-y-3">
            <button
              onClick={handleOpenEnvelope}
              className="group relative px-7 py-3.5 rounded-full bg-gradient-to-r from-[#D4AF37] via-amber-300 to-[#D4AF37] text-stone-900 font-serif font-extrabold text-xs sm:text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 border border-white/60 golden-halo"
            >
              <span className="text-base">ॐ</span>
              <span>Open Invitation • आमंत्रण पत्र खोलें</span>
              <Sparkles className="w-4 h-4 text-amber-900 group-hover:rotate-45 transition-transform" />
            </button>
            <p className="text-[10px] text-stone-400">
              Tap to open ceremonial invitation & confirm RSVP
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // UNROLLED FULL INVITATION CARD & RSVP EXPERIENCE
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 md:px-8 relative selection:bg-[#D4AF37] selection:text-white animate-royal-unfold">
      {/* Ambient Petals Shower */}
      <PetalShower active={showPetals} />

      {/* Floating Petal Toggle Button */}
      <button
        onClick={() => setShowPetals(!showPetals)}
        className="fixed bottom-5 left-5 z-40 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D4AF37]/40 shadow-lg text-[11px] font-bold text-[#800020] flex items-center gap-1.5 hover:bg-white transition cursor-pointer"
        title="Toggle falling celebratory petals"
      >
        <Flower2 className={`w-3.5 h-3.5 text-pink-600 ${showPetals ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
        <span className="hidden sm:inline">{showPetals ? 'Petals Active' : 'Show Petals'}</span>
      </button>

      <div className="max-w-3xl mx-auto space-y-8 relative z-20">
        {/* Top Auspicious Greeting */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800020]/10 text-[#800020] border border-[#D4AF37]/40 text-xs font-bold uppercase tracking-wider">
            <span className="animate-diya">🪔</span>
            <span>Auspicious Celebration • सादर आमंत्रण</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-stone-900 leading-tight">
            Welcome, {data.family_name || data.guest_name}!
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
            You and your family are cordially invited to celebrate this blessed milestone with us.
          </p>
        </div>

        {/* Live Invitation Card Display with Golden Shimmer Aura */}
        {card_design && (
          <div className="max-w-[430px] mx-auto shadow-2xl rounded-3xl overflow-hidden golden-halo transition-transform hover:scale-[1.01] duration-300">
            <CardPreview design={card_design} rsvpToken={token} />
          </div>
        )}

        {/* Event Schedule & Rituals with High-End Cards */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#D4AF37]/35 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#800020]">
                Event Program
              </span>
              <h2 className="text-lg font-bold font-serif text-stone-900 mt-0.5">
                Ceremonies & Venue Directions
              </h2>
            </div>
            <EventTypeBadge type={event.event_type} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Date & Time */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 flex items-start gap-3">
              <Calendar className="w-5 h-5 text-[#800020] mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-stone-900">Celebration Date</p>
                <p className="text-stone-700 font-semibold">{event.date}</p>
                {event.time && <p className="text-stone-500 mt-0.5">Start Time: {event.time}</p>}
              </div>
            </div>

            {/* Venue & Location */}
            <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 flex items-start gap-3">
              <MapPin className="w-5 h-5 text-[#800020] mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-stone-900 truncate">{event.venue_name}</p>
                <p className="text-stone-600 truncate">{event.venue_address}</p>
                {event.map_url && (
                  <a
                    href={event.map_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#800020] hover:underline mt-1"
                  >
                    <ExternalLink className="w-3 h-3" /> View Map Location
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Rituals Timeline */}
          {event.rituals && event.rituals.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-2.5">
                Auspicious Ceremonies
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {event.rituals.map((r, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-[#FAF7F2] border border-stone-200 text-xs hover:border-[#D4AF37] transition">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{r.name}</span>
                      <span className="text-[#800020] text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-[#D4AF37]/30">
                        {r.time}
                      </span>
                    </div>
                    {r.description && <p className="text-[11px] text-stone-500 mt-1">{r.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RSVP Confirmation Form Container */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-[#D4AF37]/45 space-y-6 relative overflow-hidden">
          {/* Top Decorative Border Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 shimmer-gold-border" />

          <div className="text-center space-y-1 border-b pb-4">
            <h3 className="text-xl md:text-2xl font-bold font-serif text-stone-900">
              Confirm Your Attendance
            </h3>
            <p className="text-xs text-stone-500">
              Please help our host family plan seating, prasad, and catering by confirming below.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1 animate-in zoom-in-95">
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Attendance Confirmed & Saved!</span>
              </div>
              <p className="text-xs text-emerald-800">
                You responded as <b>{status.toUpperCase()}</b> for {totalAttending} guests. You can update your choices below at any time.
              </p>
            </div>
          )}

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2 animate-in fade-in">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Status Selection (Jewel Cards with Micro-Interactions) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                Will you be attending?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Confirmed */}
                <button
                  type="button"
                  onClick={() => setStatus('confirmed')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    status === 'confirmed'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-md scale-105 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <CheckCircle2 className={`w-6 h-6 ${status === 'confirmed' ? 'text-emerald-600 animate-bounce' : 'text-stone-400'}`} />
                  <span className="font-bold text-xs">Attending</span>
                  <span className="text-[10px] text-stone-400">Gladly Accept</span>
                </button>

                {/* Maybe */}
                <button
                  type="button"
                  onClick={() => setStatus('maybe')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    status === 'maybe'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-md scale-105 ring-2 ring-amber-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <HelpCircle className={`w-6 h-6 ${status === 'maybe' ? 'text-amber-500' : 'text-stone-400'}`} />
                  <span className="font-bold text-xs">Tentative</span>
                  <span className="text-[10px] text-stone-400">Will Confirm</span>
                </button>

                {/* Declined */}
                <button
                  type="button"
                  onClick={() => setStatus('declined')}
                  className={`p-3.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    status === 'declined'
                      ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-md scale-105 ring-2 ring-rose-500/20'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <XCircle className={`w-6 h-6 ${status === 'declined' ? 'text-rose-500' : 'text-stone-400'}`} />
                  <span className="font-bold text-xs">Declined</span>
                  <span className="text-[10px] text-stone-400">Blessings Only</span>
                </button>
              </div>
            </div>

            {/* 2. Headcount & Guest Name (If Attending or Maybe) */}
            {status !== 'declined' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Guest Name input if open token */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name / Family Name
                  </label>
                  <input
                    type="text"
                    value={guestNameInput || data.family_name || data.guest_name || ''}
                    onChange={(e) => setGuestNameInput(e.target.value)}
                    placeholder="E.g. Sharma Family / Rajesh Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>

                {/* Headcount Selectors */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-2">
                    <span className="text-xs font-bold text-stone-800 block">Adults (12+ yrs)</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-8 h-8 rounded-xl bg-white border border-stone-300 font-bold text-base hover:bg-stone-100 transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-base font-bold text-[#800020] min-w-[24px] text-center">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-8 h-8 rounded-xl bg-white border border-stone-300 font-bold text-base hover:bg-stone-100 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-stone-200 space-y-2">
                    <span className="text-xs font-bold text-stone-800 block">Children (&lt;12 yrs)</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-8 h-8 rounded-xl bg-white border border-stone-300 font-bold text-base hover:bg-stone-100 transition cursor-pointer"
                      >
                        -
                      </button>
                      <span className="text-base font-bold text-[#800020] min-w-[24px] text-center">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-8 h-8 rounded-xl bg-white border border-stone-300 font-bold text-base hover:bg-stone-100 transition cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dietary Breakdown */}
                <div className="space-y-3 p-4 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/35">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <UtensilsCrossed className="w-4 h-4 text-[#800020]" />
                      Dietary Meal Preferences
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      Total Meals: {dietaryVeg + dietaryNonVeg + dietaryJain} of {totalAttending}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {/* Pure Veg */}
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1">
                      <span className="font-bold text-emerald-800 block">🥗 Pure Veg</span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDietaryVeg(Math.max(0, dietaryVeg - 1))}
                          className="w-6 h-6 rounded-lg bg-stone-100 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-stone-900">{dietaryVeg}</span>
                        <button
                          type="button"
                          onClick={() => setDietaryVeg(dietaryVeg + 1)}
                          className="w-6 h-6 rounded-lg bg-stone-100 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Non-Veg */}
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1">
                      <span className="font-bold text-rose-800 block">🍗 Non-Veg</span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDietaryNonVeg(Math.max(0, dietaryNonVeg - 1))}
                          className="w-6 h-6 rounded-lg bg-stone-100 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-stone-900">{dietaryNonVeg}</span>
                        <button
                          type="button"
                          onClick={() => setDietaryNonVeg(dietaryNonVeg + 1)}
                          className="w-6 h-6 rounded-lg bg-stone-100 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Jain */}
                    <div className="p-2.5 rounded-xl bg-white border border-stone-200 space-y-1">
                      <span className="font-bold text-amber-800 block">🪷 Jain / Satvik</span>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDietaryJain(Math.max(0, dietaryJain - 1))}
                          className="w-6 h-6 rounded-lg bg-stone-100 font-bold text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-sm text-stone-900">{dietaryJain}</span>
                        <button
                          type="button"
                          onClick={() => setDietaryJain(dietaryJain + 1)}
                          className="w-6 h-6 rounded-lg bg-stone-100 font-bold text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expected Arrival Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="E.g. Around 7:00 PM for ceremonies"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>
            )}

            {/* Warm Wishes & Blessings */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Warm Wishes & Blessings for the Host Family (Optional)
              </label>
              <textarea
                rows={3}
                value={guestWishes}
                onChange={(e) => setGuestWishes(e.target.value)}
                placeholder="Write a message of love, congratulations or blessings..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
              />
            </div>

            {/* Submit Button with Animated Shimmer */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#800020] via-[#A01135] to-[#800020] hover:from-[#580c1f] hover:to-[#580c1f] text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 cursor-pointer golden-halo"
            >
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
              {submitting ? 'Confirming...' : submitted ? 'Update Confirmation' : 'Submit RSVP Confirmation'}
            </button>
          </form>
        </div>

        {/* Footer info & Creator Credit */}
        <div className="text-center space-y-2 text-[11px] text-stone-500 pt-2 pb-6">
          <p>
            Powered by <b className="text-stone-700">UtsavSetu (उत्सवसेतु)</b> • Crafted with pride by <b className="text-[#800020]">Satyam Rai</b>
          </p>
          <div className="flex items-center justify-center gap-3 text-stone-500 text-xs">
            <a
              href="https://github.com/satyam14102008-design"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-stone-900 flex items-center gap-1 transition"
            >
              <Github className="w-3.5 h-3.5 text-stone-600" />
              <span>GitHub</span>
            </a>
            <span>•</span>
            <a
              href="https://www.linkedin.com/in/satyam-rai-65a298386/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#0A66C2] flex items-center gap-1 transition"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
