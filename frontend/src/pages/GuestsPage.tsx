import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import { GuestContact, EventGuestAssignment } from '../types';
import { QRModal } from '../components/QRModal';
import {
  Users,
  UserPlus,
  UploadCloud,
  Download,
  Search,
  Filter,
  Trash2,
  Edit2,
  Check,
  Send,
  QrCode,
  Sparkles,
  X,
  FileSpreadsheet
} from 'lucide-react';

export const GuestsPage: React.FC = () => {
  const { activeEvent } = useEvent();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'assigned' | 'directory'>('assigned');
  const [contacts, setContacts] = useState<GuestContact[]>([]);
  const [assignments, setAssignments] = useState<EventGuestAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [selectedQrGuest, setSelectedQrGuest] = useState<{ token: string; name: string } | null>(null);

  // New Contact Form
  const [formData, setFormData] = useState<Partial<GuestContact>>({
    family_name: '',
    primary_name: '',
    phone: '',
    email: '',
    city: 'Mumbai',
    relation_group: 'Family',
    adults_count: 2,
    children_count: 0,
    notes: '',
  });

  const loadData = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const [cList, aList] = await Promise.all([
        ApiService.listContacts(),
        ApiService.getEventAssignments(activeEvent.id),
      ]);
      setContacts(cList);
      setAssignments(aList);
    } catch (err) {
      console.error(err);
      showToast('Error loading guest data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEvent]);

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await ApiService.createContact(formData);
      // Auto-assign to current event if active
      if (activeEvent) {
        await ApiService.assignSingleGuest(activeEvent.id, created.id);
      }
      showToast(`Added ${created.family_name} to guests!`, 'success');
      setShowAddModal(false);
      setFormData({
        family_name: '',
        primary_name: '',
        phone: '',
        email: '',
        city: 'Mumbai',
        relation_group: 'Family',
        adults_count: 2,
        children_count: 0,
      });
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add contact', 'error');
    }
  };

  const handleBulkAssign = async () => {
    if (!activeEvent || selectedContactIds.length === 0) return;
    try {
      const res = await ApiService.assignBulkGuests(activeEvent.id, selectedContactIds);
      showToast(`Assigned ${res.assigned_count} families to ${activeEvent.title}!`, 'success');
      setSelectedContactIds([]);
      setActiveTab('assigned');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Bulk assignment failed', 'error');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!activeEvent || !confirm('Remove this family from this event?')) return;
    try {
      await ApiService.removeAssignment(activeEvent.id, assignmentId);
      showToast('Guest unassigned from this event', 'info');
      loadData();
    } catch {
      showToast('Could not remove guest', 'error');
    }
  };

  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;
    setImporting(true);
    try {
      const res = await ApiService.importContactsCsv(csvFile);
      showToast(
        `Imported ${res.imported_count} contacts (${res.duplicate_skipped} duplicates skipped)!`,
        'success'
      );
      setShowCsvModal(false);
      setCsvFile(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event.</div>;
  }

  // Filtered lists
  const filteredAssignments = assignments.filter((a) => {
    const matchSearch =
      a.family_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.primary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.phone.includes(searchQuery);
    const matchGroup = selectedGroup === 'all' || a.relation_group === selectedGroup;
    return matchSearch && matchGroup;
  });

  const assignedGuestIds = new Set(assignments.map((a) => a.guest_id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
              Guest Management
            </span>
            <span className="text-xs text-stone-400">• {activeEvent.title}</span>
          </div>
          <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            Families, Invitee Groups & RSVPs
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCsvModal(true)}
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-stone-500" /> Import CSV
          </button>
          <a
            href={`/api/v1/reports/events/${activeEvent.id}/guests.csv`}
            download
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-500" /> Export CSV
          </a>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#D4AF37]" /> Add Family
          </button>
        </div>
      </div>

      {/* Tabs: Event Assignments vs Master Directory */}
      <div className="flex border-b border-stone-200 gap-4">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'assigned'
              ? 'border-b-2 border-[#800020] text-[#800020]'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Invited to this Event ({assignments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('directory')}
          className={`pb-3 text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'directory'
              ? 'border-b-2 border-[#800020] text-[#800020]'
              : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <span>Master Family Directory ({contacts.length})</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search family name, primary contact, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs focus:outline-none focus:border-[#800020]"
          />
        </div>

        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-3.5 py-2.5 rounded-2xl border border-stone-200 bg-white text-xs text-stone-700 focus:outline-none focus:border-[#800020]"
        >
          <option value="all">All Groups</option>
          <option value="Family">Family</option>
          <option value="Bride Side">Bride Side</option>
          <option value="Groom Side">Groom Side</option>
          <option value="Friends">Friends</option>
          <option value="VIP">VIP</option>
          <option value="Colleagues">Colleagues</option>
        </select>
      </div>

      {/* TAB 1: Assigned to This Celebration */}
      {activeTab === 'assigned' && (
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-[#FAF7F2] text-stone-800 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Family / Primary Contact</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Invited</th>
                  <th className="py-3 px-4">RSVP Status</th>
                  <th className="py-3 px-4">Confirmed Headcount</th>
                  <th className="py-3 px-4">Meal Preferences</th>
                  <th className="py-3 px-4">Check-in</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-stone-50/70 transition">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{a.family_name}</p>
                      <p className="text-[11px] text-stone-500">{a.primary_name} • {a.phone}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                        {a.relation_group || 'Family'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {a.invited_adults} Adults, {a.invited_children} Kids
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          a.rsvp_status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : a.rsvp_status === 'declined'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : a.rsvp_status === 'maybe'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {a.rsvp_status || 'awaiting'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {a.rsvp_status === 'confirmed'
                        ? `${(a.confirmed_adults || 0) + (a.confirmed_children || 0)} attending`
                        : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      {a.rsvp_status === 'confirmed' ? (
                        <div className="space-y-0.5">
                          {a.dietary_veg ? <span className="text-emerald-700 mr-2">🟢 {a.dietary_veg} Veg</span> : null}
                          {a.dietary_non_veg ? <span className="text-rose-700 mr-2">🔴 {a.dietary_non_veg} NV</span> : null}
                          {a.dietary_jain ? <span className="text-amber-700">🟡 {a.dietary_jain} Jain</span> : null}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {a.is_checked_in ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                          ✓ Checked In ({a.checked_in_count})
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400">Pending</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedQrGuest({ token: a.rsvp_token, name: a.family_name })}
                        className="p-1.5 text-stone-500 hover:text-[#800020] rounded-lg hover:bg-stone-100 transition cursor-pointer"
                        title="View QR Code & Public Link"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveAssignment(a.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove from Event"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAssignments.length === 0 && (
            <div className="p-8 text-center text-xs text-stone-400">
              No guests found matching your search.
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Master Family Directory */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {selectedContactIds.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#800020] text-white flex items-center justify-between shadow-md">
              <span className="text-xs font-semibold">
                {selectedContactIds.length} families selected
              </span>
              <button
                onClick={handleBulkAssign}
                className="px-4 py-1.5 rounded-xl bg-[#D4AF37] text-stone-900 font-bold text-xs hover:bg-amber-400 transition cursor-pointer"
              >
                Assign Selected to Active Celebration
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-[#FAF7F2] text-stone-800 uppercase font-bold text-[10px] tracking-wider border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4 w-10">Select</th>
                    <th className="py-3 px-4">Family Name</th>
                    <th className="py-3 px-4">Primary Contact</th>
                    <th className="py-3 px-4">WhatsApp Phone</th>
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4">Default Size</th>
                    <th className="py-3 px-4 text-right">Status in Active Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {contacts.map((c) => {
                    const isAssigned = assignedGuestIds.has(c.id);
                    const isChecked = selectedContactIds.includes(c.id);

                    return (
                      <tr key={c.id} className="hover:bg-stone-50/70 transition">
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            disabled={isAssigned}
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedContactIds((prev) => [...prev, c.id]);
                              } else {
                                setSelectedContactIds((prev) => prev.filter((id) => id !== c.id));
                              }
                            }}
                            className="rounded text-[#800020] focus:ring-[#800020]"
                          />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-stone-900">{c.family_name}</td>
                        <td className="py-3.5 px-4">{c.primary_name}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px]">{c.phone}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-700">
                            {c.relation_group}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {c.adults_count}A, {c.children_count}C
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isAssigned ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ Assigned
                            </span>
                          ) : (
                            <button
                              onClick={() => ApiService.assignSingleGuest(activeEvent.id, c.id).then(loadData)}
                              className="text-xs font-bold text-[#800020] hover:underline cursor-pointer"
                            >
                              + Assign
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Single Family */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">Add Family Contact</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Family Name</label>
                <input
                  type="text"
                  required
                  value={formData.family_name}
                  onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                  placeholder="E.g. Sharma Family"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Primary Contact Person</label>
                <input
                  type="text"
                  required
                  value={formData.primary_name}
                  onChange={(e) => setFormData({ ...formData, primary_name: e.target.value })}
                  placeholder="E.g. Rajesh Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">WhatsApp Phone Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Group / Relation</label>
                  <select
                    value={formData.relation_group}
                    onChange={(e) => setFormData({ ...formData, relation_group: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  >
                    <option value="Family">Family</option>
                    <option value="Bride Side">Bride Side</option>
                    <option value="Groom Side">Groom Side</option>
                    <option value="Friends">Friends</option>
                    <option value="VIP">VIP</option>
                    <option value="Colleagues">Colleagues</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Adults Count</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.adults_count}
                    onChange={(e) => setFormData({ ...formData, adults_count: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Children Count</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.children_count}
                    onChange={(e) => setFormData({ ...formData, children_count: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#800020] text-white font-bold text-xs shadow-md hover:bg-[#580c1f] transition cursor-pointer"
                >
                  Save & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bulk CSV Import */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold font-serif text-lg text-stone-900">Bulk CSV Guest Import</h3>
              <button onClick={() => setShowCsvModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Upload your guest spreadsheet (.csv). Required columns: <b>Family Name</b>, <b>Primary Name</b>, <b>Phone</b>. Optional: Email, City, Group, Adults, Children.
            </p>

            <form onSubmit={handleCsvImport} className="space-y-4">
              <div className="p-6 border-2 border-dashed border-[#D4AF37]/50 rounded-2xl bg-[#FAF7F2] text-center space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-[#800020] mx-auto" />
                <input
                  type="file"
                  accept=".csv"
                  required
                  onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#800020] file:text-white hover:file:bg-[#580c1f]"
                />
                <p className="text-[10px] text-stone-400">Duplicate phone numbers are automatically detected and safely skipped.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCsvModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={importing || !csvFile}
                  className="px-5 py-2.5 rounded-xl bg-[#800020] text-white font-bold text-xs shadow-md hover:bg-[#580c1f] transition flex items-center gap-1.5 cursor-pointer"
                >
                  {importing ? 'Importing...' : 'Upload & Import Contacts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR & Public Link Modal */}
      {selectedQrGuest && (
        <QRModal
          isOpen={true}
          onClose={() => setSelectedQrGuest(null)}
          token={selectedQrGuest.token}
          guestName={selectedQrGuest.name}
          eventTitle={activeEvent.title}
        />
      )}
    </div>
  );
};

