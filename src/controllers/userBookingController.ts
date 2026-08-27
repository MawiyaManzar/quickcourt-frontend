import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, courts, facilities, bookings, payments, courtBlocks } from '../db/schema';
import { eq, and } from 'drizzle-orm';
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
export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user || user.status === 'BANNED' || user.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Banned or suspended users cannot create bookings (BR-11)' });
    }

    const parsed = createBookingSchema.parse(req.body);

    const [court] = await db.select().from(courts).where(eq(courts.id, parsed.courtId)).limit(1);
    if (!court || court.status !== 'ACTIVE') {
      return res.status(400).json({ success: false, message: 'Selected court is not available' });
    }

    const [facility] = await db.select().from(facilities).where(eq(facilities.id, court.facilityId)).limit(1);
    if (!facility || facility.status !== 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Facility is not approved for public bookings (BR-12)' });
    }

    // Backend-level Double Booking Prevention Check (Section 8 PRD / BR-06)
    // Querying with courtId + date + startTime formatted
    const startTimeFormatted = `${parsed.startTime}:00`;
    const [existingBookingConflict] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, parsed.courtId),
          eq(bookings.bookingDate, parsed.date),
          eq(bookings.startTime, startTimeFormatted),
          eq(bookings.bookingStatus, 'CONFIRMED')
        )
      )
      .limit(1);

    if (existingBookingConflict) {
      return res.status(409).json({
        success: false,
        message: 'Double Booking Conflict: This slot has already been booked by another user.',
      });
    }

    // Court Maintenance Block Check (BR-05)
    const reqStartHour = parseInt(parsed.startTime.split(':')[0], 10);
    const existingBlocks = await db
      .select()
      .from(courtBlocks)
      .where(and(eq(courtBlocks.courtId, parsed.courtId), eq(courtBlocks.blockDate, parsed.date)));

    const isBlocked = existingBlocks.some((blk) => {
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

    const [newBooking] = await db.insert(bookings).values({
      bookingReference: bookingRef,
      userId: req.user.id,
      facilityId: facility.id,
      courtId: court.id,
      sport: court.sport,
      bookingDate: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      amount: calculatedAmount,
      paymentStatus: 'PENDING',
      bookingStatus: 'CONFIRMED',
    }).returning();

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
export const processPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, paymentMethod } = paymentSchema.parse(req.body);

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized payment attempt' });
    }

    // Update payment status & booking status in transaction
    const { updatedBooking, newPayment } = await db.transaction(async (tx) => {
      const [b] = await tx
        .update(bookings)
        .set({
          paymentStatus: 'PAID',
          bookingStatus: 'CONFIRMED',
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, bookingId))
        .returning();

      const [p] = await tx.insert(payments).values({
        bookingId: bookingId,
        amount: b.amount,
        status: 'PAID',
        provider: 'SIMULATED',
        transactionId: `TXN-${Date.now()}`,
        paidAt: new Date(),
      }).returning();

      return { updatedBooking: b, newPayment: p };
    });

    return res.json({
      success: true,
      message: 'Simulated payment successful. Booking confirmed!',
      booking: updatedBooking,
      payment: newPayment,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Payment failed' });
  }
};

// GET /api/bookings - Get user's own bookings (PRD 11 & BR-08)
export const getMyBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const list = await db.select().from(bookings).where(eq(bookings.userId, req.user.id));

    const enriched = await Promise.all(
      list.map(async (b) => {
        const [facility] = await db.select().from(facilities).where(eq(facilities.id, b.facilityId)).limit(1);
        const [court] = await db.select().from(courts).where(eq(courts.id, b.courtId)).limit(1);
        return {
          ...b,
          facilityName: facility ? facility.name : 'Unknown Facility',
          facilityAddress: facility ? `${facility.address}, ${facility.city}` : '',
          courtName: court ? court.name : 'Unknown Court',
        };
      })
    );

    return res.json({
      success: true,
      count: enriched.length,
      bookings: enriched,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to get bookings' });
  }
};

// GET /api/bookings/:id - Single booking details (PRD 11 & BR-08)
export const getBookingById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const [facility] = await db.select().from(facilities).where(eq(facilities.id, booking.facilityId)).limit(1);
    const [court] = await db.select().from(courts).where(eq(courts.id, booking.courtId)).limit(1);

    // Ownership check (BR-08): Users can only view their own bookings, unless owner or admin
    const isOwnerOfFacility = facility && req.user && facility.ownerId === req.user.id;
    const isCustomer = booking.userId === req.user?.id;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isCustomer && !isOwnerOfFacility && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied to this booking' });
    }

    return res.json({
      success: true,
      booking: {
        ...booking,
        facilityName: facility ? facility.name : 'Unknown Facility',
        facilityAddress: facility ? `${facility.address}, ${facility.city}` : '',
        courtName: court ? court.name : 'Unknown Court',
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to fetch booking details' });
  }
};

// PATCH /api/bookings/:id/cancel - Cancel eligible booking (PRD 11 & BR-08)
export const cancelBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership check
    if (booking.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only cancel your own bookings' });
    }

    if (booking.bookingStatus === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    const [updated] = await db
      .update(bookings)
      .set({
        bookingStatus: 'CANCELLED',
        cancellationReason: reason || 'User requested cancellation',
        cancelledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, id))
      .returning();

    return res.json({
      success: true,
      message: 'Booking cancelled successfully. Slot is now available.',
      booking: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to cancel booking' });
  }
};
