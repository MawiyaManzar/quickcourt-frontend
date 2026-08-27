import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { courts, facilities, courtBlocks, bookings } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';

const createBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  reason: z.string().min(3),
});

// GET /api/courts/:courtId/availability - Get court slots + blocks for a specific date
export const getCourtAvailability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId } = req.params;
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const [court] = await db.select().from(courts).where(eq(courts.id, courtId)).limit(1);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    // Derive fixed 1-hour slots based on court operating hours (Section 7 PRD)
    const openHour = parseInt(court.openingTime.split(':')[0], 10);
    const closeHour = parseInt(court.closingTime.split(':')[0], 10);

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          eq(bookings.bookingDate, dateStr),
          eq(bookings.bookingStatus, 'CONFIRMED')
        )
      );

    const existingBlocks = await db
      .select()
      .from(courtBlocks)
      .where(and(eq(courtBlocks.courtId, courtId), eq(courtBlocks.blockDate, dateStr)));

    const slots = [];
    for (let hour = openHour; hour < closeHour; hour++) {
      const startTimeStr = `${hour.toString().padStart(2, '0')}:00:00`;
      const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00:00`;
      
      const startTimeFormatted = `${hour.toString().padStart(2, '0')}:00`;
      const endTimeFormatted = `${(hour + 1).toString().padStart(2, '0')}:00`;

      // Check if booked (drizzle returns string times like '18:00:00')
      const isBooked = existingBookings.some((b) => b.startTime.startsWith(startTimeFormatted));

      // Check if blocked
      const isBlocked = existingBlocks.some((blk) => {
        const blkStartHour = parseInt(blk.startTime.split(':')[0], 10);
        const blkEndHour = parseInt(blk.endTime.split(':')[0], 10);
        return hour >= blkStartHour && hour < blkEndHour;
      });

      let status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' = 'AVAILABLE';
      if (court.status === 'MAINTENANCE' || isBlocked) {
        status = 'MAINTENANCE';
      } else if (isBooked) {
        status = 'BOOKED';
      }

      slots.push({
        startTime: startTimeFormatted,
        endTime: endTimeFormatted,
        price: parseFloat(court.pricePerHour),
        status,
      });
    }

    return res.json({
      success: true,
      courtId,
      date: dateStr,
      courtName: court.name,
      sport: court.sport,
      courtStatus: court.status,
      slots,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to fetch court availability' });
  }
};

// POST /api/courts/:courtId/blocks - Block court for maintenance/events (Owner side)
export const createCourtBlock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId } = req.params;
    const [court] = await db.select().from(courts).where(eq(courts.id, courtId)).limit(1);

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const [facility] = await db.select().from(facilities).where(eq(facilities.id, court.facilityId)).limit(1);

    // Ownership check (BR-04, BR-05)
    if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'You do not have permission to block this court' });
    }

    const parsed = createBlockSchema.parse(req.body);

    const [newBlock] = await db.insert(courtBlocks).values({
      courtId,
      blockDate: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      reason: parsed.reason,
      createdBy: req.user!.id,
    }).returning();

    return res.status(201).json({
      success: true,
      message: 'Court blocked successfully',
      block: newBlock,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create block' });
  }
};

// DELETE /api/court-blocks/:blockId - Remove court block (Owner side)
export const deleteCourtBlock = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { blockId } = req.params;
    const [block] = await db.select().from(courtBlocks).where(eq(courtBlocks.id, blockId)).limit(1);

    if (!block) {
      return res.status(404).json({ success: false, message: 'Court block not found' });
    }

    const [court] = await db.select().from(courts).where(eq(courts.id, block.courtId)).limit(1);
    const facility = court 
      ? (await db.select().from(facilities).where(eq(facilities.id, court.facilityId)).limit(1))[0]
      : null;

    // Ownership check
    if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'You do not have permission to remove this block' });
    }

    await db.delete(courtBlocks).where(eq(courtBlocks.id, blockId));

    return res.json({
      success: true,
      message: 'Court block removed successfully',
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to remove block' });
  }
};
