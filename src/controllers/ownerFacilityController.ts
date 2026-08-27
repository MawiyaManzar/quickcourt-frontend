import { Response } from 'express';
import { z } from 'zod';
import { mockFacilities } from '../data/mockStore';
import { Facility } from '../types';
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

// POST /api/facilities - Register new facility (Owner side)
export const createFacility = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ success: false, message: 'Only facility owners can create facilities' });
    }

    const parsed = createFacilitySchema.parse(req.body);

    const newFacility: Facility = {
      id: `fac-${Date.now()}`,
      ownerId: req.user.id,
      name: parsed.name,
      description: parsed.description,
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      postalCode: parsed.postalCode,
      phone: parsed.phone,
      sports: parsed.sports,
      amenities: parsed.amenities,
      images: parsed.images,
      status: 'PENDING', // Initial status starts as PENDING until Admin approval (BR-12)
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockFacilities.push(newFacility);

    return res.status(201).json({
      success: true,
      message: 'Facility created successfully. Pending admin approval.',
      facility: newFacility,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create facility' });
  }
};

// GET /api/facilities/my - List facilities for logged-in facility owner
export const getMyFacilities = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'FACILITY_OWNER') {
    return res.status(403).json({ success: false, message: 'Only facility owners can view their facilities' });
  }

  const facilities = mockFacilities.filter((f) => f.ownerId === req.user?.id);

  return res.json({
    success: true,
    count: facilities.length,
    facilities,
  });
};

// GET /api/facilities/:id - Get specific facility details for owner (or public if approved)
export const getFacilityById = (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const facility = mockFacilities.find((f) => f.id === id);

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

  return res.json({
    success: true,
    facility,
  });
};

// PATCH /api/facilities/:id - Update facility information (Owner side)
export const updateFacility = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const facilityIndex = mockFacilities.findIndex((f) => f.id === id);

    if (facilityIndex === -1) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    const facility = mockFacilities[facilityIndex];

    // Ownership check (BR-03)
    if (facility.ownerId !== req.user?.id && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You do not have permission to edit this facility' });
    }

    const parsed = updateFacilitySchema.parse(req.body);

    const updatedFacility: Facility = {
      ...facility,
      ...parsed,
      updatedAt: new Date().toISOString(),
    };

    mockFacilities[facilityIndex] = updatedFacility;

    return res.json({
      success: true,
      message: 'Facility updated successfully',
      facility: updatedFacility,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update facility' });
  }
};
