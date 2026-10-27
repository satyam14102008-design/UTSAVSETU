import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { useToast } from '../context/ToastContext';
import { ApiService } from '../services/api';
import { CardDesign, CardTemplate } from '../types';
import { CardPreview } from '../components/CardPreview';
import { QRModal } from '../components/QRModal';
import { ShareModal } from '../components/ShareModal';
import {
  Palette,
  Sparkles,
  QrCode,
  Download,
  Share2,
  Save,
  Languages,
  Check,
  Send,
  RefreshCw,
  Sliders,
  Type,
  Layout
} from 'lucide-react';

export const InvitationStudioPage: React.FC = () => {
  const { activeEvent, activeConfig } = useEvent();
  const { showToast } = useToast();

  const [design, setDesign] = useState<CardDesign | null>(null);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'templates'>('content');
  const [showQrModal, setShowQrModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (activeEvent) {
      setLoading(true);
      Promise.all([
        ApiService.getCardDesign(activeEvent.id),
        ApiService.listCardTemplates(activeEvent.event_type),
      ])
        .then(([d, tpls]) => {
          setDesign(d);
          setTemplates(tpls);
        })
        .catch((err) => {
          console.error(err);
          showToast('Could not load card design', 'error');
        })
        .finally(() => setLoading(false));
    }
  }, [activeEvent]);

  const handleUpdate = (field: keyof CardDesign, value: any) => {
    if (!design) return;
    setDesign({ ...design, [field]: value });
  };

  const applyTemplate = (tpl: CardTemplate) => {
    if (!design) return;
    setDesign({
      ...design,
      template_id: tpl.id,
      theme_preset: tpl.theme_preset,
      background_color: tpl.background_color,
      accent_color: tpl.accent_color,
      text_color: tpl.text_color,
      secondary_text_color: tpl.secondary_text_color,
      font_family: tpl.font_family,
      decorative_border: tpl.border,
      motif_symbol: tpl.motif,
    });
    showToast(`Applied '${tpl.name}' template style!`, 'success');
  };

  const handleSave = async () => {
    if (!activeEvent || !design) return;
    setSaving(true);
    try {
      const saved = await ApiService.saveCardDesign(activeEvent.id, design);
      setDesign(saved);
      showToast('Invitation card saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save card', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSuggestWording = async (lang: 'en' | 'hi') => {
    if (!activeEvent || !design) return;
    try {
      const res = await ApiService.suggestWording(activeEvent.id, lang);
      setDesign({
        ...design,
        language: lang,
        invitation_body: res.suggested_message,
        header_text: lang === 'hi' ? '|| श्री गणेशाय नमः ||' : design.header_text,
      });
      showToast(`Generated ${lang === 'hi' ? 'Hindi' : 'English'} invitation message!`, 'success');
    } catch {
      showToast('Could not generate suggestion', 'error');
    }
  };

  const handlePrintCard = () => {
    window.print();
  };

  if (!activeEvent) {
    return <div className="p-8 text-center text-stone-500">Please select an event first.</div>;
  }

  if (loading || !design) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800020]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#D4AF37]/30 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-[#800020]">
              Invitation Studio
            </span>
            <span className="text-xs text-stone-400">• {activeEvent.title}</span>
          </div>
          <h1 className="text-xl font-bold font-serif text-stone-900 mt-0.5">
            Card Customization & Digital Studio
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-stone-900 text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-stone-900" /> Share on WhatsApp & Apps
          </button>
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-stone-500" /> RSVP QR Code
          </button>
          <button
            onClick={handlePrintCard}
            className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-stone-500" /> Export PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
          >
            <Save className="w-4 h-4 text-[#D4AF37]" />
            {saving ? 'Saving...' : 'Save Card Design'}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Left Controls (5 cols) | Right Live Preview (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customization Tabs & Fields */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-5">
          {/* Tabs */}
          <div className="flex border-b border-stone-100 pb-3 gap-2">
            {[
              { id: 'content', label: 'Wording & Details', icon: Type },
              { id: 'style', label: 'Theme & Aesthetics', icon: Sliders },
              { id: 'templates', label: 'Template Gallery', icon: Layout },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#800020] text-white shadow-xs'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: Content & Wording */}
          {activeTab === 'content' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Language suggestion helper */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/30 text-xs">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" /> AI Wording Suggestion:
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSuggestWording('en')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#800020] font-semibold text-[11px] transition cursor-pointer"
                  >
                    English
                  </button>
                  <button
                    onClick={() => handleSuggestWording('hi')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 hover:border-[#800020] font-semibold text-[11px] font-hindi transition cursor-pointer"
                  >
                    हिंदी (Hindi)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Card Header / Invocation
                </label>
                <input
                  type="text"
                  value={design.header_text || ''}
                  onChange={(e) => handleUpdate('header_text', e.target.value)}
                  placeholder="|| Shree Ganeshay Namah ||"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={design.title}
                    onChange={(e) => handleUpdate('title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={design.subtitle || ''}
                    onChange={(e) => handleUpdate('subtitle', e.target.value)}
                    placeholder="Together with our families"
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Honoree / Couple / Celebrant Name
                </label>
                <input
                  type="text"
                  value={design.honoree_text || ''}
                  onChange={(e) => handleUpdate('honoree_text', e.target.value)}
                  placeholder="Rahul & Ananya"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020] font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Invitation Message Body
                </label>
                <textarea
                  rows={4}
                  value={design.invitation_body}
                  onChange={(e) => handleUpdate('invitation_body', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Date Text
                  </label>
                  <input
                    type="text"
                    value={design.event_date_text || ''}
                    onChange={(e) => handleUpdate('event_date_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Time Text
                  </label>
                  <input
                    type="text"
                    value={design.event_time_text || ''}
                    onChange={(e) => handleUpdate('event_time_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={design.venue_text || ''}
                    onChange={(e) => handleUpdate('venue_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Venue Address
                  </label>
                  <input
                    type="text"
                    value={design.address_text || ''}
                    onChange={(e) => handleUpdate('address_text', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    RSVP Note / Deadline
                  </label>
                  <input
                    type="text"
                    value={design.rsvp_note || ''}
                    onChange={(e) => handleUpdate('rsvp_note', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Host Signature
                  </label>
                  <input
                    type="text"
                    value={design.host_signature || ''}
                    onChange={(e) => handleUpdate('host_signature', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Style & Aesthetics */}
          {activeTab === 'style' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Aspect Ratio Toggle */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Format / Aspect Ratio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate('aspect_ratio', 'portrait')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      design.aspect_ratio === 'portrait'
                        ? 'bg-[#800020] text-white border-[#800020]'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    📱 Portrait (WhatsApp 9:14)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdate('aspect_ratio', 'square')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
                      design.aspect_ratio === 'square'
                        ? 'bg-[#800020] text-white border-[#800020]'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    ⏹️ Square (Feed 1:1)
                  </button>
                </div>
              </div>

              {/* Auspicious Motifs */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Auspicious Motif Symbol
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ganesha', label: 'श्री गणेश', icon: '🕉️' },
                    { id: 'om', label: 'पवित्र ॐ', icon: 'ॐ' },
                    { id: 'kalash', label: 'मंगल कलश', icon: '🏺' },
                    { id: 'rings', label: 'Rings / Couple', icon: '💍' },
                    { id: 'birthday_cake', label: 'Party Cake', icon: '🎂' },
                    { id: 'diya', label: 'दीपक (Diya)', icon: '🪔' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleUpdate('motif_symbol', m.id)}
                      className={`p-2 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                        design.motif_symbol === m.id
                          ? 'border-[#D4AF37] bg-[#FAF7F2] font-bold text-[#800020] ring-1 ring-[#D4AF37]'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="truncate">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Decorative Borders */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Decorative Card Border
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'ornate_gold', label: 'Double Gold Ornate' },
                    { id: 'royal_arch', label: 'Royal Mandap Arch' },
                    { id: 'floral_wreath', label: 'Floral Dashed Border' },
                    { id: 'modern_thin', label: 'Minimal Modern Line' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleUpdate('decorative_border', b.id)}
                      className={`p-2 rounded-xl border text-xs font-medium transition ${
                        design.decorative_border === b.id
                          ? 'border-[#800020] bg-[#800020]/10 text-[#800020] font-bold'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Card Typography Font
                </label>
                <select
                  value={design.font_family}
                  onChange={(e) => handleUpdate('font_family', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#800020]"
                >
                  <option value="Cinzel">Cinzel (Royal Indian Serif)</option>
                  <option value="Playfair Display">Playfair Display (Romantic Elegant)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                  <option value="Rozha One">Rozha One (Traditional Hindi Serif)</option>
                </select>
              </div>

              {/* Color Pickers */}
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.background_color}
                      onChange={(e) => handleUpdate('background_color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200"
                    />
                    <span className="text-[10px] text-stone-600 font-mono">{design.background_color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Gold / Accent
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.accent_color}
                      onChange={(e) => handleUpdate('accent_color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200"
                    />
                    <span className="text-[10px] text-stone-600 font-mono">{design.accent_color}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={design.text_color}
                      onChange={(e) => handleUpdate('text_color', e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-stone-200"
                    />
                    <span className="text-[10px] text-stone-600 font-mono">{design.text_color}</span>
                  </div>
                </div>
              </div>

              {/* QR Code toggle */}
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-700">
                  Include Instant RSVP QR Code on Card
                </span>
                <input
                  type="checkbox"
                  checked={design.show_qr_code}
                  onChange={(e) => handleUpdate('show_qr_code', e.target.checked)}
                  className="rounded text-[#800020] focus:ring-[#800020] w-4 h-4"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Templates Gallery */}
          {activeTab === 'templates' && (
            <div className="space-y-3 animate-in fade-in">
              <p className="text-xs text-stone-500">
                Click any template preset to apply its theme colors, auspicious borders, and typography instantly.
              </p>
              <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {templates.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => applyTemplate(tpl)}
                    className="p-3 rounded-2xl border text-left transition hover:shadow-md cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: tpl.background_color, color: tpl.text_color }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg">
                        {tpl.motif === 'ganesha' ? '🕉️' : tpl.motif === 'rings' ? '💍' : tpl.motif === 'birthday_cake' ? '🎂' : '✨'}
                      </span>
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                        style={{ backgroundColor: tpl.accent_color, color: tpl.background_color }}
                      >
                        {tpl.preview_badge}
                      </span>
                    </div>
                    <p className="font-bold text-xs truncate" style={{ color: tpl.accent_color }}>
                      {tpl.name}
                    </p>
                    <p className="text-[10px] opacity-75 mt-0.5">Click to apply</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Live Card Preview Sticky Container */}
        <div className="lg:col-span-6 sticky top-20 flex flex-col items-center">
          <div className="w-full max-w-[430px] space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Live Card Render
              </span>
              <span className="text-[11px] text-stone-500 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                {design.aspect_ratio === 'portrait' ? '9:14 Portrait' : '1:1 Square'}
              </span>
            </div>

            {/* The Live Render Component */}
            <div className="p-3 bg-stone-100/70 rounded-3xl border border-stone-200/80 shadow-inner flex items-center justify-center">
              <CardPreview design={design} rsvpToken="preview-token" />
            </div>

            {/* Quick helper note */}
            <p className="text-center text-[11px] text-stone-500">
              💡 Guests receive this beautiful card via WhatsApp with their personalized attendance confirmation link.
            </p>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <QRModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        token="sample-qr-token"
        guestName={activeEvent.title}
        eventTitle={activeEvent.title}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        event={activeEvent}
      />
    </div>
  );
};

