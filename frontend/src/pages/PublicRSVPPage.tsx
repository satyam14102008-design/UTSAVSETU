import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { ApiService } from '../services/api';
import { PublicInvitationData, RSVPSubmissionPayload } from '../types';
import { CardPreview } from '../components/CardPreview';
import { EventTypeBadge } from '../components/EventTypeBadge';
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
  Users
} from 'lucide-react';

export const PublicRSVPPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicInvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    ApiService.getPublicInvitation(token)
      .then((inv) => {
        setData(inv);
        // Pre-fill existing response if any
        if (inv.existing_response) {
          const resp = inv.existing_response;
          setStatus(resp.status as any || 'confirmed');
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
        } else {
          setAdults(inv.invited_adults || 2);
          setChildren(inv.invited_children || 0);
          setDietaryVeg(inv.invited_adults || 2);
        }
      })
      .catch((err) => {
        setError(err.message || 'Invitation not found or link has expired.');
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !data) return;
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
        token,
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

      await ApiService.submitPublicRSVP(payload);
      setSubmitted(true);

      // Trigger Confetti celebration if confirmed
      if (status === 'confirmed') {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#800020', '#D4AF37', '#10B981', '#F59E0B'],
        });
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit response. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#800020] text-[#D4AF37] flex items-center justify-center font-serif text-2xl font-bold mx-auto animate-pulse">
            ॐ
          </div>
          <p className="text-xs text-stone-500 font-medium">Opening your invitation...</p>
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
          <h2 className="text-xl font-bold font-serif text-stone-900">Invitation Link Expired or Invalid</h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            {error || 'This invitation link could not be verified. Please contact the host family directly.'}
          </p>
        </div>
      </div>
    );
  }

  const { event, card_design } = data;
  const isPooja = event.event_type === 'pooja';
  const isBirthday = event.event_type === 'birthday';
  const totalAttending = adults + children;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-8 px-4 md:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Top Greeting Pill */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#800020]">
            Personalized Digital Invitation
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-serif text-stone-900">
            Welcome, {data.family_name || data.guest_name}!
          </h1>
          <p className="text-xs text-stone-600">
            You and your family are cordially invited to celebrate with us.
          </p>
        </div>

        {/* Live Invitation Card Display */}
        {card_design && (
          <div className="max-w-[420px] mx-auto shadow-2xl rounded-3xl overflow-hidden animate-in fade-in zoom-in-95">
            <CardPreview design={card_design} rsvpToken={token} />
          </div>
        )}

        {/* Event Schedule & Rituals */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#D4AF37]/30 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <EventTypeBadge type={event.event_type} />
              <h3 className="font-bold font-serif text-base text-stone-900">Event Details & Schedule</h3>
            </div>
            {event.map_url && (
              <a
                href={event.map_url}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-[#800020]" /> Open Maps <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-stone-400 text-[10px] uppercase font-bold">Venue & Address</span>
              <p className="font-bold text-stone-900">{event.venue_name}</p>
              <p className="text-stone-600">{event.venue_address}</p>
            </div>
            <div className="space-y-1">
              <span className="text-stone-400 text-[10px] uppercase font-bold">Date & Time</span>
              <p className="font-bold text-stone-900">🗓️ {event.date}</p>
              <p className="text-stone-600">⏰ {event.time} onwards</p>
              {event.muhurat_time && (
                <p className="text-amber-800 font-semibold mt-1">✨ {event.muhurat_time}</p>
              )}
            </div>
          </div>

          {/* Rituals timeline */}
          {event.rituals && event.rituals.length > 0 && (
            <div className="pt-3 border-t">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-2">
                Ceremonies & Program Timeline
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {event.rituals.map((r, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-[#FAF7F2] border border-stone-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-stone-900">
                      <span>{r.name}</span>
                      <span className="text-[#800020] text-[11px] font-mono">{r.time}</span>
                    </div>
                    {r.description && <p className="text-[11px] text-stone-500 mt-0.5">{r.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RSVP Confirmation Form Container */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-[#D4AF37]/40 space-y-6">
          <div className="text-center space-y-1 border-b pb-4">
            <h3 className="text-xl font-bold font-serif text-stone-900">
              Confirm Your Attendance
            </h3>
            <p className="text-xs text-stone-500">
              Please help our hosts plan seating, hospitality, and meals by confirming below.
            </p>
          </div>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Response Saved!</span>
              </div>
              <p className="text-xs text-emerald-800">
                You responded as <b>{status.toUpperCase()}</b> for {totalAttending} guests. You can update your details below at any time.
              </p>
            </div>
          )}

          {validationError && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Will you be attending?
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('confirmed')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    status === 'confirmed'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Joyfully Accept</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('maybe')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    status === 'maybe'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-500/20'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                  <span>Tentative / Maybe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStatus('declined')}
                  className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                    status === 'declined'
                      ? 'bg-rose-50 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  <XCircle className="w-5 h-5 text-rose-600" />
                  <span>Regretfully Decline</span>
                </button>
              </div>
            </div>

            {/* If Confirmed or Maybe: Attendee & Meal Details */}
            {status !== 'declined' && (
              <div className="space-y-5 animate-in fade-in">
                {/* Adults & Children counts */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-[#FAF7F2] border border-stone-200">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Adults Attending
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={adults}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setAdults(val);
                        setDietaryVeg(val);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Children Attending
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={15}
                      value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold bg-white"
                    />
                  </div>
                </div>

                {/* Dietary Meal Preferences */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-700">
                      Meal Preferences
                    </label>
                    <span className="text-[11px] text-stone-500">
                      Total: {dietaryVeg + dietaryNonVeg + dietaryJain} / {totalAttending} meals
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl border border-emerald-200 bg-emerald-50/40 text-center">
                      <span className="text-xs font-bold text-emerald-900 block mb-1">🟢 Veg</span>
                      <input
                        type="number"
                        min={0}
                        max={totalAttending}
                        value={dietaryVeg}
                        onChange={(e) => setDietaryVeg(parseInt(e.target.value) || 0)}
                        className="w-16 mx-auto px-2 py-1 text-center rounded-lg border border-emerald-300 font-bold text-xs bg-white"
                      />
                    </div>

                    <div className="p-3 rounded-2xl border border-rose-200 bg-rose-50/40 text-center">
                      <span className="text-xs font-bold text-rose-900 block mb-1">🔴 Non-Veg</span>
                      <input
                        type="number"
                        min={0}
                        max={totalAttending}
                        value={dietaryNonVeg}
                        onChange={(e) => setDietaryNonVeg(parseInt(e.target.value) || 0)}
                        className="w-16 mx-auto px-2 py-1 text-center rounded-lg border border-rose-300 font-bold text-xs bg-white"
                      />
                    </div>

                    <div className="p-3 rounded-2xl border border-amber-200 bg-amber-50/40 text-center">
                      <span className="text-xs font-bold text-amber-900 block mb-1">🟡 Jain</span>
                      <input
                        type="number"
                        min={0}
                        max={totalAttending}
                        value={dietaryJain}
                        onChange={(e) => setDietaryJain(parseInt(e.target.value) || 0)}
                        className="w-16 mx-auto px-2 py-1 text-center rounded-lg border border-amber-300 font-bold text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional event-type specific options */}
                {isPooja && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Mahaprasad Boxes Required for Family
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={prasadCount}
                      onChange={(e) => setPrasadCount(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                )}

                {isBirthday && children > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Children Age(s) for Playzone & Activity Passes
                    </label>
                    <input
                      type="text"
                      value={birthdayAges}
                      onChange={(e) => setBirthdayAges(e.target.value)}
                      placeholder="E.g. Age 4 and Age 7"
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Expected Arrival Time (Optional)
                  </label>
                  <input
                    type="text"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    placeholder="E.g. Around 7:30 PM for Dinner"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>
            )}

            {/* Personal Warm Wishes to Hosts */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Warm Wishes & Blessings for the Host Family (Optional)
              </label>
              <textarea
                rows={3}
                value={guestWishes}
                onChange={(e) => setGuestWishes(e.target.value)}
                placeholder="Write a message of love, congratulations or blessings..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />
              {submitting ? 'Submitting...' : submitted ? 'Update My Confirmation' : 'Submit RSVP Confirmation'}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-stone-400">
          Powered by <b>UtsavSetu (उत्सवसेतु)</b> • Safe & private RSVP confirmation
        </p>
      </div>
    </div>
  );
};

