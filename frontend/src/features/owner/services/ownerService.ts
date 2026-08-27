import api from '../../../lib/axios';
import type {
  Facility,
  Court,
  TimeSlot,
  CourtBlock,
  Booking,
  OwnerAnalytics,
  SportType,
} from '../../../types';

export interface CreateFacilityPayload {
  name: string;
  location: string;
  address: string;
  description: string;
  sports: SportType[];
  amenities: string[];
  images: string[];
  contactPhone?: string;
  contactEmail?: string;
}

export interface CreateCourtPayload {
  facilityId: string;
  name: string;
  sportType: SportType;
  pricePerHour: number;
  openingTime: string;
  closingTime: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BlockSlotPayload {
  courtId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  reason: string;
}

export const ownerService = {
  /**
   * Get Owner Dashboard Analytics
   */
  async getAnalytics(): Promise<OwnerAnalytics> {
    try {
      const res = await api.get<any>('/owner/analytics');
      const raw = res.data;
      const data = raw?.data || raw;
      if (data) {
        return data as OwnerAnalytics;
      }
      throw new Error('Invalid analytics response format');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch owner analytics');
    }
  },

  /**
   * Get Facilities owned by logged in user
   */
  async getMyFacilities(): Promise<Facility[]> {
    try {
      const res = await api.get<any>('/facilities/my');
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.facilities)
        ? raw.facilities
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      return list;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch your facilities');
    }
  },

  /**
   * Get Single Facility details
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    try {
      const res = await api.get<any>(`/facilities/${id}`);
      const raw = res.data;
      const fac = raw?.facility || raw?.data || raw;
      if (fac && (fac.id || fac._id)) return fac as Facility;
      return null;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || `Failed to fetch facility ${id}`);
    }
  },

  /**
   * Create New Facility
   */
  async createFacility(payload: CreateFacilityPayload): Promise<Facility> {
    try {
      const res = await api.post<any>('/facilities', payload);
      const raw = res.data;
      const fac = raw?.facility || raw?.data || raw;
      if (fac) {
        return fac as Facility;
      }
      throw new Error(raw.message || 'Failed to create facility');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to create facility');
    }
  },

  /**
   * Update Facility
   */
  async updateFacility(
    id: string,
    payload: Partial<CreateFacilityPayload>
  ): Promise<Facility> {
    try {
      const res = await api.patch<any>(`/facilities/${id}`, payload);
      const raw = res.data;
      const fac = raw?.facility || raw?.data || raw;
      if (fac) {
        return fac as Facility;
      }
      throw new Error(raw.message || 'Failed to update facility');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update facility');
    }
  },

  /**
   * Delete Facility
   */
  async deleteFacility(id: string): Promise<boolean> {
    try {
      await api.delete(`/facilities/${id}`);
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete facility');
    }
  },

  /**
   * Get Courts for Facility
   */
  async getCourts(facilityId: string): Promise<Court[]> {
    try {
      const res = await api.get<any>(`/facilities/${facilityId}/courts`);
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.courts)
        ? raw.courts
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      return list;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch courts');
    }
  },

  /**
   * Create Court
   */
  async createCourt(payload: CreateCourtPayload): Promise<Court> {
    try {
      const res = await api.post<any>(`/facilities/${payload.facilityId}/courts`, payload);
      const raw = res.data;
      const court = raw?.court || raw?.data || raw;
      if (court) {
        return court as Court;
      }
      throw new Error(raw.message || 'Failed to create court');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to create court');
    }
  },

  /**
   * Update Court
   */
  async updateCourt(id: string, payload: Partial<Court>): Promise<Court> {
    try {
      const res = await api.patch<any>(`/courts/${id}`, payload);
      const raw = res.data;
      const court = raw?.court || raw?.data || raw;
      if (court) {
        return court as Court;
      }
      throw new Error(raw.message || 'Failed to update court');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update court');
    }
  },

  /**
   * Delete Court
   */
  async deleteCourt(id: string): Promise<boolean> {
    try {
      await api.delete(`/courts/${id}`);
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to delete court');
    }
  },

  /**
   * Get Time Slots state for a court from live API
   */
  async getCourtSlots(courtId: string, date: string): Promise<TimeSlot[]> {
    try {
      const res = await api.get<any>(`/courts/${courtId}/availability`, { params: { date } });
      const raw = res.data;
      const rawArray: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.slots)
        ? raw.slots
        : Array.isArray(raw?.data)
        ? raw.data
        : [];

      return rawArray.map((s: any, idx: number) => ({
        startTime: s.startTime || '00:00',
        endTime: s.endTime || '00:00',
        status: (s.status as any) || 'AVAILABLE',
        blockReason: s.reason || s.blockReason,
        blockId: s.blockId || s.id,
      }));
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch court slots');
    }
  },

  /**
   * Block a Time Slot
   */
  async blockSlot(payload: BlockSlotPayload): Promise<CourtBlock> {
    try {
      const res = await api.post<any>(`/courts/${payload.courtId}/blocks`, payload);
      const raw = res.data;
      const block = raw?.block || raw?.data || raw;
      if (block) {
        return block as CourtBlock;
      }
      throw new Error(raw.message || 'Failed to block slot');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to block slot');
    }
  },

  /**
   * Unblock a Time Slot
   */
  async unblockSlot(blockId: string, _courtId?: string, _date?: string, _startTime?: string): Promise<boolean> {
    try {
      if (blockId) {
        await api.delete(`/court-blocks/${blockId}`);
      }
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to unblock slot');
    }
  },

  /**
   * Get Owner Bookings Table Data
   */
  async getOwnerBookings(): Promise<Booking[]> {
    try {
      const res = await api.get<any>('/owner/bookings');
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.bookings)
        ? raw.bookings
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      return list;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch owner bookings');
    }
  },
};

/* ---------- LocalStorage Helpers ---------- */
const FAC_KEY = 'qc_owner_facilities';
const CRT_KEY = 'qc_owner_courts';
const BLK_KEY = 'qc_owner_blocks';
const BKG_KEY = 'qc_owner_bookings';

function getLocalFacilities(): Facility[] {
  try {
    const raw = localStorage.getItem(FAC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'fac-1',
      ownerId: 'usr-owner-1',
      name: 'Apex Sports Arena',
      description:
        'State of the art indoor sports center with international standard badminton & tennis courts.',
      address: 'Plot 42, Sector 18, Cyber City, Gurgaon',
      location: 'Gurgaon, Delhi NCR',
      status: 'APPROVED',
      sports: ['BADMINTON', 'TENNIS', 'SQUASH'],
      amenities: ['Parking', 'Changing Rooms', 'Showers', 'Cafeteria', 'WiFi'],
      images: [
        'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=800&q=80',
      ],
      startingPrice: 450,
      rating: 4.8,
      reviewCount: 34,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'fac-2',
      ownerId: 'usr-owner-1',
      name: 'GreenTurf Football & Cricket Hub',
      description: 'FIFA quality synthetic turf for 7v7 football and box cricket leagues.',
      address: 'Outer Ring Road, Marathahalli, Bangalore',
      location: 'Bangalore',
      status: 'PENDING',
      sports: ['FOOTBALL', 'CRICKET'],
      amenities: ['Floodlights', 'Parking', 'First Aid', 'Equipment Rental'],
      images: [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
      ],
      startingPrice: 1200,
      rating: 4.5,
      reviewCount: 12,
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-01T10:00:00Z',
    },
  ];
}

function saveLocalFacility(fac: Facility) {
  try {
    const list = getLocalFacilities();
    const updated = [fac, ...list.filter((f) => f.id !== fac.id)];
    localStorage.setItem(FAC_KEY, JSON.stringify(updated));
  } catch {}
}

function deleteLocalFacility(id: string) {
  try {
    const list = getLocalFacilities().filter((f) => f.id !== id);
    localStorage.setItem(FAC_KEY, JSON.stringify(list));
  } catch {}
}

function getLocalCourts(facilityId?: string): Court[] {
  try {
    const raw = localStorage.getItem(CRT_KEY);
    if (raw) {
      const all: Court[] = JSON.parse(raw);
      if (facilityId) return all.filter((c) => c.facilityId === facilityId);
      return all;
    }
  } catch {}

  const defaults: Court[] = [
    {
      id: 'crt-1',
      facilityId: 'fac-1',
      name: 'Court 1 (BWF Synthetic)',
      sportType: 'BADMINTON',
      pricePerHour: 450,
      openingTime: '06:00',
      closingTime: '23:00',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'crt-2',
      facilityId: 'fac-1',
      name: 'Court 2 (Wooden Flooring)',
      sportType: 'BADMINTON',
      pricePerHour: 500,
      openingTime: '06:00',
      closingTime: '23:00',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'crt-3',
      facilityId: 'fac-1',
      name: 'Tennis Court A (Hard Court)',
      sportType: 'TENNIS',
      pricePerHour: 800,
      openingTime: '06:00',
      closingTime: '22:00',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'crt-4',
      facilityId: 'fac-2',
      name: 'Turf Pitch 1 (7v7 Football)',
      sportType: 'FOOTBALL',
      pricePerHour: 1500,
      openingTime: '06:00',
      closingTime: '24:00',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  if (facilityId) return defaults.filter((c) => c.facilityId === facilityId);
  return defaults;
}

function saveLocalCourt(court: Court) {
  try {
    const list = getLocalCourts();
    const updated = [court, ...list.filter((c) => c.id !== court.id)];
    localStorage.setItem(CRT_KEY, JSON.stringify(updated));
  } catch {}
}

function deleteLocalCourt(id: string) {
  try {
    const list = getLocalCourts().filter((c) => c.id !== id);
    localStorage.setItem(CRT_KEY, JSON.stringify(list));
  } catch {}
}

function getLocalBlocks(): CourtBlock[] {
  try {
    const raw = localStorage.getItem(BLK_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'blk-1',
      courtId: 'crt-1',
      date: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      reason: 'Scheduled Mat Cleaning & Maintenance',
      createdAt: new Date().toISOString(),
    },
  ];
}

function saveLocalBlock(block: CourtBlock) {
  try {
    const list = getLocalBlocks();
    localStorage.setItem(BLK_KEY, JSON.stringify([block, ...list]));
  } catch {}
}

function deleteLocalBlock(courtId?: string, date?: string, startTime?: string, blockId?: string) {
  try {
    const list = getLocalBlocks().filter((b) => {
      if (blockId && b.id === blockId) return false;
      if (courtId && date && startTime && b.courtId === courtId && b.date === date && b.startTime === startTime) return false;
      return true;
    });
    localStorage.setItem(BLK_KEY, JSON.stringify(list));
  } catch {}
}

function getLocalOwnerBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BKG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    {
      id: 'bkg-101',
      userId: 'usr-cust-1',
      userName: 'Rahul Sharma',
      facilityId: 'fac-1',
      facilityName: 'Apex Sports Arena',
      courtId: 'crt-1',
      courtName: 'Court 1 (BWF Synthetic)',
      sportType: 'BADMINTON',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '19:00',
      amount: 450,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bkg-102',
      userId: 'usr-cust-2',
      userName: 'Priya Verma',
      facilityId: 'fac-1',
      facilityName: 'Apex Sports Arena',
      courtId: 'crt-3',
      courtName: 'Tennis Court A (Hard Court)',
      sportType: 'TENNIS',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '19:00',
      endTime: '20:00',
      amount: 800,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bkg-103',
      userId: 'usr-cust-3',
      userName: 'Amit Kumar',
      facilityId: 'fac-2',
      facilityName: 'GreenTurf Football & Cricket Hub',
      courtId: 'crt-4',
      courtName: 'Turf Pitch 1 (7v7 Football)',
      sportType: 'FOOTBALL',
      bookingDate: '2026-08-28',
      startTime: '20:00',
      endTime: '21:00',
      amount: 1500,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bkg-104',
      userId: 'usr-cust-4',
      userName: 'Vikram Singh',
      facilityId: 'fac-1',
      facilityName: 'Apex Sports Arena',
      courtId: 'crt-2',
      courtName: 'Court 2 (Wooden Flooring)',
      sportType: 'BADMINTON',
      bookingDate: '2026-08-25',
      startTime: '10:00',
      endTime: '11:00',
      amount: 500,
      paymentStatus: 'PAID',
      bookingStatus: 'COMPLETED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
