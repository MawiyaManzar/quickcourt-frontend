import { Request, Response } from 'express';
import { mockFacilities, mockCourts } from '../data/mockStore';

// GET /api/venues - Public discovery for approved facilities with search & filter (PRD 5.2)
export const getVenues = (req: Request, res: Response) => {
  const { search, sport, city, minPrice, maxPrice } = req.query;

  // Only facilities with APPROVED status are publicly visible (BR-02)
  let venues = mockFacilities.filter((f) => f.status === 'APPROVED');

  // Search filter (by facility name, city, or sport)
  if (search) {
    const q = (search as string).toLowerCase();
    venues = venues.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.city.toLowerCase().includes(q) ||
        f.sports.some((s) => s.toLowerCase().includes(q))
    );
  }

  // Sport filter
  if (sport) {
    const sportName = (sport as string).toLowerCase();
    venues = venues.filter((f) => f.sports.some((s) => s.toLowerCase() === sportName));
  }

  // City / Location filter
  if (city) {
    const cityName = (city as string).toLowerCase();
    venues = venues.filter((f) => f.city.toLowerCase().includes(cityName));
  }

  // Map starting price for each facility from active courts
  const enrichedVenues = venues.map((facility) => {
    const facilityCourts = mockCourts.filter(
      (c) => c.facilityId === facility.id && c.status === 'ACTIVE'
    );
    const startingPrice = facilityCourts.length > 0
      ? Math.min(...facilityCourts.map((c) => c.pricePerHour))
      : 0;

    return {
      ...facility,
      startingPrice,
      activeCourtsCount: facilityCourts.length,
    };
  });

  // Price filter
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
};

// GET /api/venues/:id - Public detailed view of approved venue (PRD 5.3)
export const getVenueById = (req: Request, res: Response) => {
  const { id } = req.params;
  const facility = mockFacilities.find((f) => f.id === id && f.status === 'APPROVED');

  if (!facility) {
    return res.status(404).json({ success: false, message: 'Venue not found or not approved' });
  }

  const activeCourts = mockCourts.filter((c) => c.facilityId === id && c.status === 'ACTIVE');
  const startingPrice = activeCourts.length > 0 ? Math.min(...activeCourts.map((c) => c.pricePerHour)) : 0;

  return res.json({
    success: true,
    venue: {
      ...facility,
      startingPrice,
      courts: activeCourts,
    },
  });
};
