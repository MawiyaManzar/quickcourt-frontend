import { Response } from 'express';
import { db } from '../db';
import { courts, bookings, courtBlocks } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/smart-picks - Rule-based slot recommendation engine (PRD Section 9)
export const getSmartPicks = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      return res.status(400).json({ success: false, message: 'courtId and date parameters are required' });
    }

    const [court] = await db.select().from(courts).where(eq(courts.id, courtId as string)).limit(1);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const openHour = parseInt(court.openingTime.split(':')[0], 10);
    const closeHour = parseInt(court.closingTime.split(':')[0], 10);
    const dateStr = date as string;

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId as string),
          eq(bookings.bookingDate, dateStr),
          eq(bookings.bookingStatus, 'CONFIRMED')
        )
      );

    const existingBlocks = await db
      .select()
      .from(courtBlocks)
      .where(and(eq(courtBlocks.courtId, courtId as string), eq(courtBlocks.blockDate, dateStr)));

    const availableSlots: { startTime: string; endTime: string; hour: number }[] = [];

    for (let hour = openHour; hour < closeHour; hour++) {
      const startTimeFormatted = `${hour.toString().padStart(2, '0')}:00`;
      const endTimeFormatted = `${(hour + 1).toString().padStart(2, '0')}:00`;

      const isBooked = existingBookings.some((b) => b.startTime.startsWith(startTimeFormatted));
      const isBlocked = existingBlocks.some((blk) => {
        const blkStartHour = parseInt(blk.startTime.split(':')[0], 10);
        const blkEndHour = parseInt(blk.endTime.split(':')[0], 10);
        return hour >= blkStartHour && hour < blkEndHour;
      });

      if (!isBooked && !isBlocked && court.status === 'ACTIVE') {
        availableSlots.push({ startTime: startTimeFormatted, endTime: endTimeFormatted, hour });
      }
    }

    if (availableSlots.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No available slots for this court on the selected date.',
      });
    }

    // Rule-based logic (PRD Section 9):
    // 1. Most popular prime time: 18:00 - 20:00 (Evening)
    // 2. Best availability / Off-peak: Morning (06:00 - 09:00) or Afternoon (14:00 - 16:00)
    // 3. Budget / Cheapest choice

    const recommendations = [];
    const courtPrice = parseFloat(court.pricePerHour);

    // Popular prime slot check
    const primeSlot = availableSlots.find((s) => s.hour >= 18 && s.hour <= 20) || availableSlots[0];
    recommendations.push({
      badge: 'Most Popular',
      startTime: primeSlot.startTime,
      endTime: primeSlot.endTime,
      price: courtPrice,
      reason: 'High demand evening prime time',
    });

    // Best Availability / Off-peak
    const offPeakSlot = availableSlots.find((s) => s.hour < 12 || (s.hour >= 14 && s.hour <= 16)) || availableSlots[availableSlots.length - 1];
    if (offPeakSlot && offPeakSlot.startTime !== primeSlot.startTime) {
      recommendations.push({
        badge: 'Best Availability',
        startTime: offPeakSlot.startTime,
        endTime: offPeakSlot.endTime,
        price: courtPrice,
        reason: 'Uncrowded time with maximum slot choices',
      });
    }

    // Value pick (if multiple courts exist, or discounted off-peak rate)
    const valueSlot = availableSlots.find((s) => s.hour < 11) || availableSlots[0];
    if (valueSlot && valueSlot.startTime !== primeSlot.startTime && valueSlot.startTime !== offPeakSlot?.startTime) {
      recommendations.push({
        badge: 'Smart Value',
        startTime: valueSlot.startTime,
        endTime: valueSlot.endTime,
        price: courtPrice,
        reason: 'Ideal early bird morning session',
      });
    }

    return res.json({
      success: true,
      courtId,
      date: dateStr,
      recommendations,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Smart Pick failed' });
  }
};
