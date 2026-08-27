import { describe, it, expect } from 'vitest';
import { venueService } from '../features/venues/services/venueService';

describe('venueService', () => {
  it('fetches all venues with default pagination', async () => {
    const res = await venueService.fetchVenues();
    expect(res.venues.length).toBeGreaterThan(0);
    expect(res.total).toBeGreaterThan(0);
    expect(res.page).toBe(1);
  });

  it('filters venues by search query', async () => {
    const res = await venueService.fetchVenues({ q: 'Badminton' });
    expect(res.venues.length).toBeGreaterThan(0);
    expect(res.venues.every((v) =>
      v.name.toLowerCase().includes('badminton') ||
      v.tagline?.toLowerCase().includes('badminton') ||
      v.description.toLowerCase().includes('badminton') ||
      v.sports.includes('Badminton')
    )).toBe(true);
  });

  it('filters venues by city', async () => {
    const res = await venueService.fetchVenues({ city: 'Mumbai' });
    expect(res.venues.every((v) => v.city === 'Mumbai')).toBe(true);
  });

  it('fetches single venue by ID', async () => {
    const venue = await venueService.fetchVenueById('v-1');
    expect(venue).not.toBeNull();
    expect(venue?.id).toBe('v-1');
    expect(venue?.name).toBe('Apex Sports Arena');
  });

  it('returns null for non-existent venue ID', async () => {
    const venue = await venueService.fetchVenueById('v-99999');
    expect(venue).toBeNull();
  });
});
