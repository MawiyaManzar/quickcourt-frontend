import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { facilities, facilitySports } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';

const createFacilitySchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(4),
  phone: z.string().min(8),
  sports: z.array(z.string()).min(1),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
});

const updateFacilitySchema = createFacilitySchema.partial();

// Helper to validate and format sports to enum values
const validateSports = (sportsList: string[]): any[] => {
  const validSports = ["BADMINTON", "FOOTBALL", "CRICKET", "TENNIS", "BASKETBALL", "TABLE_TENNIS", "VOLLEYBALL"];
  return sportsList
    .map((s) => s.toUpperCase().replace(' ', '_'))
    .filter((s) => validSports.includes(s));
};

// POST /api/facilities - Register new facility (Owner side)
export const createFacility = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ success: false, message: 'Only facility owners can create facilities' });
    }

    const parsed = createFacilitySchema.parse(req.body);
    const sportsFormatted = validateSports(parsed.sports);

    if (sportsFormatted.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide at least one valid sport' });
    }

    // Run in a transaction
    const newFacility = await db.transaction(async (tx) => {
      const [fac] = await tx.insert(facilities).values({
        ownerId: req.user!.id,
        name: parsed.name,
        description: parsed.description,
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
        postalCode: parsed.postalCode,
        phone: parsed.phone,
        amenities: parsed.amenities,
        images: parsed.images,
        status: 'PENDING',
      }).returning();

      for (const sportVal of sportsFormatted) {
        await tx.insert(facilitySports).values({
          facilityId: fac.id,
          sport: sportVal,
        });
      }

      return fac;
    });

    return res.status(201).json({
      success: true,
      message: 'Facility created successfully. Pending admin approval.',
      facility: {
        ...newFacility,
        sports: sportsFormatted,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create facility' });
  }
};

// GET /api/facilities/my - List facilities for logged-in facility owner
export const getMyFacilities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ success: false, message: 'Only facility owners can view their facilities' });
    }

    const list = await db
      .select()
      .from(facilities)
      .where(eq(facilities.ownerId, req.user.id));

    const enriched = await Promise.all(
      list.map(async (f) => {
        const sports = await db
          .select({ sport: facilitySports.sport })
          .from(facilitySports)
          .where(eq(facilitySports.facilityId, f.id));
        return {
          ...f,
          sports: sports.map((s) => s.sport),
        };
      })
    );

    return res.json({
      success: true,
      count: enriched.length,
      facilities: enriched,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to fetch facilities' });
  }
};

// GET /api/facilities/:id - Get specific facility details for owner (or public if approved)
export const getFacilityById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, id)).limit(1);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Ownership check (BR-03): If non-approved, only owner or admin can view
    if (facility.status !== 'APPROVED') {
      const isOwner = req.user && req.user.id === facility.ownerId;
      const isAdmin = req.user && req.user.role === 'ADMIN';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Facility is pending approval' });
      }
    }

    const sports = await db
      .select({ sport: facilitySports.sport })
      .from(facilitySports)
      .where(eq(facilitySports.facilityId, facility.id));

    return res.json({
      success: true,
      facility: {
        ...facility,
        sports: sports.map((s) => s.sport),
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to fetch facility details' });
  }
};

// PATCH /api/facilities/:id - Update facility information (Owner side)
export const updateFacility = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, id)).limit(1);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Ownership check (BR-03)
    if (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this facility' });
    }

    const parsed = updateFacilitySchema.parse(req.body);

    const updated = await db.transaction(async (tx) => {
      const [fac] = await tx
        .update(facilities)
        .set({
          ...(parsed.name ? { name: parsed.name } : {}),
          ...(parsed.description ? { description: parsed.description } : {}),
          ...(parsed.address ? { address: parsed.address } : {}),
          ...(parsed.city ? { city: parsed.city } : {}),
          ...(parsed.state ? { state: parsed.state } : {}),
          ...(parsed.postalCode ? { postalCode: parsed.postalCode } : {}),
          ...(parsed.phone ? { phone: parsed.phone } : {}),
          ...(parsed.amenities ? { amenities: parsed.amenities } : {}),
          ...(parsed.images ? { images: parsed.images } : {}),
          updatedAt: new Date(),
        })
        .where(eq(facilities.id, id))
        .returning();

      if (parsed.sports) {
        const sportsFormatted = validateSports(parsed.sports);
        if (sportsFormatted.length > 0) {
          // Re-populate sports
          await tx.delete(facilitySports).where(eq(facilitySports.facilityId, id));
          for (const sportVal of sportsFormatted) {
            await tx.insert(facilitySports).values({
              facilityId: id,
              sport: sportVal,
            });
          }
        }
      }

      return fac;
    });

    const sports = await db
      .select({ sport: facilitySports.sport })
      .from(facilitySports)
      .where(eq(facilitySports.facilityId, id));

    return res.json({
      success: true,
      message: 'Facility updated successfully',
      facility: {
        ...updated,
        sports: sports.map((s) => s.sport),
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update facility' });
  }
};
