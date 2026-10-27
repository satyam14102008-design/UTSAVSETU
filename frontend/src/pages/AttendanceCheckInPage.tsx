import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import { EventGuestAssignment, AttendanceSummary, AttendanceRecord } from '../types';
import {
  UserCheck,
  Search,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  UserPlus,
  RefreshCw,
  X,
  Sparkles
} from 'lucide-react';

export const AttendanceCheckInPage: React.FC = () => {
  const { activeEvent } = useEvent();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EventGuestAssignment[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Duplicate Warning Modal
  const [duplicateWarning, setDuplicateWarning] = useState<any | null>(null);

  // Walk-in Modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInAdults, setWalkInAdults] = useState(1);
  const [walkInChildren, setWalkInChildren] = useState(0);

  const loadData = async () => {
    if (!activeEvent) return;
    try {
      const [sum, recs, results] = await Promise.all([
        ApiService.getAttendanceSummary(activeEvent.id),
        ApiService.getAttendanceRecords(activeEvent.id),
        ApiService.searchCheckinGuests(activeEvent.id, query),
      ]);
      setSummary(sum);
      setRecentRecords(recs.slice(-8).reverse());
      setSearchResults(results);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEvent, query]);

  const handleCheckIn = async (assignment: EventGuestAssignment, force = false) => {
    if (!activeEvent) return;
    try {
      const actualA = assignment.confirmed_adults || assignment.invited_adults || 2;
      const actualC = assignment.confirmed_children || assignment.invited_children || 0;

      const res = await ApiService.checkInGuest(activeEvent.id, {
        assignment_id: assignment.id,
        event_id: activeEvent.id,
        guest_name: assignment.primary_name,
        family_name: assignment.family_name,
        phone: assignment.phone,
        actual_adults: actualA,
        actual_children: actualC,
        is_walk_in: false,
        force_override: force,
      });

      if (res.is_duplicate && !force) {
        setDuplicateWarning({
          assignment,
          message: res.message,
          existing_record: res.existing_record,
        });
      } else {
        showToast(res.message, 'success');
        setDuplicateWarning(null);
        loadData();
      }
    } catch (err: any) {
      showToast(err.message || 'Check-in failed', 'error');
    }
  };

  const handleRegisterWalkIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEvent || !walkInName) return;
    try {
      const res = await ApiService.checkInGuest(activeEvent.id, {
        assignment_id: null,
        event_id: activeEvent.id,
        guest_name: walkInName,
        family_name: `${walkInName} (Walk-in)`,
        phone: walkInPhone,
        actual_adults: walkInAdults,
        actual_children: walkInChildren,
        is_walk_in: true,
        force_override: true,
      });
      showToast(res.message, 'success');
      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Walk-in registration failed', 'error');
    }
  };

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
              Mobile-First Reception
            </span>
            <span className="text-xs text-stone-400">• {activeEvent.title}</span>
          </div>
          <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            Event-Day Front-Desk Attendance Check-In
          </h1>
        </div>

        <button
          onClick={() => setShowWalkInModal(true)}
          className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-[#D4AF37]" /> Register Walk-In Guest
        </button>
      </div>

      {/* Live Check-in KPI Tracker */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-stone-400">Total Confirmed</span>
            <p className="text-xl font-bold font-serif text-stone-900 mt-0.5">
              {summary.total_rsvp_confirmed} <span className="text-xs font-sans text-stone-500 font-normal">guests</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-xs bg-gradient-to-br from-white to-emerald-50/20">
            <span className="text-[10px] uppercase font-bold text-emerald-800">Actual Arrived</span>
            <p className="text-xl font-bold font-serif text-emerald-950 mt-0.5">
              {summary.total_actual_attended} <span className="text-xs font-sans text-emerald-700 font-normal">checked in</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-xs bg-gradient-to-br from-white to-amber-50/20">
            <span className="text-[10px] uppercase font-bold text-amber-800">Yet to Arrive</span>
            <p className="text-xl font-bold font-serif text-amber-950 mt-0.5">
              {summary.confirmed_not_arrived} <span className="text-xs font-sans text-amber-700 font-normal">pending</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/50 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-[#800020]">Attendance Rate</span>
            <p className="text-xl font-bold font-serif text-[#800020] mt-0.5">
              {summary.attendance_rate_percentage}%
            </p>
          </div>
        </div>
      )}

      {/* Big Search Input for Front-Desk Staff */}
      <div className="relative">
        <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Family Name, Contact Person, Phone, or QR code token..."
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-stone-200 focus:border-[#800020] bg-white text-sm font-semibold shadow-xs outline-none transition"
        />
      </div>

      {/* Guest Check-in Cards */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
          Matching Guests ({searchResults.length})
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {searchResults.map((a) => {
            const isArrived = a.is_checked_in;
            const headcount = (a.confirmed_adults || a.invited_adults) + (a.confirmed_children || 0);

            return (
              <div
                key={a.id}
                className={`p-4 rounded-2xl border transition flex items-center justify-between gap-3 shadow-xs ${
                  isArrived
                    ? 'bg-emerald-50/50 border-emerald-300 text-stone-800'
                    : 'bg-white border-stone-200 hover:border-[#D4AF37]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm text-stone-900">{a.family_name}</p>
                    <span className="text-[10px] bg-stone-100 text-stone-700 px-2 py-0.5 rounded font-semibold">
                      {a.relation_group}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {a.primary_name} • {a.phone}
                  </p>
                  <p className="text-[11px] font-medium text-stone-600 mt-1">
                    RSVP: <b className="uppercase">{a.rsvp_status || 'awaiting'}</b> • Headcount: <b>{headcount} guests</b>
                  </p>
                </div>

                <div>
                  {isArrived ? (
                    <button
                      onClick={() => handleCheckIn(a, false)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Checked ({a.checked_in_count})
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCheckIn(a, false)}
                      className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4 text-[#D4AF37]" /> Check In
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {searchResults.length === 0 && (
          <div className="p-8 text-center text-xs text-stone-400 bg-white rounded-2xl border">
            No matching guests found. Use the "Register Walk-In Guest" button if they arrived without prior RSVP.
          </div>
        )}
      </div>

      {/* Duplicate Check-in Prevention Modal */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-amber-400 space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-stone-900">Duplicate Check-In Detected</h3>
                <p className="text-xs text-stone-500">Accidental duplicate prevention warning</p>
              </div>
            </div>

            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
              <p className="font-bold">{duplicateWarning.message}</p>
              <p className="text-[11px] text-amber-800">
                Preventing double-counting plates for catering. If the family has returned or headcount changed, you can authorize an update below.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setDuplicateWarning(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold text-stone-600 hover:bg-stone-50"
              >
                Keep Existing Check-In
              </button>
              <button
                type="button"
                onClick={() => handleCheckIn(duplicateWarning.assignment, true)}
                className="px-4 py-2 rounded-xl bg-[#800020] text-white text-xs font-bold hover:bg-[#580c1f] shadow-md transition"
              >
                Authorize Overwrite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Walk-in Registration */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">Register Walk-In Guest</h3>
              <button onClick={() => setShowWalkInModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterWalkIn} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Guest / Family Name</label>
                <input
                  type="text"
                  required
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                  placeholder="E.g. Vikramaditya Rathore"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={walkInPhone}
                  onChange={(e) => setWalkInPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Adults Count</label>
                  <input
                    type="number"
                    min={1}
                    value={walkInAdults}
                    onChange={(e) => setWalkInAdults(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Children Count</label>
                  <input
                    type="number"
                    min={0}
                    value={walkInChildren}
                    onChange={(e) => setWalkInChildren(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWalkInModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#800020] text-white font-bold text-xs shadow-md hover:bg-[#580c1f] transition cursor-pointer"
                >
                  Register & Check In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

