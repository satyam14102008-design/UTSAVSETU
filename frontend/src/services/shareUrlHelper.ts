import { EventItem, CardDesign, PublicInvitationData } from '../types';

/**
 * Safely encode a UTF-8 string to Base64 (supporting Hindi/Sanskrit characters)
 */
function utf8ToBase64(str: string): string {
  return window.btoa(unescape(encodeURIComponent(str)));
}

/**
 * Safely decode a Base64 string to a UTF-8 string
 */
function base64ToUtf8(str: string): string {
  return decodeURIComponent(escape(window.atob(str)));
}

export function generateShareableInvitationUrl(
  origin: string,
  event: EventItem,
  cardDesign?: CardDesign | null,
  rsvpToken?: string
): string {
  const targetToken = rsvpToken || event?.id || 'event_invite';
  const baseUrl = `${origin}/rsvp/${targetToken}`;

  try {
    const compactPayload = {
      t: event.title,
      et: event.event_type,
      d: event.date,
      tm: event.time || '',
      v: event.venue_name,
      va: event.venue_address,
      h: event.host_names,
      p1: event.primary_person_name || '',
      p2: event.secondary_person_name || '',
      murl: event.map_url || '',
      desc: event.description || '',
      rit: event.rituals?.slice(0, 6) || [],
      cd: cardDesign
        ? {
            bg: cardDesign.background_color,
            ac: cardDesign.accent_color,
            tc: cardDesign.text_color,
            stc: cardDesign.secondary_text_color,
            m: cardDesign.motif_symbol,
            b: cardDesign.decorative_border,
            f: cardDesign.font_family,
            ht: cardDesign.header_text,
            ib: cardDesign.invitation_body,
            tp: cardDesign.theme_preset,
            ar: cardDesign.aspect_ratio,
            title: cardDesign.title || event.title,
            ed: cardDesign.event_date_text,
            vt: cardDesign.venue_text,
          }
        : undefined,
    };

    const encoded = utf8ToBase64(JSON.stringify(compactPayload));
    return `${baseUrl}?d=${encodeURIComponent(encoded)}`;
  } catch (e) {
    console.warn('Could not compress invitation data for URL:', e);
    return baseUrl;
  }
}

export function decodeShareableInvitationData(
  token: string,
  encodedParam: string
): PublicInvitationData | null {
  try {
    const jsonStr = base64ToUtf8(decodeURIComponent(encodedParam));
    const p = JSON.parse(jsonStr);

    const event: EventItem = {
      id: token,
      title: p.t,
      event_type: p.et || 'wedding',
      date: p.d,
      time: p.tm,
      venue_name: p.v,
      venue_address: p.va,
      map_url: p.murl,
      host_names: p.h,
      primary_person_name: p.p1,
      secondary_person_name: p.p2,
      description: p.desc,
      rituals: p.rit || [],
      created_by: 'host_shared',
    };

    const cardDesign: CardDesign = p.cd
      ? {
          id: `card_${token}`,
          event_id: token,
          template_id: p.cd.tp || 'royal_maroon',
          aspect_ratio: p.cd.ar || 'portrait',
          language: 'en',
          header_text: p.cd.ht || '|| श्री गणेशाय नमः ||',
          title: p.cd.title || p.t,
          invitation_body:
            p.cd.ib ||
            'Two souls, one sacred journey. We invite you to be a part of our happiest celebration.',
          event_date_text: p.cd.ed || p.d,
          venue_text: p.cd.vt || p.v,
          theme_preset: p.cd.tp || 'royal_maroon',
          background_color: p.cd.bg || '#800020',
          accent_color: p.cd.ac || '#D4AF37',
          text_color: p.cd.tc || '#FAF7F2',
          secondary_text_color: p.cd.stc || '#EADBC8',
          font_family: p.cd.f || 'Cinzel',
          decorative_border: p.cd.b || 'ornate_gold',
          motif_symbol: p.cd.m || 'ganesha',
          show_qr_code: true,
          show_map_link: true,
        }
      : {
          id: `card_${token}`,
          event_id: token,
          template_id: 'royal_maroon',
          aspect_ratio: 'portrait',
          language: 'en',
          header_text: '|| श्री गणेशाय नमः ||',
          title: p.t,
          invitation_body: 'You are cordially invited to celebrate this joyous occasion with our family.',
          event_date_text: p.d,
          venue_text: p.v,
          theme_preset: 'royal_maroon',
          background_color: '#800020',
          accent_color: '#D4AF37',
          text_color: '#FAF7F2',
          secondary_text_color: '#EADBC8',
          font_family: 'Cinzel',
          decorative_border: 'ornate_gold',
          motif_symbol: 'ganesha',
          show_qr_code: true,
          show_map_link: true,
        };

    return {
      token,
      guest_name: 'Honored Guest',
      family_name: 'Guest Family',
      invited_adults: 2,
      invited_children: 0,
      current_rsvp_status: 'awaiting',
      event,
      card_design: cardDesign,
      dietary_options: ['Vegetarian', 'Non-Vegetarian', 'Jain'],
      existing_response: undefined,
    };
  } catch (err) {
    console.error('Failed to parse encoded invitation link payload:', err);
    return null;
  }
}

