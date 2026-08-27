import api from '../../../lib/axios';
import { MOCK_VENUES } from '../data/mockVenues';
import type { Venue, VenueFilterParams, VenueListResponse } from '../types';

export const venueService = {
  /**
   * Fetch venues with search filters, location filtering, and pagination.
   * Tries live API first; falls back to mock data if live endpoint is unreachable.
   */
  async fetchVenues(params: VenueFilterParams = {}): Promise<VenueListResponse> {
    try {
      const apiParams: Record<string, any> = {};
      if (params.q?.trim()) {
        apiParams.search = params.q.trim();
        apiParams.q = params.q.trim();
      }
      if (params.city && params.city !== 'All Cities') {
        apiParams.city = params.city;
      }
      if (params.sports && params.sports.length > 0) {
        apiParams.sport = params.sports.join(',');
      }
      if (params.minPrice !== undefined) apiParams.minPrice = params.minPrice;
      if (params.maxPrice !== undefined) apiParams.maxPrice = params.maxPrice;
      if (params.page) apiParams.page = params.page;
      if (params.limit) apiParams.limit = params.limit;

      const res = await api.get<any>('/venues', { params: apiParams });
      const raw = res.data;

      // Handle flexible API response wrapper
      const venueArray: Venue[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.venues)
        ? raw.venues
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.venues)
        ? raw.data.venues
        : [];

      if (venueArray.length > 0) {
        const total = raw.total || raw.data?.total || venueArray.length;
        const page = params.page || 1;
        const limit = params.limit || 6;
        const totalPages = Math.ceil(total / limit) || 1;

        return {
          venues: venueArray,
          total,
          page,
          limit,
          totalPages,
        };
      }
    } catch (err) {
      console.warn('Live API /venues request error, falling back to mock data.', err);
    }

    await new Promise((res) => setTimeout(res, 150));

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
          v.tagline?.toLowerCase().includes(query) ||
          v.description.toLowerCase().includes(query) ||
          v.area?.toLowerCase().includes(query) ||
          v.address?.toLowerCase().includes(query) ||
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
      filtered = filtered.filter((v) => (v.rating || 0) >= (params.minRating ?? 0));
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
    try {
      const res = await api.get<any>('/venues');
      const raw = res.data;
      const venueArray: Venue[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.venues)
        ? raw.venues
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      if (venueArray.length > 0) {
        return venueArray.slice(0, 6);
      }
    } catch {
      // Fallback to mock featured venues
    }
    await new Promise((res) => setTimeout(res, 100));
    return MOCK_VENUES.filter((v) => v.isFeatured);
  },

  /**
   * Fetch a single venue by ID
   */
  async fetchVenueById(id: string): Promise<Venue | null> {
    try {
      const res = await api.get<any>(`/venues/${id}`);
      const raw = res.data;
      const venue = raw?.venue || raw?.data || raw;
      if (venue && venue.id) {
        return venue as Venue;
      }
    } catch (err) {
      console.warn(`Live API /venues/${id} request error, falling back to mock data.`, err);
    }
    await new Promise((res) => setTimeout(res, 100));
    const venue = MOCK_VENUES.find((v) => v.id === id);
    return venue || null;
  }
};

