import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import { EventGuestAssignment, RSVPResponseDetail } from '../types';
import {
  CheckCircle2,
  Clock,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  UtensilsCrossed,
  MessageSquare,
  Users,
  Download
} from 'lucide-react';

export const RSVPTrackingPage: React.FC = () => {
  const { activeEvent } = useEvent();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<EventGuestAssignment[]>([]);
  const [responses, setResponses] = useState<RSVPResponseDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  const loadData = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const [aList, rList] = await Promise.all([
        ApiService.getEventAssignments(activeEvent.id),
        ApiService.getEventRSVPResponses(activeEvent.id),
      ]);
      setAssignments(aList);
      setResponses(rList);
    } catch {
      showToast('Could not load RSVP tracking data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEvent]);

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event.</div>;
  }

  // Combine assignment with detailed response
  const responseMap = new Map(responses.map((r) => [r.assignment_id, r]));

  const filtered = assignments.filter((a) => {
    const statusMatch = filterStatus === 'all' || a.rsvp_status === filterStatus;
    const searchMatch =
      a.family_name.toLowerCase().includes(search.toLowerCase()) ||
      a.primary_name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search);
    return statusMatch && searchMatch;
  });

  const confirmedCount = assignments.filter((a) => a.rsvp_status === 'confirmed').length;
  const awaitingCount = assignments.filter((a) => a.rsvp_status === 'awaiting').length;
  const declinedCount = assignments.filter((a) => a.rsvp_status === 'declined').length;
  const maybeCount = assignments.filter((a) => a.rsvp_status === 'maybe').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
              Attendance Confirmations
            </span>
            <span className="text-xs text-stone-400">• {activeEvent.title}</span>
          </div>
          <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            RSVP Response Tracker & Headcounts
          </h1>
        </div>

        <a
          href={`/api/v1/reports/events/${activeEvent.id}/guests.csv`}
          download
          className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-stone-500" /> Export CSV Roster
        </a>
      </div>

      {/* Filter Tabs / Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'all', label: 'All Invitees', count: assignments.length, color: 'border-stone-200 text-stone-800' },
          { id: 'confirmed', label: 'Confirmed', count: confirmedCount, color: 'border-emerald-300 text-emerald-800 bg-emerald-50/30' },
          { id: 'awaiting', label: 'Awaiting Response', count: awaitingCount, color: 'border-amber-300 text-amber-800 bg-amber-50/30' },
          { id: 'declined', label: 'Declined', count: declinedCount, color: 'border-rose-300 text-rose-800 bg-rose-50/30' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
              filterStatus === tab.id ? 'ring-2 ring-[#800020] bg-white shadow-xs' : tab.color
            }`}
          >
            <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">{tab.label}</p>
            <p className="text-xl font-bold font-serif mt-0.5">{tab.count}</p>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by guest name, family name or phone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs focus:outline-none focus:border-[#800020]"
        />
      </div>

      {/* RSVP Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-[#FAF7F2] text-stone-800 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-3 px-4">Family / Guest Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confirmed Headcount</th>
                <th className="py-3 px-4">Meals (Veg/NV/Jain)</th>
                <th className="py-3 px-4">Arrival Time</th>
                <th className="py-3 px-4">Special Requests / Wishes</th>
                <th className="py-3 px-4 text-right">Event Day Check-in</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((a) => {
                const detail = responseMap.get(a.id);
                const isConfirmed = a.rsvp_status === 'confirmed';

                return (
                  <tr key={a.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{a.family_name}</p>
                      <p className="text-[11px] text-stone-500">{a.primary_name} • {a.phone}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isConfirmed
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : a.rsvp_status === 'declined'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : a.rsvp_status === 'maybe'
                            ? 'bg-sky-50 text-sky-800 border border-sky-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {a.rsvp_status || 'awaiting'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {isConfirmed ? (
                        <span>
                          {(a.confirmed_adults || 0) + (a.confirmed_children || 0)} total{' '}
                          <span className="text-[10px] text-stone-400 font-normal">
                            ({a.confirmed_adults || 0}A, {a.confirmed_children || 0}C)
                          </span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isConfirmed ? (
                        <div className="space-y-0.5 text-[11px]">
                          {a.dietary_veg ? <span className="text-emerald-700 font-medium mr-2">🟢 {a.dietary_veg} Veg</span> : null}
                          {a.dietary_non_veg ? <span className="text-rose-700 font-medium mr-2">🔴 {a.dietary_non_veg} NV</span> : null}
                          {a.dietary_jain ? <span className="text-amber-700 font-medium">🟡 {a.dietary_jain} Jain</span> : null}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-[11px]">
                      {a.arrival_time ? `⏰ ${a.arrival_time}` : 'Standard'}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      {detail?.guest_wishes ? (
                        <p className="text-[11px] text-stone-700 italic truncate" title={detail.guest_wishes}>
                          "{detail.guest_wishes}"
                        </p>
                      ) : (
                        <span className="text-[10px] text-stone-400">No notes</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {a.is_checked_in ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Checked In ({a.checked_in_count})
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Not arrived</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-400">
            No RSVPs match this filter.
          </div>
        )}
      </div>
    </div>
  );
};

