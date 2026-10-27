import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvent } from '../context/EventContext';
import { ApiService } from '../services/api';
import { EventTypeBadge } from '../components/EventTypeBadge';
import {
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  Send,
  Palette,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ListTodo
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { activeEvent, activeConfig } = useEvent();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState<Array<{ text: string; done: boolean }>>([]);

  useEffect(() => {
    if (activeEvent) {
      setLoading(true);
      ApiService.getEventDashboardAnalytics(activeEvent.id)
        .then((data) => {
          setAnalytics(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      // Load checklist from config
      if (activeConfig?.default_checklist) {
        setChecklist(
          activeConfig.default_checklist.map((item, idx) => ({
            text: item,
            done: idx < 2, // Pre-check first two as initialized
          }))
        );
      }
    }
  }, [activeEvent, activeConfig]);

  const toggleChecklist = (index: number) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, done: !item.done } : item))
    );
  };

  if (!activeEvent) {
    return (
      <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-3xl border border-[#D4AF37]/30 shadow-sm space-y-4">
        <Sparkles className="w-10 h-10 text-[#D4AF37] mx-auto" />
        <h3 className="text-lg font-bold text-stone-900 font-serif">No Event Selected</h3>
        <p className="text-xs text-stone-500">
          Create your first celebration or switch to an existing event to view live insights.
        </p>
        <Link
          to="/events/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] text-white text-xs font-bold shadow-md hover:bg-[#580c1f] transition"
        >
          Create First Celebration
        </Link>
      </div>
    );
  }

  const stats = analytics?.stats || {
    total_invited_families: 0,
    total_invited_headcount: 0,
    confirmed_families_count: 0,
    declined_families_count: 0,
    maybe_families_count: 0,
    awaiting_families_count: 0,
    confirmed_adults: 0,
    confirmed_children: 0,
    expected_attendees: 0,
    response_rate_percent: 0,
    actual_checked_in_attendees: 0,
    walk_in_attendees: 0,
    dietary: { veg: 0, non_veg: 0, jain: 0 },
    budget: { target_budget: 0, spent_budget: 0, allocated_budget: 0, remaining_budget: 0, cost_per_expected_attendee: 0 }
  };

  const rsvpPieData = [
    { name: 'Confirmed', value: stats.confirmed_families_count, color: '#16A34A' },
    { name: 'Awaiting', value: stats.awaiting_families_count, color: '#F59E0B' },
    { name: 'Maybe', value: stats.maybe_families_count, color: '#38BDF8' },
    { name: 'Declined', value: stats.declined_families_count, color: '#EF4444' },
  ].filter((d) => d.value > 0);

  const dietaryBarData = [
    { category: 'Vegetarian', count: stats.dietary.veg, fill: '#16A34A' },
    { category: 'Non-Vegetarian', count: stats.dietary.non_veg, fill: '#DC2626' },
    { category: 'Jain', count: stats.dietary.jain, fill: '#D97706' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Event Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[#D4AF37]/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <EventTypeBadge type={activeEvent.event_type} />
            <span className="text-xs text-stone-500 font-medium">🗓️ {activeEvent.date}</span>
            {activeEvent.time && <span className="text-xs text-stone-500">• ⏰ {activeEvent.time}</span>}
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">{activeEvent.title}</h1>
          <p className="text-xs text-stone-600">
            📍 {activeEvent.venue_name}, {activeEvent.venue_address} • Hosted by: <b>{activeEvent.host_names}</b>
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/invitation-studio"
            className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4ECE1] text-[#800020] border border-[#D4AF37]/40 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Palette className="w-3.5 h-3.5" /> Studio
          </Link>
          <Link
            to="/whatsapp"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <Send className="w-3.5 h-3.5" /> Send Invites
          </Link>
          <Link
            to="/attendance"
            className="px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <UserCheck className="w-3.5 h-3.5" /> Check-in Staff
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-medium">
            <span>Total Invited</span>
            <Users className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-serif">
            {stats.total_invited_families} <span className="text-xs font-sans text-stone-400 font-normal">families</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Headcount: ~{stats.total_invited_headcount} guests
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-500/30 shadow-xs space-y-1 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-medium">
            <span>Confirmed RSVPs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-950 font-serif">
            {stats.expected_attendees} <span className="text-xs font-sans text-emerald-700 font-normal">attendees</span>
          </div>
          <p className="text-[11px] text-emerald-700">
            {stats.confirmed_adults} Adults • {stats.confirmed_children} Children
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-500/30 shadow-xs space-y-1 bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 text-xs font-medium">
            <span>Awaiting Response</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950 font-serif">
            {stats.awaiting_families_count} <span className="text-xs font-sans text-amber-700 font-normal">pending</span>
          </div>
          <p className="text-[11px] text-amber-700">
            Response Rate: {stats.response_rate_percent}%
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#D4AF37]/40 shadow-xs space-y-1 bg-gradient-to-br from-white to-[#FAF7F2]">
          <div className="flex items-center justify-between text-stone-700 text-xs font-medium">
            <span>Actual Checked-In</span>
            <UserCheck className="w-4 h-4 text-[#800020]" />
          </div>
          <div className="text-2xl font-bold text-stone-900 font-serif">
            {stats.actual_checked_in_attendees} <span className="text-xs font-sans text-stone-500 font-normal">arrived</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Walk-ins recorded: {stats.walk_in_attendees}
          </p>
        </div>
      </div>

      {/* Charts & Food Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RSVP Status Chart */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 font-serif">RSVP Status Breakdown</h3>
            <span className="text-xs text-stone-400 font-medium">{stats.total_invited_families} total</span>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            {rsvpPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rsvpPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {rsvpPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-stone-400">No RSVP data yet</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-stone-600">Confirmed: <b>{stats.confirmed_families_count}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-stone-600">Awaiting: <b>{stats.awaiting_families_count}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span className="text-stone-600">Maybe: <b>{stats.maybe_families_count}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-stone-600">Declined: <b>{stats.declined_families_count}</b></span>
            </div>
          </div>
        </div>

        {/* Dietary Preferences Chart */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900 font-serif">Meal Preferences</h3>
            <UtensilsCrossed className="w-4 h-4 text-stone-400" />
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dietaryBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center bg-[#FAF7F2] p-3 rounded-xl border border-[#D4AF37]/20 text-xs">
            <span className="text-stone-600 font-medium">Expected Headcount:</span>
            <span className="font-bold text-[#800020] text-sm">{stats.expected_attendees} meals</span>
          </div>
        </div>

        {/* Budget Snapshot & Food Calculator Quick Card */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-stone-900 font-serif">Budget & Catering</h3>
              <Wallet className="w-4 h-4 text-stone-400" />
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-stone-600 mb-1">
                  <span>Target Budget</span>
                  <span className="font-bold">₹{stats.budget.target_budget?.toLocaleString('en-IN') || 0}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#800020] h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, ((stats.budget.spent_budget || 0) / (stats.budget.target_budget || 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-stone-50 rounded-xl text-xs">
                <div>
                  <span className="text-stone-400 text-[10px] uppercase">Spent So Far</span>
                  <p className="font-bold text-stone-900">₹{stats.budget.spent_budget?.toLocaleString('en-IN') || 0}</p>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] uppercase">Cost per Attendee</span>
                  <p className="font-bold text-emerald-800">₹{stats.budget.cost_per_expected_attendee || 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/budget"
              className="w-full py-2.5 px-4 rounded-xl border border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" /> Food Planning & Buffer Calculator <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Event-Tailored Checklist & Smart Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dynamic Checklist */}
        <div className="p-6 rounded-3xl bg-white border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#800020]" />
              <h3 className="text-sm font-bold text-stone-900 font-serif">
                {activeConfig?.badge || 'Event'} Planning Checklist
              </h3>
            </div>
            <span className="text-xs text-stone-400 font-medium">
              {checklist.filter((c) => c.done).length} / {checklist.length} completed
            </span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {checklist.map((item, idx) => (
              <label
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                  item.done ? 'bg-emerald-50/50 border-emerald-200 text-stone-500' : 'bg-[#FAF7F2] border-stone-200 text-stone-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleChecklist(idx)}
                  className="mt-0.5 rounded text-[#800020] focus:ring-[#800020]"
                />
                <span className={`text-xs ${item.done ? 'line-through' : 'font-medium'}`}>{item.text}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Smart Recommendations Action Box */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FAF7F2] to-amber-50/40 border border-[#D4AF37]/40 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#800020]">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <h3 className="text-sm font-bold font-serif uppercase tracking-wider">AI Assistant Insights</h3>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Based on real event responses: <b>{stats.awaiting_families_count} families</b> are awaiting confirmation. Sending a polite WhatsApp reminder now will save estimated catering cost overages.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <Link
              to="/smart-assist"
              className="flex-1 py-2.5 px-4 rounded-xl bg-white border border-stone-200 hover:border-[#800020] text-stone-800 font-bold text-xs text-center shadow-xs transition"
            >
              View All 5 Recommendations
            </Link>
            <Link
              to="/whatsapp"
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white font-bold text-xs text-center shadow-sm transition"
            >
              Send Reminders Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

