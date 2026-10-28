import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import { EventGuestAssignment, WhatsAppMessageLog } from '../types';
import {
  Send,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Settings,
  Share2
} from 'lucide-react';
import { ShareModal } from '../components/ShareModal';
import { generateShareableInvitationUrl } from '../services/shareUrlHelper';

export const InvitationsWhatsAppPage: React.FC = () => {
  const { activeEvent } = useEvent();
  const { showToast } = useToast();

  const [assignments, setAssignments] = useState<EventGuestAssignment[]>([]);
  const [logs, setLogs] = useState<WhatsAppMessageLog[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<'invitation' | 'reminder' | 'thank_you' | 'venue_update'>('invitation');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<{ guestName?: string; rsvpToken?: string } | null>(null);

  const loadData = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const [aList, lList] = await Promise.all([
        ApiService.getEventAssignments(activeEvent.id),
        ApiService.getWhatsAppLogs(activeEvent.id),
      ]);
      setAssignments(aList);
      setLogs(lList);
    } catch {
      showToast('Could not load WhatsApp dispatch records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEvent]);

  const handleSendSingle = async (assignment: EventGuestAssignment) => {
    if (!activeEvent) return;
    try {
      await ApiService.sendSingleWhatsApp(
        activeEvent.id,
        assignment.id,
        selectedTemplate,
        customNote,
        true // Demo mode
      );
      showToast(`Invited ${assignment.family_name}! Opening WhatsApp...`, 'success');
      loadData();

      // Open WhatsApp directly for user with pre-filled ceremonial invitation
      const cleanDigits = assignment.phone.replace(/[^0-9]/g, '');
      const formattedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
      const sampleUrl = `${window.location.origin}/rsvp/${assignment.rsvp_token}`;
      const prefilledMsg = `Namaste ${assignment.primary_name} ji! 🙏✨\n\nYou and your family are warmly invited to:\n*${activeEvent.title}*\n\n📅 Date: ${activeEvent.date}\n📍 Venue: ${activeEvent.venue_name}\n\nPlease confirm your attendance & meal preferences here:\n👉 ${sampleUrl}`;
      const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(prefilledMsg)}`;
      window.open(waUrl, '_blank');
    } catch (err: any) {
      showToast(err.message || 'Dispatch failed', 'error');
    }
  };

  const handleSendBulk = async () => {
    if (!activeEvent) return;
    // Target awaiting guests
    const targetIds = assignments
      .filter((a) => selectedTemplate === 'reminder' ? a.rsvp_status === 'awaiting' : true)
      .map((a) => a.id);

    if (targetIds.length === 0) {
      showToast('No eligible guests found for this broadcast.', 'info');
      return;
    }

    setSendingBulk(true);
    try {
      const res = await ApiService.sendBulkWhatsApp(
        activeEvent.id,
        targetIds,
        selectedTemplate,
        customNote,
        true
      );
      showToast(`Broadcast completed: ${res.total_dispatched} invitations queued/delivered!`, 'success');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Broadcast failed', 'error');
    } finally {
      setSendingBulk(false);
    }
  };

  const copyMessageText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event.</div>;
  }

  const awaitingCount = assignments.filter((a) => a.rsvp_status === 'awaiting').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Demo Mode Notice */}
      <div className="bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
                WhatsApp Messaging Center
              </span>
              <span className="text-xs text-stone-400">• {activeEvent.title}</span>
            </div>
            <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
              WhatsApp Invitations & RSVP Reminders
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setShareTarget({ guestName: '', rsvpToken: '' })}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-stone-900" /> Share on WhatsApp, Insta & Apps
            </button>
            <button
              onClick={handleSendBulk}
              disabled={sendingBulk}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sendingBulk ? 'Broadcasting...' : `Broadcast to ${awaitingCount} Awaiting Guests`}
            </button>
          </div>
        </div>

        {/* Clear Demo Mode Disclaimer */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300/70 flex items-start gap-3 text-xs text-amber-900">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">WhatsApp Demo Environment Active</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              No Meta Cloud API credentials are required for local testing. Click <b>"Open WhatsApp (wa.me)"</b> on any guest to trigger the real prefilled chat on WhatsApp Web, or click <b>"Simulate Send"</b> to generate tracked delivery statuses for demo verification.
            </p>
          </div>
        </div>
      </div>

      {/* Template Chooser & Message Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold font-serif text-sm text-stone-900">1. Select Message Template</h3>
          <div className="space-y-2">
            {[
              { id: 'invitation', label: 'Wedding / Event Invitation', desc: 'Cordially invites family with personalized RSVP link' },
              { id: 'reminder', label: 'RSVP Follow-Up Reminder', desc: 'Gentle nudge for awaiting responses before catering deadline' },
              { id: 'thank_you', label: 'Post-Event Thank You', desc: 'Gratitude for attending and blessings received' },
              { id: 'venue_update', label: 'Venue & Schedule Update', desc: 'Directions, parking, or timing updates' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id as any)}
                className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer ${
                  selectedTemplate === t.id
                    ? 'border-[#800020] bg-[#FAF7F2] ring-1 ring-[#800020]'
                    : 'border-stone-200 hover:bg-stone-50'
                }`}
              >
                <p className="font-bold text-xs text-stone-900">{t.label}</p>
                <p className="text-[10px] text-stone-500 mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Add Personal Note to Message (Optional)
            </label>
            <textarea
              rows={2}
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="E.g. We look forward to meeting you all after so long!"
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
            />
          </div>
        </div>

        {/* Guest Dispatch Roster */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-sm text-stone-900">
              2. Individual WhatsApp Dispatch ({assignments.length} families)
            </h3>
            <span className="text-xs text-stone-400">
              {awaitingCount} awaiting response
            </span>
          </div>

          <div className="max-h-[500px] overflow-y-auto divide-y divide-stone-100">
            {assignments.map((a) => {
              const cleanDigits = a.phone.replace(/[^0-9]/g, '');
              const formattedPhone = cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;
              const sampleUrl = generateShareableInvitationUrl(window.location.origin, activeEvent, null, a.rsvp_token);
              const prefilledMsg = `Namaste ${a.primary_name} ji! 🙏✨\n\nYou and your family are warmly invited to:\n*${activeEvent.title}*\n\n📅 Date: ${activeEvent.date}\n📍 Venue: ${activeEvent.venue_name}\n\nPlease confirm your attendance & meal preferences here:\n👉 ${sampleUrl}`;
              const waLink = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(prefilledMsg)}`;

              return (
                <div key={a.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 p-2 rounded-2xl transition">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-xs text-stone-900">{a.family_name}</p>
                      <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md font-medium">
                        {a.relation_group}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      {a.primary_name} • {a.phone} • Status: <b className="uppercase">{a.rsvp_status || 'awaiting'}</b>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Share Modal Trigger */}
                    <button
                      onClick={() => setShareTarget({ guestName: a.primary_name, rsvpToken: a.rsvp_token })}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="Share on WhatsApp, Insta, Telegram"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>

                    {/* Copy message */}
                    <button
                      onClick={() => copyMessageText(prefilledMsg, a.id)}
                      className="px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-[11px] font-semibold flex items-center gap-1 transition text-stone-700 cursor-pointer"
                      title="Copy invitation text"
                    >
                      {copiedId === a.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === a.id ? 'Copied' : 'Copy'}
                    </button>

                    {/* Real WhatsApp button */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" /> Open WhatsApp
                    </a>

                    {/* Simulate Send (Demo mode verification) */}
                    <button
                      onClick={() => handleSendSingle(a)}
                      className="px-3 py-1.5 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-[11px] font-bold transition shadow-xs cursor-pointer"
                    >
                      Simulate Send
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* WhatsApp Message Logs History */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-xs space-y-3">
        <h3 className="font-bold font-serif text-sm text-stone-900">
          Delivery Status & Message Audit Log ({logs.length} messages)
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-[#FAF7F2] text-stone-800 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-3">Recipient</th>
                <th className="py-2.5 px-3">Phone</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-stone-50/60">
                  <td className="py-2.5 px-3 font-semibold text-stone-900">{l.guest_name}</td>
                  <td className="py-2.5 px-3 font-mono text-[11px]">{l.phone}</td>
                  <td className="py-2.5 px-3 uppercase text-[10px] font-bold text-stone-700">{l.template_type}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ✓ {l.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium">
                      {l.is_demo ? 'Demo Simulation' : 'Verified Cloud API'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-stone-400">{l.sent_at.slice(0, 16).replace('T', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 && (
            <p className="text-center py-6 text-xs text-stone-400">
              No WhatsApp messages logged yet. Click 'Simulate Send' or 'Broadcast' above.
            </p>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {shareTarget && (
        <ShareModal
          isOpen={!!shareTarget}
          onClose={() => setShareTarget(null)}
          event={activeEvent}
          guestName={shareTarget.guestName}
          rsvpToken={shareTarget.rsvpToken}
        />
      )}
    </div>
  );
};

