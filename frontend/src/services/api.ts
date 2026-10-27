import {
  User,
  EventItem,
  EventEngineConfig,
  GuestContact,
  EventGuestAssignment,
  CardDesign,
  CardTemplate,
  RSVPResponseDetail,
  RSVPSubmissionPayload,
  PublicInvitationData,
  BudgetCategory,
  BudgetTransaction,
  FoodCateringConfig,
  FoodBudgetSummary,
  AttendanceRecord,
  AttendanceSummary,
  WhatsAppMessageLog,
  SmartInsight
} from '../types';

const RAW_BASE = (import.meta as any).env?.VITE_API_BASE_URL ? String((import.meta as any).env.VITE_API_BASE_URL).replace(/\/+$/, '') : '';
const API_BASE = RAW_BASE ? (RAW_BASE.endsWith('/api/v1') ? RAW_BASE : `${RAW_BASE}/api/v1`) : '/api/v1';


export class ApiService {
  private static getToken(): string | null {
    return localStorage.getItem('utsavsetu_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errMsg = `Request failed: ${response.statusText}`;
      try {
        const errJson = await response.json();
        errMsg = errJson.detail || errJson.message || errMsg;
      } catch {
        // Fallback
      }
      throw new Error(errMsg);
    }

    return response.json();
  }

  // --- AUTH ---
  static async login(email: string, password: string):Promise<{ access_token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(name: string, email: string, password: string, phone?: string, family_name?: string): Promise<{ access_token: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone, family_name }),
    });
  }

  static async getMe(): Promise<User> {
    return this.request('/auth/me');
  }

  // --- EVENTS ---
  static async getEventTypes(): Promise<Record<string, EventEngineConfig>> {
    return this.request('/events/types');
  }

  static async listEvents(): Promise<EventItem[]> {
    return this.request('/events');
  }

  static async getEvent(id: string): Promise<EventItem> {
    return this.request(`/events/${id}`);
  }

  static async createEvent(data: Partial<EventItem>): Promise<EventItem> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updateEvent(id: string, data: Partial<EventItem>): Promise<EventItem> {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteEvent(id: string): Promise<{ message: string }> {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  }

  static async getEventDashboardAnalytics(eventId: string): Promise<any> {
    return this.request(`/events/${eventId}/dashboard-analytics`);
  }

  // --- GUESTS ---
  static async listContacts(search?: string, group?: string): Promise<GuestContact[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (group) params.append('group', group);
    return this.request(`/guests/contacts?${params.toString()}`);
  }

  static async createContact(contact: Partial<GuestContact>): Promise<GuestContact> {
    return this.request('/guests/contacts', {
      method: 'POST',
      body: JSON.stringify(contact),
    });
  }

  static async updateContact(id: string, contact: Partial<GuestContact>): Promise<GuestContact> {
    return this.request(`/guests/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contact),
    });
  }

  static async deleteContact(id: string): Promise<{ message: string }> {
    return this.request(`/guests/contacts/${id}`, { method: 'DELETE' });
  }

  static async importContactsCsv(file: File): Promise<{ status: string; imported_count: number; duplicate_skipped: number }> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/guests/contacts/csv-import`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'CSV Import failed');
    }
    return res.json();
  }

  static async getEventAssignments(eventId: string, rsvpStatus?: string, group?: string): Promise<EventGuestAssignment[]> {
    const params = new URLSearchParams();
    if (rsvpStatus) params.append('rsvp_status', rsvpStatus);
    if (group) params.append('group', group);
    return this.request(`/guests/events/${eventId}/assignments?${params.toString()}`);
  }

  static async assignSingleGuest(eventId: string, guestId: string, adults?: number, children?: number): Promise<EventGuestAssignment> {
    return this.request(`/guests/events/${eventId}/assign-single`, {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, guest_id: guestId, invited_adults: adults, invited_children: children }),
    });
  }

  static async assignBulkGuests(eventId: string, guestIds: string[]): Promise<{ status: string; assigned_count: number }> {
    return this.request(`/guests/events/${eventId}/assign-bulk`, {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, guest_ids: guestIds }),
    });
  }

  static async removeAssignment(eventId: string, assignmentId: string): Promise<{ message: string }> {
    return this.request(`/guests/events/${eventId}/assignments/${assignmentId}`, { method: 'DELETE' });
  }

  // --- INVITATION STUDIO ---
  static async listCardTemplates(eventType?: string): Promise<CardTemplate[]> {
    const query = eventType ? `?event_type=${eventType}` : '';
    return this.request(`/invitations/templates${query}`);
  }

  static async getCardDesign(eventId: string): Promise<CardDesign> {
    return this.request(`/invitations/events/${eventId}/design`);
  }

  static async saveCardDesign(eventId: string, design: Partial<CardDesign>): Promise<CardDesign> {
    return this.request(`/invitations/events/${eventId}/design`, {
      method: 'PUT',
      body: JSON.stringify(design),
    });
  }

  static async suggestWording(eventId: string, language: 'en' | 'hi'): Promise<{ suggested_message: string }> {
    return this.request(`/invitations/events/${eventId}/suggest-wording?language=${language}`, {
      method: 'POST',
    });
  }

  // --- PUBLIC RSVP ---
  static async getPublicInvitation(token: string): Promise<PublicInvitationData> {
    return this.request(`/rsvp/invitation/${token}`);
  }

  static async submitPublicRSVP(payload: RSVPSubmissionPayload): Promise<any> {
    return this.request('/rsvp/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  static async getEventRSVPResponses(eventId: string): Promise<RSVPResponseDetail[]> {
    return this.request(`/rsvp/events/${eventId}/responses`);
  }

  // --- BUDGET & FOOD PLANNING ---
  static async getBudgetCategories(eventId: string): Promise<BudgetCategory[]> {
    return this.request(`/budget/events/${eventId}/categories`);
  }

  static async addBudgetCategory(eventId: string, category: Partial<BudgetCategory>): Promise<BudgetCategory> {
    return this.request(`/budget/events/${eventId}/categories`, {
      method: 'POST',
      body: JSON.stringify(category),
    });
  }

  static async deleteBudgetCategory(eventId: string, categoryId: string): Promise<{ message: string }> {
    return this.request(`/budget/events/${eventId}/categories/${categoryId}`, { method: 'DELETE' });
  }

  static async getBudgetTransactions(eventId: string): Promise<BudgetTransaction[]> {
    return this.request(`/budget/events/${eventId}/transactions`);
  }

  static async addBudgetTransaction(eventId: string, transaction: Partial<BudgetTransaction>): Promise<BudgetTransaction> {
    return this.request(`/budget/events/${eventId}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction),
    });
  }

  static async getFoodConfig(eventId: string): Promise<FoodCateringConfig> {
    return this.request(`/budget/events/${eventId}/food-config`);
  }

  static async updateFoodConfig(eventId: string, config: Partial<FoodCateringConfig>): Promise<FoodCateringConfig> {
    return this.request(`/budget/events/${eventId}/food-config`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  static async getFoodCalculation(eventId: string): Promise<FoodBudgetSummary> {
    return this.request(`/budget/events/${eventId}/food-calculation`);
  }

  // --- ATTENDANCE CHECK-IN ---
  static async searchCheckinGuests(eventId: string, query?: string): Promise<EventGuestAssignment[]> {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return this.request(`/attendance/events/${eventId}/search${q}`);
  }

  static async checkInGuest(eventId: string, data: any): Promise<any> {
    return this.request(`/attendance/events/${eventId}/check-in`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getAttendanceSummary(eventId: string): Promise<AttendanceSummary> {
    return this.request(`/attendance/events/${eventId}/summary`);
  }

  static async getAttendanceRecords(eventId: string): Promise<AttendanceRecord[]> {
    return this.request(`/attendance/events/${eventId}/records`);
  }

  // --- WHATSAPP & DEMO MESSAGING ---
  static async getWhatsAppStatus(): Promise<any> {
    return this.request('/whatsapp/status');
  }

  static async sendSingleWhatsApp(eventId: string, assignmentId: string, templateType = 'invitation', customMessage?: string, forceDemo = true): Promise<WhatsAppMessageLog> {
    return this.request('/whatsapp/send-single', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        assignment_id: assignmentId,
        template_type: templateType,
        custom_message: customMessage,
        force_demo_mode: forceDemo
      }),
    });
  }

  static async sendBulkWhatsApp(eventId: string, assignmentIds: string[], templateType = 'invitation', customMessage?: string, forceDemo = true): Promise<any> {
    return this.request('/whatsapp/send-bulk', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        assignment_ids: assignmentIds,
        template_type: templateType,
        custom_message: customMessage,
        force_demo_mode: forceDemo
      }),
    });
  }

  static async getWhatsAppLogs(eventId: string): Promise<WhatsAppMessageLog[]> {
    return this.request(`/whatsapp/events/${eventId}/logs`);
  }

  // --- SMART ASSISTANT INSIGHTS ---
  static async getSmartInsights(eventId: string): Promise<{ event_id: string; total_insights: number; insights: SmartInsight[] }> {
    return this.request(`/smart-assist/events/${eventId}/insights`);
  }
}

