import type { SportType } from '../../venues/types';

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'SELECTED';

export interface TimeSlot {
  id: string;
  startTime: string; // e.g. "06:00" or "18:00"
  endTime: string;   // e.g. "07:00" or "19:00"
  status: SlotStatus;
  price: number;
}

export type SmartPickType = 'POPULAR' | 'BEST_AVAILABILITY' | 'VALUE';

export interface SmartPick {
  id: string;
  type: SmartPickType;
  label: string;
  badgeText: string;
  startTime: string;
  endTime: string;
  price: number;
}

export interface CreateBookingPayload {
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
}

export interface PaymentPayload {
  bookingId: string;
  paymentMethod: 'CARD' | 'UPI' | 'NETBANKING';
  cardNumber?: string;
  cardName?: string;
}

export interface BookingRecord {
  id: string;
  userId: string;
  courtId: string;
  courtName: string;
  venueName: string;
  sport: SportType;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
  createdAt: string;
}
