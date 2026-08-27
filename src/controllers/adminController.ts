import { Response } from 'express';
import { z } from 'zod';
import { mockUsers, mockFacilities, mockCourts, mockBookings } from '../data/mockStore';
import { AuthenticatedRequest } from '../middleware/auth';

const rejectionSchema = z.object({
  reason: z.string().optional(),
});

// GET /api/admin/dashboard - Platform-wide statistics KPIs (PRD Section 19)
export const getAdminDashboard = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Only platform admins can access the admin dashboard' });
  }

  const totalUsers = mockUsers.filter((u) => u.role === 'USER').length;
  const totalFacilityOwners = mockUsers.filter((u) => u.role === 'FACILITY_OWNER').length;
  const totalFacilities = mockFacilities.length;
  const pendingFacilities = mockFacilities.filter((f) => f.status === 'PENDING').length;
  const approvedFacilities = mockFacilities.filter((f) => f.status === 'APPROVED').length;
  const totalBookings = mockBookings.length;
  const activeCourts = mockCourts.filter((c) => c.status === 'ACTIVE').length;

  const totalBookingValue = mockBookings
    .filter((b) => b.paymentStatus === 'PAID' && b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.amount, 0);

  return res.json({
    success: true,
    kpis: {
      totalUsers,
      totalFacilityOwners,
      totalFacilities,
      pendingFacilities,
      approvedFacilities,
      totalBookings,
      activeCourts,
      totalBookingValue,
    },
  });
};

// GET /api/admin/facilities/pending - List pending facilities for approval (PRD Section 20)
export const getPendingFacilities = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin role required' });
  }

  const pendingFacilities = mockFacilities.filter((f) => f.status === 'PENDING');

  const enriched = pendingFacilities.map((f) => {
    const owner = mockUsers.find((u) => u.id === f.ownerId);
    return {
      ...f,
      ownerName: owner ? owner.name : 'Unknown Owner',
      ownerEmail: owner ? owner.email : 'Unknown Email',
    };
  });

  return res.json({
    success: true,
    count: enriched.length,
    facilities: enriched,
  });
};

// PATCH /api/admin/facilities/:id/approve - Approve facility (PRD Section 20)
export const approveFacility = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin role required' });
  }

  const { id } = req.params;
  const facilityIndex = mockFacilities.findIndex((f) => f.id === id);

  if (facilityIndex === -1) {
    return res.status(404).json({ success: false, message: 'Facility not found' });
  }

  const facility = mockFacilities[facilityIndex];
  facility.status = 'APPROVED';
  facility.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `Facility "${facility.name}" has been approved and is now publicly visible.`,
    facility,
  });
};

// PATCH /api/admin/facilities/:id/reject - Reject facility with reason (PRD Section 20)
export const rejectFacility = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin role required' });
  }

  const { id } = req.params;
  const facilityIndex = mockFacilities.findIndex((f) => f.id === id);

  if (facilityIndex === -1) {
    return res.status(404).json({ success: false, message: 'Facility not found' });
  }

  const { reason } = rejectionSchema.parse(req.body);
  const facility = mockFacilities[facilityIndex];

  facility.status = 'REJECTED';
  facility.rejectionReason = reason || 'Facility details do not meet QuickCourt compliance guidelines.';
  facility.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `Facility "${facility.name}" has been rejected.`,
    facility,
  });
};

// GET /api/admin/users - Search, filter, and view platform users (PRD Section 21)
export const getAdminUsers = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin role required' });
  }

  const { search, role, status } = req.query;

  let users = mockUsers.map((u) => {
    const userBookings = mockBookings.filter((b) => b.userId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      isVerified: u.isVerified,
      createdAt: u.createdAt,
      totalBookingsCount: userBookings.length,
    };
  });

  // Search filter (by name or email)
  if (search) {
    const q = (search as string).toLowerCase();
    users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }

  // Filter by role
  if (role) {
    users = users.filter((u) => u.role.toUpperCase() === (role as string).toUpperCase());
  }

  // Filter by status
  if (status) {
    users = users.filter((u) => u.status.toUpperCase() === (status as string).toUpperCase());
  }

  return res.json({
    success: true,
    count: users.length,
    users,
  });
};

// PATCH /api/admin/users/:id/ban - Ban user (PRD Section 21 & BR-11)
export const banUser = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin role required' });
  }

  const { id } = req.params;
  const userIndex = mockUsers.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const user = mockUsers[userIndex];
  if (user.role === 'ADMIN') {
    return res.status(400).json({ success: false, message: 'Cannot ban another Admin user' });
  }

  user.status = 'BANNED';
  user.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `User "${user.name}" has been banned. They can no longer create bookings.`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
};

// PATCH /api/admin/users/:id/unban - Unban user (PRD Section 21)
export const unbanUser = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin role required' });
  }

  const { id } = req.params;
  const userIndex = mockUsers.findIndex((u) => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const user = mockUsers[userIndex];
  user.status = 'ACTIVE';
  user.updatedAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `User "${user.name}" has been unbanned and restored to ACTIVE status.`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
  });
};
