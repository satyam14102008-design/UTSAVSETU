export type EventType =
  | 'wedding'
  | 'engagement'
  | 'birthday'
  | 'pooja'
  | 'anniversary'
  | 'housewarming'
  | 'baby_shower'
  | 'naming_ceremony'
  | 'other';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  family_name?: string;
  created_at?: string;
}

export interface RitualItem {
  name: string;
  date: string;
  time: string;
  venue?: string;
  description?: string;
}

export interface EventCollaborator {
  user_id: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'checkin_staff' | 'viewer';
}

export interface EventItem {
  id: string;
  title: string;
  event_type: EventType;
  date: string;
  time?: string;
  end_date?: string;
  venue_name: string;
  venue_address: string;
  map_url?: string;
  host_names: string;
  city?: string;
  description?: string;
  primary_person_name?: string;
  secondary_person_name?: string;
  birthday_age?: number;
  anniversary_years?: number;
  pooja_name?: string;
  muhurat_time?: string;
  prasad_offering?: string;
  house_name?: string;
  target_budget?: number;
  rsvp_deadline?: string;
  rituals?: RitualItem[];
  collaborators?: EventCollaborator[];
  custom_fields?: Record<string, any>;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventEngineConfig {
  name: string;
  badge: string;
  icon: string;
  description: string;
  theme_color: string;
  accent_color: string;
  default_title: string;
  fields: {
    primary_person_label: string;
    secondary_person_label: string;
    host_names_placeholder: string;
    show_rituals: boolean;
    show_age: boolean;
    show_years: boolean;
    show_muhurat: boolean;
    show_prasad: boolean;
    show_house_name: boolean;
  };
  default_rituals: RitualItem[];
  default_budget_categories: Array<{ name: string; allocated_amount: number; icon: string }>;
  default_checklist: string[];
  messages: {
    en: string;
    hi: string;
  };
  dietary_options: string[];
}

export interface GuestContact {
  id: string;
  family_name: string;
  primary_name: string;
  phone: string;
  email?: string;
  city?: string;
  relation_group?: string;
  adults_count: number;
  children_count: number;
  notes?: string;
  created_by: string;
  created_at?: string;
}

export interface EventGuestAssignment {
  id: string;
  guest_id: string;
  event_id: string;
  family_name: string;
  primary_name: string;
  phone: string;
  invited_adults: number;
  invited_children: number;
  relation_group?: string;
  invitation_status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed';
  invitation_sent_at?: string;
  invitation_delivery_status?: string;
  rsvp_token: string;
  rsvp_status: 'awaiting' | 'confirmed' | 'declined' | 'maybe';
  confirmed_adults?: number;
  confirmed_children?: number;
  dietary_veg?: number;
  dietary_non_veg?: number;
  dietary_jain?: number;
  arrival_time?: string;
  is_checked_in: boolean;
  checked_in_count: number;
  checked_in_at?: string;
  created_at?: string;
}

export interface CardDesign {
  id?: string;
  event_id: string;
  template_id: string;
  aspect_ratio: 'portrait' | 'square' | 'landscape';
  language: 'en' | 'hi';
  header_text?: string;
  title: string;
  subtitle?: string;
  honoree_text?: string;
  event_date_text?: string;
  event_time_text?: string;
  venue_text?: string;
  address_text?: string;
  invitation_body: string;
  rsvp_note?: string;
  host_signature?: string;
  contact_phone?: string;
  theme_preset: string;
  background_color: string;
  accent_color: string;
  text_color: string;
  secondary_text_color: string;
  font_family: string;
  decorative_border: string;
  motif_symbol: string;
  show_qr_code: boolean;
  show_map_link: boolean;
  custom_elements?: Record<string, any>;
}

export interface CardTemplate {
  id: string;
  name: string;
  category: string;
  theme_preset: string;
  background_color: string;
  accent_color: string;
  text_color: string;
  secondary_text_color: string;
  font_family: string;
  border: string;
  motif: string;
  preview_badge: string;
}

export interface RSVPResponseDetail {
  id: string;
  assignment_id: string;
  event_id: string;
  guest_name: string;
  family_name: string;
  status: 'awaiting' | 'confirmed' | 'declined' | 'maybe';
  attending_adults: number;
  attending_children: number;
  total_attendees: number;
  dietary_veg: number;
  dietary_non_veg: number;
  dietary_jain: number;
  special_dietary_notes?: string;
  arrival_time?: string;
  prasad_count?: number;
  birthday_children_ages?: string;
  guest_wishes?: string;
  submitted_at: string;
  updated_at?: string;
}

export interface RSVPSubmissionPayload {
  token: string;
  status: 'confirmed' | 'declined' | 'maybe';
  attending_adults: number;
  attending_children: number;
  dietary_veg: number;
  dietary_non_veg: number;
  dietary_jain: number;
  special_dietary_notes?: string;
  arrival_time?: string;
  prasad_count?: number;
  birthday_children_ages?: string;
  guest_wishes?: string;
}

export interface PublicInvitationData {
  token: string;
  guest_name: string;
  family_name: string;
  invited_adults: number;
  invited_children: number;
  current_rsvp_status: string;
  event: EventItem;
  card_design?: CardDesign;
  dietary_options: string[];
  existing_response?: RSVPResponseDetail;
}

export interface BudgetCategory {
  id: string;
  event_id: string;
  name: string;
  allocated_amount: number;
  spent_amount: number;
  remaining_amount: number;
  icon?: string;
  notes?: string;
}

export interface BudgetTransaction {
  id: string;
  event_id: string;
  category_id: string;
  category_name?: string;
  title: string;
  amount: number;
  vendor_name?: string;
  vendor_phone?: string;
  status: 'planned' | 'paid' | 'partial' | 'pending';
  paid_date?: string;
  receipt_notes?: string;
  created_at?: string;
}

export interface FoodCateringConfig {
  event_id: string;
  price_per_veg: number;
  price_per_non_veg: number;
  price_per_child: number;
  buffer_percentage: number;
  catering_minimum_guarantee: number;
  fixed_service_fee: number;
  cake_cost_estimate?: number;
  prasad_cost_estimate?: number;
  actual_catering_cost?: number;
  notes?: string;
}

export interface FoodBudgetSummary {
  total_invited_guests: number;
  confirmed_adults: number;
  confirmed_children: number;
  confirmed_total_attendees: number;
  confirmed_veg_meals: number;
  confirmed_non_veg_meals: number;
  confirmed_jain_meals: number;
  recommended_veg_prep: number;
  recommended_non_veg_prep: number;
  recommended_children_prep: number;
  recommended_total_plates: number;
  original_invite_estimated_cost: number;
  response_based_estimated_cost: number;
  estimated_potential_saving: number;
  actual_spent_cost: number;
  buffer_percentage_applied: number;
}

export interface AttendanceRecord {
  id: string;
  event_id: string;
  assignment_id?: string;
  guest_name: string;
  family_name?: string;
  phone?: string;
  actual_adults: number;
  actual_children: number;
  total_actual_attendees: number;
  is_walk_in: boolean;
  check_in_time: string;
  checked_in_by: string;
  notes?: string;
}

export interface AttendanceSummary {
  event_id: string;
  total_invited: number;
  total_rsvp_confirmed: number;
  total_actual_attended: number;
  actual_adults: number;
  actual_children: number;
  walk_in_count: number;
  confirmed_not_arrived: number;
  attendance_rate_percentage: number;
}

export interface WhatsAppMessageLog {
  id: string;
  event_id: string;
  assignment_id: string;
  guest_name: string;
  phone: string;
  template_type: string;
  channel: string;
  status: string;
  whatsapp_message_id?: string;
  is_demo: boolean;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
  wa_direct_url?: string;
  message_text: string;
  error_message?: string;
}

export interface SmartInsight {
  type: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action_label?: string;
  target_count?: number;
  guest_names?: string[];
  items?: any[];
  fields?: string[];
}

