import { MOCK_VENUES } from '../data/mockVenues';
import type { Venue, VenueFilterParams, VenueListResponse } from '../types';

export const venueService = {
  /**
   * Fetch venues with search filters, location filtering, and pagination
   */
  async fetchVenues(params: VenueFilterParams = {}): Promise<VenueListResponse> {
    // Artificial latency for loading skeleton demonstration (200ms)
    await new Promise((res) => setTimeout(res, 200));

    let filtered = [...MOCK_VENUES];

    // Filter by city
    if (params.city && params.city !== 'All Cities') {
      filtered = filtered.filter(
        (v) => v.city.toLowerCase() === params.city?.toLowerCase()
      );
    }

    // Search query matching title, tagline, description, area, or city
    if (params.q && params.q.trim()) {
      const query = params.q.toLowerCase().trim();
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          v.tagline.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.area.toLowerCase().includes(query) ||
          v.city.toLowerCase().includes(query) ||
          v.sports.some((s) => s.toLowerCase().includes(query))
      );
    }

    // Filter by sports
    if (params.sports && params.sports.length > 0) {
      filtered = filtered.filter((v) =>
        params.sports?.some((s) => v.sports.includes(s))
      );
    }

    // Filter by venue type (INDOOR / OUTDOOR / BOTH)
    if (params.venueType && params.venueType !== 'ALL') {
      filtered = filtered.filter(
        (v) => v.venueType === params.venueType || v.venueType === 'BOTH'
      );
    }

    // Filter by price range
    if (params.minPrice !== undefined) {
      filtered = filtered.filter((v) => v.startingPrice >= (params.minPrice ?? 0));
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter((v) => v.startingPrice <= (params.maxPrice ?? Infinity));
    }

    // Filter by minimum rating
    if (params.minRating !== undefined && params.minRating > 0) {
      filtered = filtered.filter((v) => v.rating >= (params.minRating ?? 0));
    }

    const total = filtered.length;
    const page = params.page || 1;
    const limit = params.limit || 6;
    const totalPages = Math.ceil(total / limit) || 1;

    // Pagination slice
    const startIndex = (page - 1) * limit;
    const paginatedVenues = filtered.slice(startIndex, startIndex + limit);

    return {
      venues: paginatedVenues,
      total,
      page,
      limit,
      totalPages,
    };
  },

  /**
   * Fetch featured venues for Home Page
   */
  async fetchFeaturedVenues(): Promise<Venue[]> {
    await new Promise((res) => setTimeout(res, 150));
    return MOCK_VENUES.filter((v) => v.isFeatured);
  },

  /**
   * Fetch a single venue by ID
   */
  async fetchVenueById(id: string): Promise<Venue | null> {
    await new Promise((res) => setTimeout(res, 200));
    const venue = MOCK_VENUES.find((v) => v.id === id);
    return venue || null;
  }
};
