import { Response } from 'express';
import { z } from 'zod';
import { mockCourts, mockFacilities, mockBlocks, mockBookings } from '../data/mockStore';
import { CourtBlock } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

const createBlockSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format HH:mm'),
  reason: z.string().min(3),
});

// GET /api/courts/:courtId/availability - Get court slots + blocks for a specific date
export const getCourtAvailability = (req: AuthenticatedRequest, res: Response) => {
  const { courtId } = req.params;
  const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];

  const court = mockCourts.find((c) => c.id === courtId);
  if (!court) {
    return res.status(404).json({ success: false, message: 'Court not found' });
  }

  // Derive fixed 1-hour slots based on court operating hours (Section 7 PRD)
  const openHour = parseInt(court.openingTime.split(':')[0], 10);
  const closeHour = parseInt(court.closingTime.split(':')[0], 10);

  const existingBookings = mockBookings.filter(
    (b) => b.courtId === courtId && b.date === dateStr && b.status === 'CONFIRMED'
  );

  const existingBlocks = mockBlocks.filter(
    (blk) => blk.courtId === courtId && blk.date === dateStr
  );

  const slots = [];
  for (let hour = openHour; hour < closeHour; hour++) {
    const startTimeStr = `${hour.toString().padStart(2, '0')}:00`;
    const endTimeStr = `${(hour + 1).toString().padStart(2, '0')}:00`;

    const isBooked = existingBookings.some((b) => b.startTime === startTimeStr);
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
      startTime: startTimeStr,
      endTime: endTimeStr,
      price: court.pricePerHour,
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
};

// POST /api/courts/:courtId/blocks - Block court for maintenance/events (Owner side)
export const createCourtBlock = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId } = req.params;
    const court = mockCourts.find((c) => c.id === courtId);

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const facility = mockFacilities.find((f) => f.id === court.facilityId);

    // Ownership check (BR-04, BR-05)
    if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'You do not have permission to block this court' });
    }

    const parsed = createBlockSchema.parse(req.body);

    const newBlock: CourtBlock = {
      id: `blk-${Date.now()}`,
      courtId,
      date: parsed.date,
      startTime: parsed.startTime,
      endTime: parsed.endTime,
      reason: parsed.reason,
      createdById: req.user!.id,
      createdAt: new Date().toISOString(),
    };

    mockBlocks.push(newBlock);

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
export const deleteCourtBlock = (req: AuthenticatedRequest, res: Response) => {
  const { blockId } = req.params;
  const blockIndex = mockBlocks.findIndex((b) => b.id === blockId);

  if (blockIndex === -1) {
    return res.status(404).json({ success: false, message: 'Court block not found' });
  }

  const block = mockBlocks[blockIndex];
  const court = mockCourts.find((c) => c.id === block.courtId);
  const facility = court ? mockFacilities.find((f) => f.id === court.facilityId) : null;

  // Ownership check
  if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, message: 'You do not have permission to remove this block' });
  }

  mockBlocks.splice(blockIndex, 1);

  return res.json({
    success: true,
    message: 'Court block removed successfully',
  });
};
