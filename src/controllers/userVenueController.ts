import { Request, Response } from 'express';
import { db } from '../db';
import { facilities, courts, facilitySports } from '../db/schema';
import { eq, and, or, ilike, inArray } from 'drizzle-orm';

// GET /api/venues - Public discovery for approved facilities with search & filter (PRD 5.2)
export const getVenues = async (req: Request, res: Response) => {
  try {
    const { search, sport, city, minPrice, maxPrice } = req.query;

    // We'll collect all conditions to filter facilities
    const conditions = [eq(facilities.status, 'APPROVED')];

    // City / Location filter
    if (city) {
      conditions.push(ilike(facilities.city, `%${city}%`));
    }

    // Sport filter - find facilities that support this sport
    if (sport) {
      const sportUpper = (sport as string).toUpperCase();
      const matchingSports = await db
        .select({ facilityId: facilitySports.facilityId })
        .from(facilitySports)
        .where(eq(facilitySports.sport, sportUpper as any));

      const facilityIds = matchingSports.map((s) => s.facilityId);
      if (facilityIds.length === 0) {
        return res.json({ success: true, count: 0, venues: [] });
      }
      conditions.push(inArray(facilities.id, facilityIds));
    }

    // Search filter (by facility name, city, or sport)
    if (search) {
      const q = `%${search}%`;
      // To also search in sports, let's find matching sports
      const searchUpper = (search as string).toUpperCase();
      const matchingSportsForSearch = await db
        .select({ facilityId: facilitySports.facilityId })
        .from(facilitySports)
        .where(eq(facilitySports.sport, searchUpper as any));

      const sportsFacilityIds = matchingSportsForSearch.map((s) => s.facilityId);

      const searchConditions = [
        ilike(facilities.name, q),
        ilike(facilities.city, q),
      ];

      if (sportsFacilityIds.length > 0) {
        searchConditions.push(inArray(facilities.id, sportsFacilityIds));
      }

      conditions.push(or(...searchConditions)!);
    }

    // Query facilities
    const venuesList = await db
      .select()
      .from(facilities)
      .where(and(...conditions));

    if (venuesList.length === 0) {
      return res.json({ success: true, count: 0, venues: [] });
    }

    // For each facility, fetch its sports and active courts to calculate starting price and enrich
    const enrichedVenues = await Promise.all(
      venuesList.map(async (facility) => {
        // Fetch sports
        const sports = await db
          .select({ sport: facilitySports.sport })
          .from(facilitySports)
          .where(eq(facilitySports.facilityId, facility.id));

        // Fetch active courts
        const activeCourts = await db
          .select()
          .from(courts)
          .where(and(eq(courts.facilityId, facility.id), eq(courts.status, 'ACTIVE')));

        const prices = activeCourts.map((c) => parseFloat(c.pricePerHour));
        const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;

        return {
          ...facility,
          sports: sports.map((s) => s.sport),
          startingPrice,
          activeCourtsCount: activeCourts.length,
        };
      })
    );

    // Apply starting price filters
    let filteredEnriched = enrichedVenues;
    if (minPrice) {
      const minP = parseFloat(minPrice as string);
      filteredEnriched = filteredEnriched.filter((v) => v.startingPrice >= minP);
    }
    if (maxPrice) {
      const maxP = parseFloat(maxPrice as string);
      filteredEnriched = filteredEnriched.filter((v) => v.startingPrice <= maxP);
    }

    return res.json({
      success: true,
      count: filteredEnriched.length,
      venues: filteredEnriched,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to fetch venues' });
  }
};

// GET /api/venues/:id - Public detailed view of approved venue (PRD 5.3)
export const getVenueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [facility] = await db
      .select()
      .from(facilities)
      .where(and(eq(facilities.id, id), eq(facilities.status, 'APPROVED')))
      .limit(1);

    if (!facility) {
      return res.status(404).json({ success: false, message: 'Venue not found or not approved' });
    }

    // Fetch sports
    const sports = await db
      .select({ sport: facilitySports.sport })
      .from(facilitySports)
      .where(eq(facilitySports.facilityId, facility.id));

    // Fetch active courts
    const activeCourts = await db
      .select()
      .from(courts)
      .where(and(eq(courts.facilityId, id), eq(courts.status, 'ACTIVE')));

    const prices = activeCourts.map((c) => parseFloat(c.pricePerHour));
    const startingPrice = prices.length > 0 ? Math.min(...prices) : 0;

    return res.json({
      success: true,
      venue: {
        ...facility,
        sports: sports.map((s) => s.sport),
        startingPrice,
        courts: activeCourts,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Venue details failed' });
  }
};
