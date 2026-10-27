import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { CardDesign } from '../types';

interface Props {
  design: CardDesign;
  rsvpToken?: string;
  className?: string;
}

export const CardPreview: React.FC<Props> = ({ design, rsvpToken = 'demo-token-preview', className = '' }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (design.show_qr_code) {
      const publicUrl = `${window.location.origin}/rsvp/${rsvpToken}`;
      QRCode.toDataURL(publicUrl, {
        width: 120,
        margin: 1,
        color: {
          dark: design.accent_color || '#D4AF37',
          light: '#FFFFFF',
        },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [design.show_qr_code, design.accent_color, rsvpToken]);

  const renderMotif = () => {
    switch (design.motif_symbol) {
      case 'ganesha':
        return (
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl filter drop-shadow">🕉️</span>
            <span className="text-[10px] tracking-widest uppercase font-serif mt-0.5 opacity-90">
              || श्री गणेशाय नमः ||
            </span>
          </div>
        );
      case 'om':
        return (
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl filter drop-shadow">ॐ</span>
            <span className="text-[10px] tracking-widest uppercase font-serif mt-0.5 opacity-90">
              || ॐ नमः शिवाय ||
            </span>
          </div>
        );
      case 'kalash':
        return (
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl filter drop-shadow">🏺</span>
            <span className="text-[10px] tracking-widest uppercase font-serif mt-0.5 opacity-90">
              || शुभ लाभ ||
            </span>
          </div>
        );
      case 'rings':
        return (
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl filter drop-shadow">💍</span>
            <span className="text-[10px] tracking-widest uppercase font-serif mt-0.5 opacity-90">
              With Love & Blessings
            </span>
          </div>
        );
      case 'birthday_cake':
        return (
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl filter drop-shadow">🎂</span>
            <span className="text-[10px] tracking-widest uppercase font-serif mt-0.5 opacity-90">
              Let's Celebrate!
            </span>
          </div>
        );
      case 'diya':
        return (
          <div className="flex flex-col items-center mb-2">
            <span className="text-3xl filter drop-shadow">🪔</span>
            <span className="text-[10px] tracking-widest uppercase font-serif mt-0.5 opacity-90">
              Shubh Aashirwad
            </span>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center mb-2">
            <span className="text-2xl filter drop-shadow">✨</span>
          </div>
        );
    }
  };

  const getBorderClasses = () => {
    switch (design.decorative_border) {
      case 'ornate_gold':
        return 'border-[3px] border-double rounded-2xl p-6 relative';
      case 'royal_arch':
        return 'border-[2px] rounded-t-[40px] rounded-b-2xl p-6 relative';
      case 'floral_wreath':
        return 'border-[2px] border-dashed rounded-3xl p-6 relative';
      case 'modern_thin':
        return 'border rounded-xl p-6 relative';
      default:
        return 'p-6 relative';
    }
  };

  const isSquare = design.aspect_ratio === 'square';

  return (
    <div
      className={`relative mx-auto transition-all shadow-2xl flex flex-col justify-between overflow-hidden select-none ${
        isSquare ? 'aspect-square max-w-[440px]' : 'aspect-[9/14] max-w-[420px]'
      } ${className}`}
      style={{
        backgroundColor: design.background_color || '#800020',
        color: design.text_color || '#FAF7F2',
        fontFamily: design.font_family || 'Cinzel',
      }}
    >
      {/* Background Decorative Pattern Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 bg-radial-gradient"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 70%)',
        }}
      />

      {/* Ornate Corner Accents */}
      <div
        className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 pointer-events-none opacity-80"
        style={{ borderColor: design.accent_color }}
      />
      <div
        className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 pointer-events-none opacity-80"
        style={{ borderColor: design.accent_color }}
      />
      <div
        className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 pointer-events-none opacity-80"
        style={{ borderColor: design.accent_color }}
      />
      <div
        className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 pointer-events-none opacity-80"
        style={{ borderColor: design.accent_color }}
      />

      {/* Border Container */}
      <div
        className={`h-full w-full flex flex-col justify-between items-center text-center z-10 ${getBorderClasses()}`}
        style={{ borderColor: design.accent_color || '#D4AF37' }}
      >
        {/* Top Motif & Header */}
        <div className="w-full">
          {renderMotif()}
          {design.header_text && (
            <p
              className="text-xs uppercase tracking-widest opacity-85 font-medium mb-1"
              style={{ color: design.secondary_text_color || '#EADBC8' }}
            >
              {design.header_text}
            </p>
          )}
          <h2
            className="text-xl md:text-2xl font-bold tracking-wide uppercase drop-shadow-md leading-tight mt-1"
            style={{ color: design.accent_color || '#D4AF37' }}
          >
            {design.title}
          </h2>
          {design.subtitle && (
            <p
              className="text-xs italic tracking-wider opacity-90 mt-1"
              style={{ color: design.secondary_text_color || '#EADBC8' }}
            >
              {design.subtitle}
            </p>
          )}
        </div>

        {/* Center: Honoree & Body */}
        <div className="my-auto py-2 w-full">
          {design.honoree_text && (
            <h1
              className="text-2xl md:text-3xl font-extrabold tracking-wider my-2.5 drop-shadow"
              style={{ color: design.accent_color || '#D4AF37' }}
            >
              {design.honoree_text}
            </h1>
          )}

          <p
            className="text-xs md:text-sm leading-relaxed max-w-[320px] mx-auto opacity-95 px-2 my-2 font-sans"
            style={{ color: design.text_color || '#FAF7F2' }}
          >
            {design.invitation_body}
          </p>

          {/* Date, Time & Venue */}
          <div
            className="my-3 py-2 px-3 border-y border-opacity-30 inline-block w-full max-w-[300px]"
            style={{ borderColor: design.accent_color }}
          >
            <p className="text-xs md:text-sm font-semibold tracking-wide" style={{ color: design.accent_color }}>
              🗓️ {design.event_date_text || 'Event Date'}
            </p>
            {design.event_time_text && (
              <p className="text-xs opacity-90 mt-0.5" style={{ color: design.secondary_text_color }}>
                ⏰ {design.event_time_text}
              </p>
            )}
            <p className="text-xs font-semibold mt-1 tracking-wide">
              📍 {design.venue_text || 'Venue'}
            </p>
            {design.address_text && (
              <p className="text-[10px] opacity-75 mt-0.5 truncate max-w-[260px] mx-auto">
                {design.address_text}
              </p>
            )}
          </div>
        </div>

        {/* Bottom: RSVP, Signature & QR */}
        <div className="w-full pt-1">
          {design.rsvp_note && (
            <p
              className="text-[11px] font-medium tracking-wide uppercase"
              style={{ color: design.accent_color }}
            >
              {design.rsvp_note}
            </p>
          )}

          {/* QR Code */}
          {design.show_qr_code && qrDataUrl && (
            <div className="my-2 flex flex-col items-center">
              <div className="p-1.5 bg-white rounded-lg shadow-md inline-block">
                <img src={qrDataUrl} alt="RSVP QR Code" className="w-16 h-16 object-contain" />
              </div>
              <span className="text-[9px] uppercase tracking-wider mt-1 opacity-75 font-sans">
                Scan to RSVP
              </span>
            </div>
          )}

          {design.host_signature && (
            <p
              className="text-[11px] italic mt-1 font-serif opacity-90"
              style={{ color: design.secondary_text_color }}
            >
              {design.host_signature}
            </p>
          )}

          {design.contact_phone && (
            <p className="text-[10px] opacity-75 font-sans mt-0.5">
              Contact: {design.contact_phone}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

