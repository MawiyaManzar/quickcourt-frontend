import { Response } from 'express';
import { mockFacilities, mockCourts, mockBookings, mockUsers } from '../data/mockStore';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/owner/bookings - List all bookings across facilities belonging to the logged-in owner
export const getOwnerBookings = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'FACILITY_OWNER') {
    return res.status(403).json({ success: false, message: 'Only facility owners can access owner bookings' });
  }

  // Find all facility IDs belonging to this owner
  const ownerFacilityIds = mockFacilities
    .filter((f) => f.ownerId === req.user?.id)
    .map((f) => f.id);

  // Filter bookings for these facilities (BR-09)
  let ownerBookings = mockBookings.filter((b) => ownerFacilityIds.includes(b.facilityId));

  // Optional status filtering (?status=CONFIRMED | CANCELLED | COMPLETED)
  const statusFilter = req.query.status as string;
  if (statusFilter) {
    ownerBookings = ownerBookings.filter((b) => b.status.toUpperCase() === statusFilter.toUpperCase());
  }

  // Map enriched user/court details
  const enrichedBookings = ownerBookings.map((booking) => {
    const customer = mockUsers.find((u) => u.id === booking.userId);
    const facility = mockFacilities.find((f) => f.id === booking.facilityId);
    const court = mockCourts.find((c) => c.id === booking.courtId);

    return {
      ...booking,
      customerName: customer ? customer.name : 'Unknown User',
      customerEmail: customer ? customer.email : 'Unknown Email',
      facilityName: facility ? facility.name : 'Unknown Facility',
      courtName: court ? court.name : 'Unknown Court',
    };
  });

  return res.json({
    success: true,
    count: enrichedBookings.length,
    bookings: enrichedBookings,
  });
};

// GET /api/owner/analytics - Detailed facility owner KPIs and insights (Section 13 & 18 PRD)
export const getOwnerAnalytics = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user || req.user.role !== 'FACILITY_OWNER') {
    return res.status(403).json({ success: false, message: 'Only facility owners can access analytics' });
  }

  const ownerFacilities = mockFacilities.filter((f) => f.ownerId === req.user?.id);
  const ownerFacilityIds = ownerFacilities.map((f) => f.id);
  const ownerCourts = mockCourts.filter((c) => ownerFacilityIds.includes(c.facilityId));
  const ownerBookings = mockBookings.filter((b) => ownerFacilityIds.includes(b.facilityId));

  const totalBookings = ownerBookings.length;
  const activeCourts = ownerCourts.filter((c) => c.status === 'ACTIVE').length;

  const totalRevenue = ownerBookings
    .filter((b) => b.paymentStatus === 'PAID' && b.status !== 'CANCELLED')
    .reduce((sum, b) => sum + b.amount, 0);

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingBookings = ownerBookings.filter(
    (b) => b.date >= todayStr && b.status === 'CONFIRMED'
  ).length;

  // Revenue & booking breakdown by sport
  const sportStats: Record<string, { bookings: number; revenue: number }> = {};
  ownerBookings.forEach((b) => {
    if (!sportStats[b.sport]) {
      sportStats[b.sport] = { bookings: 0, revenue: 0 };
    }
    sportStats[b.sport].bookings += 1;
    if (b.paymentStatus === 'PAID' && b.status !== 'CANCELLED') {
      sportStats[b.sport].revenue += b.amount;
    }
  });

  // Popular time hours analysis
  const hourPopularity: Record<string, number> = {};
  ownerBookings.forEach((b) => {
    hourPopularity[b.startTime] = (hourPopularity[b.startTime] || 0) + 1;
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
};
