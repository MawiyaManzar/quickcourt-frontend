import { describe, it, expect } from 'vitest';
import { bookingService } from '../features/bookings/services/bookingService';

describe('bookingService', () => {
  it('fetches court availability slot grid', async () => {
    const slots = await bookingService.getCourtAvailability('crt-1', '2026-08-28');
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]).toHaveProperty('startTime');
    expect(slots[0]).toHaveProperty('status');
  });

  it('fetches smart pick slot recommendations', async () => {
    const picks = await bookingService.getSmartPicks('crt-1', '2026-08-28');
    expect(picks.length).toBeGreaterThan(0);
    expect(picks[0]).toHaveProperty('badgeText');
  });

  it('creates a court booking record', async () => {
    const booking = await bookingService.createBooking({
      courtId: 'crt-1',
      date: '2026-08-28',
      startTime: '18:00',
      endTime: '19:00',
    });
    expect(booking).toHaveProperty('id');
    expect(booking.courtId).toBe('crt-1');
  });

  it('processes simulated payment', async () => {
    const paidBooking = await bookingService.processPayment({
      bookingId: 'bkg-test-123',
      paymentMethod: 'CARD',
      cardNumber: '4532 8912 3456 7890',
    });
    expect(paidBooking).toHaveProperty('id');
    expect(paidBooking.paymentStatus).toBe('PAID');
  });
});
