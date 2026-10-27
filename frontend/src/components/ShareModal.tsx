import React, { useState } from 'react';
import { EventItem } from '../types';
import { useToast } from '../context/ToastContext';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  Instagram,
  Sparkles
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: EventItem;
  rsvpToken?: string;
  guestName?: string;
}

export const ShareModal: React.FC<Props> = ({
  isOpen,
  onClose,
  event,
  rsvpToken,
  guestName,
}) => {
  const { showToast } = useToast();
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  // Base URL calculation (works on localhost and production Vercel)
  const origin = window.location.origin;
  const targetToken = rsvpToken || event?.id || 'token_verma_wedding_2026';
  const inviteLink = `${origin}/rsvp/${targetToken}`;

  const greeting = guestName ? `Namaste ${guestName} Ji!` : 'Namaste!';

  const fullShareText = `ॐ ${event.title} ॐ\n\n` +
    `${greeting}\n` +
    `You and your family are cordially invited to celebrate with us.\n\n` +
    `📅 Date: ${event.date} ${event.time ? `at ${event.time}` : ''}\n` +
    `📍 Venue: ${event.venue_name}, ${event.venue_address}\n\n` +
    `Please view the digital invitation card and confirm your attendance (RSVP & Dietary choices) here:\n` +
    `${inviteLink}\n\n` +
    `Looking forward to celebrating together!\n` +
    `Warm regards,\n` +
    `${event.host_names || 'The Host Family'}`;

  const igCaptionText = `Celebrate with us! ✨\n` +
    `ॐ ${event.title}\n` +
    `📅 ${event.date}\n` +
    `📍 ${event.venue_name}\n\n` +
    `RSVP & Invitation details link: ${inviteLink}\n` +
    `#Celebration #IndianTradition #UtsavSetu`;

  // WhatsApp direct link
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
  
  // Telegram direct link
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(fullShareText)}`;

  // SMS direct link
  const smsUrl = `sms:?body=${encodeURIComponent(fullShareText)}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: fullShareText,
          url: inviteLink,
        });
        showToast('Shared successfully!', 'success');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          showToast('Share failed. Please copy the link instead.', 'info');
        }
      }
    } else {
      handleCopy(fullShareText, 'full');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#D4AF37]/50 overflow-hidden">
        {/* Header with Indian gold accents */}
        <div className="bg-[#800020] text-white p-5 flex items-center justify-between border-b border-[#D4AF37]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] text-[#800020] flex items-center justify-center font-bold text-sm">
              ॐ
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-white">Share Invitation</h3>
              <p className="text-[11px] text-[#D4AF37] font-medium truncate max-w-[280px]">
                {event.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick 1-Click App Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/40 text-[#128C7E] font-bold text-xs transition cursor-pointer shadow-xs group"
            >
              <div className="w-9 h-9 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <span>WhatsApp</span>
            </a>

            {/* Native Mobile Share Sheet (Instagram, Snapchat, etc.) */}
            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-rose-500/10 to-purple-500/10 hover:from-amber-500/20 hover:to-purple-500/20 border border-purple-300/40 text-purple-900 font-bold text-xs transition cursor-pointer shadow-xs group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <Share2 className="w-5 h-5" />
              </div>
              <span>More Apps...</span>
            </button>

            {/* Instagram / Story Caption */}
            <button
              onClick={() => handleCopy(igCaptionText, 'insta')}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-pink-50 hover:bg-pink-100 border border-pink-300/50 text-pink-700 font-bold text-xs transition cursor-pointer shadow-xs group"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <Instagram className="w-5 h-5" />
              </div>
              <span>{copiedType === 'insta' ? 'Copied!' : 'Instagram'}</span>
            </button>

            {/* Telegram */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-300/50 text-sky-700 font-bold text-xs transition cursor-pointer shadow-xs group"
            >
              <div className="w-9 h-9 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <Send className="w-4 h-4 ml-0.5" />
              </div>
              <span>Telegram</span>
            </a>

            {/* SMS Message */}
            <a
              href={smsUrl}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer shadow-xs group"
            >
              <div className="w-9 h-9 rounded-full bg-stone-700 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span>SMS Text</span>
            </a>

            {/* Copy Link */}
            <button
              onClick={() => handleCopy(inviteLink, 'link')}
              className="flex flex-col items-center justify-center gap-1.5 p-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-[#D4AF37]/50 text-amber-900 font-bold text-xs transition cursor-pointer shadow-xs group"
            >
              <div className="w-9 h-9 rounded-full bg-[#D4AF37] text-stone-900 flex items-center justify-center shadow-xs group-hover:scale-105 transition">
                {copiedType === 'link' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
              <span>{copiedType === 'link' ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Direct RSVP Link Box */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#D4AF37]/40 space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500">
              Personalized RSVP & Card Link
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full text-xs font-mono bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-700 select-all truncate"
              />
              <button
                onClick={() => handleCopy(inviteLink, 'link_box')}
                className="px-3.5 py-2 rounded-xl bg-[#800020] hover:bg-[#580c1f] text-white text-xs font-bold shrink-0 transition flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'link_box' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Formatted Invitation Text Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> Complete Invitation Message
              </span>
              <button
                onClick={() => handleCopy(fullShareText, 'full')}
                className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedType === 'full' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copiedType === 'full' ? 'Copied' : 'Copy Full Message'}
              </button>
            </div>
            <textarea
              readOnly
              rows={6}
              value={fullShareText}
              className="w-full text-xs font-sans bg-stone-50 border border-stone-200 rounded-2xl p-3 text-stone-700 leading-relaxed resize-none select-all"
            />
          </div>

          {/* Instagram Post & Story Tip */}
          <div className="p-3 rounded-2xl bg-pink-50/70 border border-pink-200 text-xs text-pink-900 flex items-start gap-2.5">
            <Instagram className="w-4 h-4 text-pink-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Posting on Instagram Story or Bio?</p>
              <p className="text-[11px] text-pink-800 mt-0.5">
                Add the RSVP link as a <strong>Link Sticker</strong> in your Instagram Story, or click &quot;Instagram&quot; above to copy the caption and hashtags!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
