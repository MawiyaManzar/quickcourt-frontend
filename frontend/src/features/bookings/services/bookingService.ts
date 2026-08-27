import api from '../../../lib/axios';
import type { TimeSlot, SmartPick, CreateBookingPayload, PaymentPayload, BookingRecord } from '../types';

export const bookingService = {
  /**
   * Fetch 1-hour slot grid state for a court on a given date
   */
  async getCourtAvailability(courtId: string, date: string): Promise<TimeSlot[]> {
    try {
      const res = await api.get<any>(`/courts/${courtId}/availability`, { params: { date } });
      const raw = res.data;
      const rawArray: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.slots)
        ? raw.slots
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      return rawArray.map((s: any, idx: number) => ({
        id: s.id || `slot-${courtId}-${date}-${s.startTime || idx}`,
        startTime: s.startTime || '00:00',
        endTime: s.endTime || '00:00',
        status: (s.status as any) || 'AVAILABLE',
        price: Number(s.price || s.pricePerHour || 500),
      }));
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 400) return [];
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch court availability slots');
    }
  },

  /**
   * Fetch Smart Pick recommendations for a court and date
   */
  async getSmartPicks(courtId: string, date: string): Promise<SmartPick[]> {
    try {
      const res = await api.get<any>('/smart-picks', { params: { courtId, date } });
      const raw = res.data;
      const picks: SmartPick[] = Array.isArray(raw) ? raw : Array.isArray(raw?.picks) ? raw.picks : Array.isArray(raw?.data) ? raw.data : [];
      return picks;
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 400) return [];
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch smart picks');
    }
  },

  /**
   * Create a new court booking
   */
  async createBooking(payload: CreateBookingPayload): Promise<BookingRecord> {
    try {
      const res = await api.post<any>('/bookings', payload);
      const raw = res.data;
      const booking = raw?.booking || raw?.data?.booking || raw?.data || raw;
      if (booking) {
        return booking as BookingRecord;
      }
      throw new Error(raw.message || 'Failed to create booking');
    } catch (err: any) {
      if (err.response?.status === 409) {
        throw new Error('This court slot has just been booked by another user. Please select another time slot.');
      }
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create booking');
    }
  },

  /**
   * Execute payment for booking
   */
  async processPayment(payload: PaymentPayload): Promise<BookingRecord> {
    try {
      const res = await api.post<any>('/payments', payload);
      const raw = res.data;
      const booking = raw?.booking || raw?.data?.booking || raw?.data || raw;
      if (booking) {
        return booking as BookingRecord;
      }
      throw new Error(raw.message || 'Payment failed');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message || 'Payment processing failed');
    }
  },

  /**
   * Fetch current user's bookings
   */
  async getMyBookings(): Promise<BookingRecord[]> {
    try {
      const res = await api.get<any>('/bookings');
      const raw = res.data;
      const apiBookings: BookingRecord[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.bookings)
        ? raw.bookings
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      return apiBookings;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch your bookings');
    }
  },

  /**
   * Cancel a booking by ID
   */
  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to cancel booking');
    }
  }
};

/* ---------- LocalStorage Helpers ---------- */
const STORAGE_KEY = 'qc_user_bookings';

function getLocalBookings(): BookingRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore parse errors
  }
  return [
    {
      id: 'bkg-demo-1',
      userId: 'usr-customer-1',
      courtId: 'c-101',
      courtName: 'Badminton Court 1 (BWF Mat)',
      venueName: 'Apex Sports Arena',
      sport: 'Badminton',
      date: '2026-08-29',
      startTime: '18:00',
      endTime: '19:00',
      durationHours: 1,
      totalPrice: 450,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
    },
  ];
}

function saveLocalBooking(booking: BookingRecord) {
  try {
    const existing = getLocalBookings();
    const updated = [booking, ...existing.filter((b) => b.id !== booking.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }
}

function cancelLocalBooking(bookingId: string) {
  try {
    const existing = getLocalBookings();
    const updated = existing.map((b) =>
      b.id === bookingId ? { ...b, status: 'CANCELLED' as const } : b
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore errors
  }
}
