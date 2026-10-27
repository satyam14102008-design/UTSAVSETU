import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Copy, Download, ExternalLink, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  guestName?: string;
  eventTitle: string;
}

export const QRModal: React.FC<Props> = ({ isOpen, onClose, token, guestName, eventTitle }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const rsvpUrl = `${window.location.origin}/rsvp/${token}`;

  useEffect(() => {
    if (isOpen && token) {
      QRCode.toDataURL(rsvpUrl, {
        width: 320,
        margin: 2,
        color: { dark: '#800020', light: '#FFFFFF' },
      }).then(setQrUrl).catch(console.error);
    }
  }, [isOpen, token, rsvpUrl]);

  if (!isOpen) return null;

  const copyLink = () => {
    navigator.clipboard.writeText(rsvpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `RSVP_QR_${guestName ? guestName.replace(/\s+/g, '_') : 'Guest'}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#D4AF37]/30 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-xs uppercase tracking-widest text-[#800020] font-semibold">
          Personalized RSVP Link & QR
        </span>
        <h3 className="text-lg font-bold text-stone-900 mt-1">{guestName || 'Special Guest'}</h3>
        <p className="text-xs text-stone-500 mt-0.5">{eventTitle}</p>

        {qrUrl ? (
          <div className="my-5 p-3 bg-[#FAF7F2] border border-[#D4AF37]/30 rounded-2xl inline-block shadow-inner">
            <img src={qrUrl} alt="QR Code" className="w-48 h-48 mx-auto object-contain rounded-xl" />
          </div>
        ) : (
          <div className="w-48 h-48 bg-stone-100 rounded-xl my-5 mx-auto flex items-center justify-center animate-pulse text-xs text-stone-400">
            Generating QR...
          </div>
        )}

        <div className="flex items-center gap-2 bg-stone-50 p-2.5 rounded-xl border text-xs text-stone-600 mb-4 overflow-hidden">
          <input
            type="text"
            readOnly
            value={rsvpUrl}
            className="bg-transparent flex-1 outline-none text-ellipsis"
          />
          <button
            onClick={copyLink}
            className="text-[#800020] hover:text-[#580c1f] font-semibold flex items-center gap-1 transition shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadQR}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-stone-50 transition"
          >
            <Download className="w-4 h-4" /> Download QR
          </button>
          <a
            href={rsvpUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#800020] text-white font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-[#580c1f] transition shadow-md"
          >
            <ExternalLink className="w-4 h-4" /> Open Page
          </a>
        </div>
      </div>
    </div>
  );
};

