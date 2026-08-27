import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { facilities, courts } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';

const createCourtSchema = z.object({
  name: z.string().min(2),
  sport: z.string().min(2),
  pricePerHour: z.number().positive(),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm'),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format HH:mm'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).default('ACTIVE'),
});

const updateCourtSchema = createCourtSchema.partial();

// GET /api/facilities/:facilityId/courts - List courts for a facility
export const getCourtsByFacility = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { facilityId } = req.params;
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Ownership check (BR-04): Owners can see all courts. Public can see ACTIVE courts.
    const isOwner = req.user && req.user.id === facility.ownerId;
    const isAdmin = req.user && req.user.role === 'ADMIN';

    let list = await db.select().from(courts).where(eq(courts.facilityId, facilityId));

    if (!isOwner && !isAdmin) {
      list = list.filter((c) => c.status === 'ACTIVE');
    }

    return res.json({
      success: true,
      count: list.length,
      courts: list,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to list courts' });
  }
};

// POST /api/facilities/:facilityId/courts - Add court to facility (Owner side)
export const createCourt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { facilityId } = req.params;
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, facilityId)).limit(1);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Ownership check (BR-04)
    if (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not have permission to add courts to this facility' });
    }

    const parsed = createCourtSchema.parse(req.body);
    const sportFormatted = parsed.sport.toUpperCase().replace(' ', '_');

    const [newCourt] = await db.insert(courts).values({
      facilityId,
      name: parsed.name,
      sport: sportFormatted as any,
      pricePerHour: parsed.pricePerHour.toString(),
      openingTime: parsed.openingTime,
      closingTime: parsed.closingTime,
      status: parsed.status,
    }).returning();

    return res.status(201).json({
      success: true,
      message: 'Court added successfully',
      court: newCourt,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to add court' });
  }
};

// PATCH /api/courts/:courtId - Edit court pricing, hours, status (Owner side)
export const updateCourt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId } = req.params;
    const [court] = await db.select().from(courts).where(eq(courts.id, courtId)).limit(1);

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const [facility] = await db.select().from(facilities).where(eq(facilities.id, court.facilityId)).limit(1);

    // Ownership check (BR-04)
    if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'You do not have permission to manage this court' });
    }

    const parsed = updateCourtSchema.parse(req.body);
    const sportFormatted = parsed.sport ? parsed.sport.toUpperCase().replace(' ', '_') : undefined;

    const [updatedCourt] = await db
      .update(courts)
      .set({
        ...(parsed.name ? { name: parsed.name } : {}),
        ...(sportFormatted ? { sport: sportFormatted as any } : {}),
        ...(parsed.pricePerHour ? { pricePerHour: parsed.pricePerHour.toString() } : {}),
        ...(parsed.openingTime ? { openingTime: parsed.openingTime } : {}),
        ...(parsed.closingTime ? { closingTime: parsed.closingTime } : {}),
        ...(parsed.status ? { status: parsed.status } : {}),
        updatedAt: new Date(),
      })
      .where(eq(courts.id, courtId))
      .returning();

    return res.json({
      success: true,
      message: 'Court updated successfully',
      court: updatedCourt,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update court' });
  }
};

// DELETE /api/courts/:courtId - Deactivate/Remove court (Owner side)
export const deleteCourt = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId } = req.params;
    const [court] = await db.select().from(courts).where(eq(courts.id, courtId)).limit(1);

    if (!court) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const [facility] = await db.select().from(facilities).where(eq(facilities.id, court.facilityId)).limit(1);

    // Ownership check (BR-04)
    if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'You do not have permission to delete this court' });
    }

    // Soft deactivate court
    const [updated] = await db
      .update(courts)
      .set({
        status: 'INACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(courts.id, courtId))
      .returning();

    return res.json({
      success: true,
      message: 'Court deactivated successfully',
      court: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete court' });
  }
};
