import { describe, it, expect } from 'vitest';
import { bookingService } from '../features/bookings/services/bookingService';

describe('bookingService', () => {
  it('fetches court availability slot grid', async () => {
    const slots = await bookingService.getCourtAvailability('00000000-0000-0000-0000-000000000000', '2026-08-28');
    expect(Array.isArray(slots)).toBe(true);
  });

  it('fetches smart pick slot recommendations', async () => {
    const picks = await bookingService.getSmartPicks('00000000-0000-0000-0000-000000000000', '2026-08-28');
    expect(Array.isArray(picks)).toBe(true);
  });

  it('rejects booking creation when unauthenticated', async () => {
    await expect(
      bookingService.createBooking({
        courtId: 'crt-1',
        date: '2026-08-28',
        startTime: '18:00',
        endTime: '19:00',
      })
    ).rejects.toThrow();
  });

  it('rejects payment processing when unauthenticated', async () => {
    await expect(
      bookingService.processPayment({
        bookingId: 'bkg-test-123',
        paymentMethod: 'CARD',
      })
    ).rejects.toThrow();
  });
});
