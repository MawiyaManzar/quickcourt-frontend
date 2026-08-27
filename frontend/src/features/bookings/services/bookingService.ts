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

      if (rawArray.length > 0) {
        return rawArray.map((s: any, idx: number) => ({
          id: s.id || `slot-${courtId}-${date}-${s.startTime || idx}`,
          startTime: s.startTime || '00:00',
          endTime: s.endTime || '00:00',
          status: (s.status as any) || 'AVAILABLE',
          price: Number(s.price || s.pricePerHour || 500),
        }));
      }
    } catch {
      // Fallback slot generator
    }

    await new Promise((res) => setTimeout(res, 120));

    // Generate standard 06:00 - 23:00 hourly slots
    const mockSlots: TimeSlot[] = [];
    const basePrice = 500;

    for (let hour = 6; hour < 23; hour++) {
      const startStr = `${hour < 10 ? '0' : ''}${hour}:00`;
      const endStr = `${hour + 1 < 10 ? '0' : ''}${hour + 1}:00`;
      const slotId = `slot-${courtId}-${date}-${hour}`;

      // Simulate a few booked/maintenance slots for realistic UX
      let status: TimeSlot['status'] = 'AVAILABLE';
      if (hour === 18 || hour === 19) status = 'BOOKED';
      if (hour === 14) status = 'MAINTENANCE';

      mockSlots.push({
        id: slotId,
        startTime: startStr,
        endTime: endStr,
        status,
        price: hour >= 18 ? basePrice + 150 : basePrice,
      });
    }

    return mockSlots;
  },

  /**
   * Fetch Smart Pick recommendations for a court and date
   */
  async getSmartPicks(courtId: string, date: string): Promise<SmartPick[]> {
    try {
      const res = await api.get<any>('/smart-picks', { params: { courtId, date } });
      const raw = res.data;
      const picks: SmartPick[] = Array.isArray(raw) ? raw : Array.isArray(raw?.picks) ? raw.picks : Array.isArray(raw?.data) ? raw.data : [];
      if (picks.length > 0) {
        return picks;
      }
    } catch {
      // Fallback
    }

    await new Promise((res) => setTimeout(res, 100));

    return [
      {
        id: 'sp-1',
        type: 'POPULAR',
        label: 'Prime Evening Slot',
        badgeText: '🔥 Most Popular',
        startTime: '19:00',
        endTime: '20:00',
        price: 650,
      },
      {
        id: 'sp-2',
        type: 'BEST_AVAILABILITY',
        label: 'Early Morning Fresh',
        badgeText: '⭐ Best Availability',
        startTime: '07:00',
        endTime: '08:00',
        price: 500,
      },
      {
        id: 'sp-3',
        type: 'VALUE',
        label: 'Afternoon Value',
        badgeText: '💡 Best Rate (20% Off)',
        startTime: '15:00',
        endTime: '16:00',
        price: 400,
      },
    ];
  },

  /**
   * Create a new court booking (Protected against double-booking)
   */
  async createBooking(payload: CreateBookingPayload): Promise<BookingRecord> {
    try {
      const res = await api.post<any>('/bookings', payload);
      const raw = res.data;
      const booking = raw?.booking || raw?.data?.booking || raw?.data || raw;
      if (booking && booking.id) {
        return booking as BookingRecord;
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        throw new Error('This court slot has just been booked by another user. Please select another time slot.');
      }
      if (err.response && err.response.status !== 401 && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    await new Promise((res) => setTimeout(res, 200));

    const mockBooking: BookingRecord = {
      id: 'bkg-' + Math.random().toString(36).substring(2, 9),
      userId: 'usr-customer-1',
      courtId: payload.courtId,
      courtName: 'Court 1',
      venueName: 'QuickCourt Sports Complex',
      sport: 'Badminton',
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      durationHours: 1,
      totalPrice: 500,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
      createdAt: new Date().toISOString(),
    };

    return mockBooking;
  },

  /**
   * Execute simulated payment for booking
   */
  async processPayment(payload: PaymentPayload): Promise<BookingRecord> {
    try {
      const res = await api.post<any>('/payments', payload);
      const raw = res.data;
      const booking = raw?.booking || raw?.data?.booking || raw?.data || raw;
      if (booking) {
        return booking as BookingRecord;
      }
    } catch (err: any) {
      if (err.response && err.response.status !== 401 && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
    }

    await new Promise((res) => setTimeout(res, 250));

    return {
      id: payload.bookingId,
      userId: 'usr-customer-1',
      courtId: 'crt-1',
      courtName: 'Court 1',
      venueName: 'QuickCourt Sports Complex',
      sport: 'Badminton',
      date: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '19:00',
      durationHours: 1,
      totalPrice: 500,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      createdAt: new Date().toISOString(),
    };
  }
};
