import { Response } from 'express';
import { z } from 'zod';
import { mockFacilities, mockCourts } from '../data/mockStore';
import { Court, CourtStatus } from '../types';
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
export const getCourtsByFacility = (req: AuthenticatedRequest, res: Response) => {
  const { facilityId } = req.params;
  const facility = mockFacilities.find((f) => f.id === facilityId);

  if (!facility) {
    return res.status(404).json({ success: false, message: 'Facility not found' });
  }

  // Ownership check (BR-04): Owners can see all courts. Public can see ACTIVE courts.
  const isOwner = req.user && req.user.id === facility.ownerId;
  const isAdmin = req.user && req.user.role === 'ADMIN';

  let courts = mockCourts.filter((c) => c.facilityId === facilityId);

  if (!isOwner && !isAdmin) {
    courts = courts.filter((c) => c.status === 'ACTIVE');
  }

  return res.json({
    success: true,
    count: courts.length,
    courts,
  });
};

// POST /api/facilities/:facilityId/courts - Add court to facility (Owner side)
export const createCourt = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { facilityId } = req.params;
    const facility = mockFacilities.find((f) => f.id === facilityId);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    // Ownership check (BR-04)
    if (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not have permission to add courts to this facility' });
    }

    const parsed = createCourtSchema.parse(req.body);

    const newCourt: Court = {
      id: `crt-${Date.now()}`,
      facilityId,
      name: parsed.name,
      sport: parsed.sport,
      pricePerHour: parsed.pricePerHour,
      openingTime: parsed.openingTime,
      closingTime: parsed.closingTime,
      status: parsed.status as CourtStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCourts.push(newCourt);

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
export const updateCourt = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { courtId } = req.params;
    const courtIndex = mockCourts.findIndex((c) => c.id === courtId);

    if (courtIndex === -1) {
      return res.status(404).json({ success: false, message: 'Court not found' });
    }

    const court = mockCourts[courtIndex];
    const facility = mockFacilities.find((f) => f.id === court.facilityId);

    // Ownership check (BR-04)
    if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
      return res.status(403).json({ success: false, message: 'You do not have permission to manage this court' });
    }

    const parsed = updateCourtSchema.parse(req.body);

    const updatedCourt: Court = {
      ...court,
      ...parsed,
      updatedAt: new Date().toISOString(),
    };

    mockCourts[courtIndex] = updatedCourt;

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
export const deleteCourt = (req: AuthenticatedRequest, res: Response) => {
  const { courtId } = req.params;
  const courtIndex = mockCourts.findIndex((c) => c.id === courtId);

  if (courtIndex === -1) {
    return res.status(404).json({ success: false, message: 'Court not found' });
  }

  const court = mockCourts[courtIndex];
  const facility = mockFacilities.find((f) => f.id === court.facilityId);

  // Ownership check (BR-04)
  if (!facility || (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN')) {
    return res.status(403).json({ success: false, message: 'You do not have permission to delete this court' });
  }

  // Soft deactivate court
  court.status = 'INACTIVE';
  court.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: 'Court deactivated successfully',
    court,
  });
};
