import api from '../../../lib/axios';
import { MOCK_VENUES } from '../data/mockVenues';
import type { Venue, VenueFilterParams, VenueListResponse } from '../types';

export const venueService = {
  /**
   * Fetch venues with search filters, location filtering, and pagination.
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

      const venueArray: Venue[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.venues)
        ? raw.venues
        : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.data?.venues)
        ? raw.data.venues
        : [];

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
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch venues from server');
    }
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
      return venueArray.slice(0, 6);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch featured venues from server');
    }
  },

  /**
   * Fetch a single venue by ID
   */
  async fetchVenueById(id: string): Promise<Venue | null> {
    try {
      const res = await api.get<any>(`/venues/${id}`);
      const raw = res.data;
      const venue = raw?.venue || raw?.data || raw;
      if (venue && (venue.id || venue._id)) {
        return venue as Venue;
      }
      return null;
    } catch (err: any) {
      if (err.response?.status === 404 || err.response?.status === 400) {
        return null;
      }
      throw new Error(err.response?.data?.message || err.message || `Failed to fetch venue details for ID ${id}`);
    }
  }
};

