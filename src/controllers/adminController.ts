import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users, facilities, courts, bookings } from '../db/schema';
import { eq, and, or, ilike, ne } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';

const rejectionSchema = z.object({
  reason: z.string().optional(),
});

// GET /api/admin/dashboard - Platform-wide statistics KPIs (PRD Section 19)
export const getAdminDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Only platform admins can access the admin dashboard' });
    }

    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.filter((u) => u.role === 'USER').length;
    const totalFacilityOwners = allUsers.filter((u) => u.role === 'FACILITY_OWNER').length;

    const allFacilities = await db.select().from(facilities);
    const totalFacilities = allFacilities.length;
    const pendingFacilities = allFacilities.filter((f) => f.status === 'PENDING').length;
    const approvedFacilities = allFacilities.filter((f) => f.status === 'APPROVED').length;

    const allBookings = await db.select().from(bookings);
    const totalBookings = allBookings.length;

    const allCourts = await db.select().from(courts);
    const activeCourts = allCourts.filter((c) => c.status === 'ACTIVE').length;

    const totalBookingValue = allBookings
      .filter((b) => b.paymentStatus === 'PAID' && b.bookingStatus !== 'CANCELLED')
      .reduce((sum, b) => sum + parseFloat(b.amount), 0);

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
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Dashboard failed' });
  }
};

// GET /api/admin/facilities/pending - List pending facilities for approval (PRD Section 20)
export const getPendingFacilities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin role required' });
    }

    const pendingList = await db
      .select()
      .from(facilities)
      .where(eq(facilities.status, 'PENDING'));

    const enriched = await Promise.all(
      pendingList.map(async (f) => {
        const [owner] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, f.ownerId))
          .limit(1);
        return {
          ...f,
          ownerName: owner ? owner.name : 'Unknown Owner',
          ownerEmail: owner ? owner.email : 'Unknown Email',
        };
      })
    );

    return res.json({
      success: true,
      count: enriched.length,
      facilities: enriched,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to list pending facilities' });
  }
};

// PATCH /api/admin/facilities/:id/approve - Approve facility (PRD Section 20)
export const approveFacility = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin role required' });
    }

    const { id } = req.params;
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, id)).limit(1);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    const [updated] = await db
      .update(facilities)
      .set({
        status: 'APPROVED',
        updatedAt: new Date(),
      })
      .where(eq(facilities.id, id))
      .returning();

    return res.json({
      success: true,
      message: `Facility "${updated.name}" has been approved and is now publicly visible.`,
      facility: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Approval failed' });
  }
};

// PATCH /api/admin/facilities/:id/reject - Reject facility with reason (PRD Section 20)
export const rejectFacility = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin role required' });
    }

    const { id } = req.params;
    const [facility] = await db.select().from(facilities).where(eq(facilities.id, id)).limit(1);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Facility not found' });
    }

    const { reason } = rejectionSchema.parse(req.body);

    const [updated] = await db
      .update(facilities)
      .set({
        status: 'REJECTED',
        rejectionReason: reason || 'Facility details do not meet QuickCourt compliance guidelines.',
        updatedAt: new Date(),
      })
      .where(eq(facilities.id, id))
      .returning();

    return res.json({
      success: true,
      message: `Facility "${updated.name}" has been rejected.`,
      facility: updated,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Rejection failed' });
  }
};

// GET /api/admin/users - Search, filter, and view platform users (PRD Section 21)
export const getAdminUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin role required' });
    }

    const { search, role, status } = req.query;

    const conditions = [];

    // Search filter (by name or email)
    if (search) {
      const q = `%${search}%`;
      conditions.push(or(ilike(users.name, q), ilike(users.email, q)));
    }

    // Filter by role
    if (role) {
      conditions.push(eq(users.role, (role as string).toUpperCase() as any));
    }

    // Filter by status
    if (status) {
      conditions.push(eq(users.status, (status as string).toUpperCase() as any));
    }

    const list = await db
      .select()
      .from(users)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const enriched = await Promise.all(
      list.map(async (u) => {
        const userBookings = await db.select().from(bookings).where(eq(bookings.userId, u.id));
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status,
          isVerified: u.emailVerified,
          createdAt: u.createdAt,
          totalBookingsCount: userBookings.length,
        };
      })
    );

    return res.json({
      success: true,
      count: enriched.length,
      users: enriched,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to list users' });
  }
};

// PATCH /api/admin/users/:id/ban - Ban user (PRD Section 21 & BR-11)
export const banUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin role required' });
    }

    const { id } = req.params;
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot ban another Admin user' });
    }

    const [updated] = await db
      .update(users)
      .set({
        status: 'BANNED',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return res.json({
      success: true,
      message: `User "${updated.name}" has been banned. They can no longer create bookings.`,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to ban user' });
  }
};

// PATCH /api/admin/users/:id/unban - Unban user (PRD Section 21)
export const unbanUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Admin role required' });
    }

    const { id } = req.params;
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const [updated] = await db
      .update(users)
      .set({
        status: 'ACTIVE',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return res.json({
      success: true,
      message: `User "${updated.name}" has been unbanned and restored to ACTIVE status.`,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to unban user' });
  }
};
