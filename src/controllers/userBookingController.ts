import { Response } from 'express';
import { z } from 'zod';
import { mockCourts, mockFacilities, mockBookings, mockUsers, mockBlocks } from '../data/mockStore';
import { Booking, Payment } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

const createBookingSchema = z.object({
  courtId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
});

const paymentSchema = z.object({
  bookingId: z.string(),
  paymentMethod: z.string().default('CARD'),
});

// POST /api/bookings - Create booking with strict double-booking prevention (PRD 6, 8, BR-06, BR-07, BR-11)
export const createBooking = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const user = mockUsers.find((u) => u.id === req.user?.id);
    if (!user || user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Banned or suspended users cannot create bookings (BR-11)' });
    }

    const parsed = createBookingSchema.parse(req.body);

    const court = mockCourts.find((c) => c.id === parsed.courtId);
    if (!court || court.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Selected court is not available' });
    }

    const facility = mockFacilities.find((f) => f.id === court.facilityId);
    if (!facility || facility.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Facility is not approved for public bookings (BR-12)' });
    }

    // Backend-level Double Booking Prevention Check (Section 8 PRD / BR-06)
    const existingBookingConflict = mockBookings.some(
      (b) =>
        b.courtId === parsed.courtId &&
        b.date === parsed.date &&
        b.startTime === parsed.startTime &&
        b.status === 'CONFIRMED'
    );

    if (existingBookingConflict) {
      return res.status(409).json({
        success: false,
        message: 'Double Booking Conflict: This slot has already been booked by another user.',
      });
    }

    // Court Maintenance Block Check (BR-05)
    const reqStartHour = parseInt(parsed.startTime.split(':')[0], 10);
    const isBlocked = mockBlocks.some((blk) => {
      if (blk.courtId !== parsed.courtId || blk.date !== parsed.date) return false;
      const blkStartHour = parseInt(blk.startTime.split(':')[0], 10);
      const blkEndHour = parseInt(blk.endTime.split(':')[0], 10);
      return reqStartHour >= blkStartHour && reqStartHour < blkEndHour;
    });

    if (isBlocked) {
      return res.status(400).json({ success: false, message: 'This slot is currently blocked for maintenance' });
    }

    // Server-side Price Calculation (BR-07)
    const calculatedAmount = court.pricePerHour;
    const bookingRef = `QC-${parsed.date.replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newBooking: Booking = {
      id: `bkg-${Date.now()}`,
      reference: bookingRef,
      userId: req.user.id,
      facilityId: facility.id,
      courtId: court.id,
      sport: court.sport,
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      amount: calculatedAmount,
      paymentStatus: 'PENDING',
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockBookings.push(newBooking);

    return res.status(201).json({
      success: true,
      message: 'Booking created. Please complete payment.',
      booking: newBooking,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create booking' });
  }
};

// POST /api/payments - Simulated Payment Gateway Endpoint (PRD 10)
export const processPayment = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, paymentMethod } = paymentSchema.parse(req.body);

    const bookingIndex = mockBookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = mockBookings[bookingIndex];

    if (booking.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized payment attempt' });
    }

    // Update payment status & booking status
    booking.paymentStatus = 'PAID';
    booking.status = 'CONFIRMED';
    booking.updatedAt = new Date().toISOString();

    const paymentRecord: Payment = {
      id: `pay-${Date.now()}`,
      bookingId: booking.id,
      amount: booking.amount,
      status: 'PAID',
      paymentMethod,
      transactionRef: `TXN-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: 'Simulated payment successful. Booking confirmed!',
      booking,
      payment: paymentRecord,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Payment failed' });
  }
};

// GET /api/bookings - Get user's own bookings (PRD 11 & BR-08)
export const getMyBookings = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const userBookings = mockBookings.filter((b) => b.userId === req.user?.id);

  const enriched = userBookings.map((b) => {
    const facility = mockFacilities.find((f) => f.id === b.facilityId);
    const court = mockCourts.find((c) => c.id === b.courtId);
    return {
      ...b,
      facilityName: facility ? facility.name : 'Unknown Facility',
      facilityAddress: facility ? `${facility.address}, ${facility.city}` : '',
      courtName: court ? court.name : 'Unknown Court',
    };
  });

  return res.json({
    success: true,
    count: enriched.length,
    bookings: enriched,
  });
};

// GET /api/bookings/:id - Single booking details (PRD 11 & BR-08)
export const getBookingById = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const booking = mockBookings.find((b) => b.id === id);

  if (!booking) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  // Ownership check (BR-08): Users can only view their own bookings, unless owner or admin
  const isOwnerOfFacility = mockFacilities.some((f) => f.id === booking.facilityId && f.ownerId === req.user?.id);
  const isCustomer = booking.userId === req.user?.id;
  const isAdmin = req.user?.role === 'ADMIN';

  if (!isCustomer && !isOwnerOfFacility && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied to this booking' });
  }

  const facility = mockFacilities.find((f) => f.id === booking.facilityId);
  const court = mockCourts.find((c) => c.id === booking.courtId);

  return res.json({
    success: true,
    booking: {
      ...booking,
      facilityName: facility ? facility.name : 'Unknown Facility',
      facilityAddress: facility ? `${facility.address}, ${facility.city}` : '',
      courtName: court ? court.name : 'Unknown Court',
    },
  });
};

// PATCH /api/bookings/:id/cancel - Cancel eligible booking (PRD 11 & BR-08)
export const cancelBooking = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const bookingIndex = mockBookings.findIndex((b) => b.id === id);
  if (bookingIndex === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found' });
  }

  const booking = mockBookings[bookingIndex];

  // Ownership check
  if (booking.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'You can only cancel your own bookings' });
  }

  if (booking.status === 'CANCELLED') {
    return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
  }

  booking.status = 'CANCELLED';
  booking.cancellationReason = reason || 'User requested cancellation';
  booking.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Booking cancelled successfully. Slot is now available.',
    booking,
  });
};
