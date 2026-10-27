import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { EventType } from '../types';
import {
  Heart,
  Sparkles,
  Cake,
  Flame,
  Award,
  Home,
  Smile,
  PartyPopper,
  ArrowRight,
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  Check
} from 'lucide-react';

export const CreateEventWizard: React.FC = () => {
  const { eventConfigs, createEvent } = useEvent();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2026-12-25');
  const [time, setTime] = useState('18:30');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [mapUrl, setMapUrl] = useState('');
  const [hostNames, setHostNames] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [description, setDescription] = useState('');

  // Event specific
  const [primaryPerson, setPrimaryPerson] = useState('');
  const [secondaryPerson, setSecondaryPerson] = useState('');
  const [birthdayAge, setBirthdayAge] = useState<number | undefined>(undefined);
  const [anniversaryYears, setAnniversaryYears] = useState<number | undefined>(undefined);
  const [poojaName, setPoojaName] = useState('');
  const [muhuratTime, setMuhuratTime] = useState('');
  const [prasadOffering, setPrasadOffering] = useState('');
  const [houseName, setHouseName] = useState('');
  const [targetBudget, setTargetBudget] = useState(250000);
  const [rsvpDeadline, setRsvpDeadline] = useState('2026-12-10');

  const selectedConfig = eventConfigs[eventType];

  const handleSelectType = (type: EventType) => {
    setEventType(type);
    const cfg = eventConfigs[type];
    if (cfg) {
      setTitle(cfg.default_title);
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createEvent({
        title: title || `${selectedConfig?.badge || 'Celebration'} of ${primaryPerson || 'Our Family'}`,
        event_type: eventType,
        date,
        time,
        venue_name: venueName || 'Grand Banquet Hall',
        venue_address: venueAddress || `${city}, India`,
        map_url: mapUrl,
        host_names: hostNames || 'The Host Family',
        city,
        description,
        primary_person_name: primaryPerson,
        secondary_person_name: secondaryPerson,
        birthday_age: birthdayAge,
        anniversary_years: anniversaryYears,
        pooja_name: poojaName,
        muhurat_time: muhuratTime,
        prasad_offering: prasadOffering,
        house_name: houseName,
        target_budget: targetBudget,
        rsvp_deadline: rsvpDeadline,
      });

      showToast(`'${created.title}' created successfully!`, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Failed to create celebration', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const eventTypesList: Array<{ type: EventType; title: string; desc: string; icon: any; color: string }> = [
    { type: 'wedding', title: 'Wedding Celebration (विवाह)', desc: 'Bride & groom, multi-day ceremonies, royal catering, family groups', icon: Heart, color: 'text-[#800020]' },
    { type: 'engagement', title: 'Engagement / Ring Ceremony (सगाई)', desc: 'Couple ring exchange, cocktail party, romantic themes', icon: Sparkles, color: 'text-pink-600' },
    { type: 'birthday', title: 'Birthday Bash (जन्मदिन)', desc: 'Kids & adult counts, superhero or party themes, cake planning', icon: Cake, color: 'text-sky-600' },
    { type: 'pooja', title: 'Pooja & Religious Ceremony', desc: 'Satyanarayan, Havan, auspicious muhurat, prasad & satvik meals', icon: Flame, color: 'text-amber-600' },
    { type: 'housewarming', title: 'Griha Pravesh (गृह प्रवेश)', desc: 'New house blessing, Vastu pooja, Google maps directions', icon: Home, color: 'text-emerald-700' },
    { type: 'anniversary', title: 'Wedding Anniversary', desc: 'Silver, Golden or yearly marital milestones, banquet celebrations', icon: Award, color: 'text-purple-700' },
    { type: 'baby_shower', title: 'Baby Shower / Godh Bharai', desc: 'Maternity rituals, pastel invitations, baby shower games', icon: Smile, color: 'text-rose-600' },
    { type: 'naming_ceremony', title: 'Namkaran (नामकरण संस्कार)', desc: 'Astrological naming ritual, cradle ceremony, family feast', icon: Sparkles, color: 'text-teal-700' },
    { type: 'other', title: 'Custom Indian Celebration', desc: 'Retirement, graduation, reunion, festival or community gathering', icon: PartyPopper, color: 'text-stone-700' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Wizard Header Progress */}
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#800020]">
          Event-Aware Creation Wizard
        </span>
        <h1 className="text-3xl font-extrabold font-serif text-stone-900">
          Create New Celebration
        </h1>
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex items-center gap-2 text-xs font-semibold ${
                step >= s ? 'text-[#800020]' : 'text-stone-400'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s ? 'bg-[#800020] text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {step > s ? <Check className="w-3.5 h-3.5" /> : s}
              </div>
              <span className="hidden sm:inline">
                {s === 1 ? 'Celebration Type' : s === 2 ? 'Adapted Details' : 'Venue & Budget'}
              </span>
              {s < 3 && <span className="text-stone-300">──</span>}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Select Event Type */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="text-center">
            <h2 className="text-xl font-bold font-serif text-stone-800">
              Which ceremony or celebration are you organizing?
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Select the event type. UtsavSetu will automatically configure appropriate invitation templates, fields, and budget calculators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {eventTypesList.map((item) => (
              <button
                key={item.type}
                onClick={() => handleSelectType(item.type)}
                className={`p-5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between h-44 hover:shadow-md ${
                  eventType === item.type
                    ? 'bg-[#FAF7F2] border-[#800020] shadow-sm ring-2 ring-[#800020]/20'
                    : 'bg-white border-stone-200 hover:border-[#D4AF37]'
                }`}
              >
                <div>
                  <item.icon className={`w-8 h-8 ${item.color} mb-3`} />
                  <h3 className="font-bold text-sm text-stone-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
                <div className="flex items-center text-xs font-bold text-[#800020] gap-1 mt-2">
                  Select <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Adapted Event Details */}
      {step === 2 && (
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-md space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900">
                {selectedConfig?.name || 'Celebration'} Details
              </h2>
              <p className="text-xs text-stone-500">
                Fields are tailored specifically for your {selectedConfig?.badge || 'event'}.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Change Type
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Event Title / Banner
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Grand Wedding Celebration of Rahul & Ananya"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs font-medium"
              />
            </div>

            {/* Dynamic primary person label */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {selectedConfig?.fields.primary_person_label || "Primary Honoree's Name"}
              </label>
              <input
                type="text"
                required
                value={primaryPerson}
                onChange={(e) => setPrimaryPerson(e.target.value)}
                placeholder="E.g. Ananya Verma"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            {/* Dynamic secondary person label */}
            {selectedConfig?.fields.secondary_person_label && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {selectedConfig.fields.secondary_person_label}
                </label>
                <input
                  type="text"
                  value={secondaryPerson}
                  onChange={(e) => setSecondaryPerson(e.target.value)}
                  placeholder="E.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
                />
              </div>
            )}

            {/* Birthday Age */}
            {selectedConfig?.fields.show_age && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Age Being Celebrated
                </label>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={birthdayAge || ''}
                  onChange={(e) => setBirthdayAge(parseInt(e.target.value) || undefined)}
                  placeholder="E.g. 5"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
                />
              </div>
            )}

            {/* Anniversary Years */}
            {selectedConfig?.fields.show_years && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Anniversary Milestone Years
                </label>
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={anniversaryYears || ''}
                  onChange={(e) => setAnniversaryYears(parseInt(e.target.value) || undefined)}
                  placeholder="E.g. 25 (Silver Jubilee)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
                />
              </div>
            )}

            {/* Pooja Specific Fields */}
            {selectedConfig?.fields.show_muhurat && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Auspicious Muhurat / Panditji Schedule (Optional)
                </label>
                <input
                  type="text"
                  value={muhuratTime}
                  onChange={(e) => setMuhuratTime(e.target.value)}
                  placeholder="E.g. 10:15 AM to 11:45 AM (Supplied by Panditji)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
                />
              </div>
            )}

            {selectedConfig?.fields.show_prasad && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Prasad / Mahaprasad Offerings
                </label>
                <input
                  type="text"
                  value={prasadOffering}
                  onChange={(e) => setPrasadOffering(e.target.value)}
                  placeholder="E.g. Sheera Prasad & Satvik Bhojan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
                />
              </div>
            )}

            {/* House Name */}
            {selectedConfig?.fields.show_house_name && (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  New Home Name / Address Landmark
                </label>
                <input
                  type="text"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="E.g. 'Shree Nivas' Villa 42"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Event Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Host / Family Names
              </label>
              <input
                type="text"
                required
                value={hostNames}
                onChange={(e) => setHostNames(e.target.value)}
                placeholder={selectedConfig?.fields.host_names_placeholder || 'E.g. Mr. & Mrs. Sharma'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              Next: Venue & Budget <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Venue, Budget Target & RSVP Deadline */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-md space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900">
                Venue & Target Budget
              </h2>
              <p className="text-xs text-stone-500">
                Provide venue information and planning targets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Venue Name / Hall
              </label>
              <input
                type="text"
                required
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="E.g. The Taj Palace Banquets"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                City
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Complete Street Address
              </label>
              <input
                type="text"
                required
                value={venueAddress}
                onChange={(e) => setVenueAddress(e.target.value)}
                placeholder="Apollo Bunder, Colaba, Mumbai 400001"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Google Maps Venue Link (Optional)
              </label>
              <input
                type="url"
                value={mapUrl}
                onChange={(e) => setMapUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Target Budget (INR ₹)
              </label>
              <input
                type="number"
                min={0}
                step={5000}
                value={targetBudget}
                onChange={(e) => setTargetBudget(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                RSVP Confirmation Deadline
              </label>
              <input
                type="date"
                value={rsvpDeadline}
                onChange={(e) => setRsvpDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#800020] text-xs"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold shadow-lg transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              {submitting ? 'Creating Celebration...' : 'Complete & Launch Celebration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

