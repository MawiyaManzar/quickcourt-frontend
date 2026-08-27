import { Response } from 'express';
import { db } from '../db';
import { facilities, courts, bookings, users } from '../db/schema';
import { eq, and, inArray, gte } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/owner/bookings - List all bookings across facilities belonging to the logged-in owner
export const getOwnerBookings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ success: false, message: 'Only facility owners can access owner bookings' });
    }

    // Find all facility IDs belonging to this owner
    const ownerFacilities = await db
      .select({ id: facilities.id })
      .from(facilities)
      .where(eq(facilities.ownerId, req.user.id));

    const ownerFacilityIds = ownerFacilities.map((f) => f.id);
    if (ownerFacilityIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        bookings: [],
      });
    }

    // Filter bookings for these facilities (BR-09)
    const conditions = [inArray(bookings.facilityId, ownerFacilityIds)];

    // Optional status filtering (?status=CONFIRMED | CANCELLED | COMPLETED)
    const statusFilter = req.query.status as string;
    if (statusFilter) {
      conditions.push(eq(bookings.bookingStatus, statusFilter.toUpperCase() as any));
    }

    const list = await db
      .select()
      .from(bookings)
      .where(and(...conditions));

    // Map enriched user/court details
    const enrichedBookings = await Promise.all(
      list.map(async (booking) => {
        const [customer] = await db
          .select({ name: users.name, email: users.email })
          .from(users)
          .where(eq(users.id, booking.userId))
          .limit(1);

        const [facility] = await db
          .select({ name: facilities.name })
          .from(facilities)
          .where(eq(facilities.id, booking.facilityId))
          .limit(1);

        const [court] = await db
          .select({ name: courts.name })
          .from(courts)
          .where(eq(courts.id, booking.courtId))
          .limit(1);

        return {
          ...booking,
          customerName: customer ? customer.name : 'Unknown User',
          customerEmail: customer ? customer.email : 'Unknown Email',
          facilityName: facility ? facility.name : 'Unknown Facility',
          courtName: court ? court.name : 'Unknown Court',
        };
      })
    );

    return res.json({
      success: true,
      count: enrichedBookings.length,
      bookings: enrichedBookings,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to fetch owner bookings' });
  }
};

// GET /api/owner/analytics - Detailed facility owner KPIs and insights (Section 13 & 18 PRD)
export const getOwnerAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'FACILITY_OWNER') {
      return res.status(403).json({ success: false, message: 'Only facility owners can access analytics' });
    }

    const ownerFacilities = await db
      .select()
      .from(facilities)
      .where(eq(facilities.ownerId, req.user.id));

    const ownerFacilityIds = ownerFacilities.map((f) => f.id);
    if (ownerFacilityIds.length === 0) {
      return res.json({
        success: true,
        kpis: {
          totalBookings: 0,
          activeCourts: 0,
          totalRevenue: 0,
          upcomingBookings: 0,
          totalFacilities: 0,
        },
        analytics: {
          sportBreakdown: {},
          popularHours: {},
        },
      });
    }

    const ownerCourts = await db
      .select()
      .from(courts)
      .where(inArray(courts.facilityId, ownerFacilityIds));

    const ownerBookings = await db
      .select()
      .from(bookings)
      .where(inArray(bookings.facilityId, ownerFacilityIds));

    const totalBookings = ownerBookings.length;
    const activeCourts = ownerCourts.filter((c) => c.status === 'ACTIVE').length;

    const totalRevenue = ownerBookings
      .filter((b) => b.paymentStatus === 'PAID' && b.bookingStatus !== 'CANCELLED')
      .reduce((sum, b) => sum + parseFloat(b.amount), 0);

    const todayStr = new Date().toISOString().split('T')[0];
    const upcomingBookings = ownerBookings.filter(
      (b) => b.bookingDate >= todayStr && b.bookingStatus === 'CONFIRMED'
    ).length;

    // Revenue & booking breakdown by sport
    const sportStats: Record<string, { bookings: number; revenue: number }> = {};
    ownerBookings.forEach((b) => {
      const sportKey = b.sport;
      if (!sportStats[sportKey]) {
        sportStats[sportKey] = { bookings: 0, revenue: 0 };
      }
      sportStats[sportKey].bookings += 1;
      if (b.paymentStatus === 'PAID' && b.bookingStatus !== 'CANCELLED') {
        sportStats[sportKey].revenue += parseFloat(b.amount);
      }
    });

    // Popular time hours analysis
    const hourPopularity: Record<string, number> = {};
    ownerBookings.forEach((b) => {
      const timeKey = b.startTime.substring(0, 5); // formatting '18:00:00' to '18:00'
      hourPopularity[timeKey] = (hourPopularity[timeKey] || 0) + 1;
    });

    return res.json({
      success: true,
      kpis: {
        totalBookings,
        activeCourts,
        totalRevenue,
        upcomingBookings,
        totalFacilities: ownerFacilities.length,
      },
      analytics: {
        sportBreakdown: sportStats,
        popularHours: hourPopularity,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to fetch analytics' });
  }
};
