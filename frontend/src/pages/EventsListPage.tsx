import React from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import { EventTypeBadge } from '../components/EventTypeBadge';
import {
  CalendarDays,
  PlusCircle,
  MapPin,
  Clock,
  Trash2,
  ArrowRight,
  Sparkles,
  Check
} from 'lucide-react';

export const EventsListPage: React.FC = () => {
  const { events, activeEvent, setActiveEventId, refreshEvents } = useEvent();
  const { showToast } = useToast();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete '${title}' and its associated records?`)) return;
    try {
      await ApiService.deleteEvent(id);
      showToast(`Deleted '${title}'`, 'info');
      refreshEvents();
    } catch {
      showToast('Could not delete celebration', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
            Multi-Event Manager
          </span>
          <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            My Celebrations ({events.length})
          </h1>
        </div>

        <Link
          to="/events/create"
          className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-[#D4AF37]" /> Create New Celebration
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt) => {
          const isActive = activeEvent?.id === evt.id;
          return (
            <div
              key={evt.id}
              className={`p-6 rounded-3xl border transition flex flex-col justify-between space-y-4 shadow-xs ${
                isActive
                  ? 'bg-white border-[#800020] ring-2 ring-[#800020]/20'
                  : 'bg-white border-stone-200 hover:border-[#D4AF37]'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <EventTypeBadge type={evt.event_type} />
                  {isActive && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active Celebration
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-base text-stone-900 font-serif leading-snug">{evt.title}</h3>
                
                <div className="space-y-1 text-xs text-stone-500">
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-stone-400" /> {evt.date} {evt.time ? `• ${evt.time}` : ''}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" /> {evt.venue_name}, {evt.venue_address}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between">
                <button
                  onClick={() => handleDelete(evt.id, evt.title)}
                  className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {isActive ? (
                  <Link
                    to="/dashboard"
                    className="px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#580c1f] transition shadow-xs flex items-center gap-1.5"
                  >
                    Open Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => setActiveEventId(evt.id)}
                    className="px-4 py-2 rounded-xl border border-stone-300 hover:border-[#800020] text-stone-800 text-xs font-bold transition cursor-pointer"
                  >
                    Switch to this Celebration
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="p-12 text-center text-stone-400 bg-white rounded-3xl border space-y-3">
          <p className="text-sm font-bold text-stone-700">No events yet.</p>
          <Link
            to="/events/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold"
          >
            Create Your First Event
          </Link>
        </div>
      )}
    </div>
  );
};

