import api from '../../../lib/axios';
import type {
  AdminDashboard,
  Facility,
  User,
  Booking,
  BookingTrendPoint,
  SportBreakdown,
  UserStatus,
} from '../../../types';

export interface AdminAnalyticsData {
  timeRange: string;
  bookingTrend: BookingTrendPoint[];
  userTrend: { date: string; users: number }[];
  facilityApprovalTrend: { month: string; submitted: number; approved: number; rejected: number }[];
  sportBreakdown: SportBreakdown[];
  revenueSimulation: { month: string; revenue: number }[];
}

export const adminService = {
  /**
   * Get Admin Dashboard Overview KPIs and Quick Access feeds
   */
  async getDashboard(): Promise<AdminDashboard> {
    try {
      const res = await api.get<any>('/admin/dashboard');
      const raw = res.data;
      const data = raw?.data || raw;
      if (data) {
        return data as AdminDashboard;
      }
      throw new Error('Invalid dashboard response format');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch admin dashboard');
    }
  },

  /**
   * Get Admin Visual Analytics Data
   */
  async getAnalytics(timeRange = '30days'): Promise<AdminAnalyticsData> {
    try {
      const res = await api.get<any>('/admin/analytics', { params: { range: timeRange } });
      const raw = res.data;
      const data = raw?.data || raw;
      if (data) {
        return data as AdminAnalyticsData;
      }
      throw new Error('Invalid analytics response format');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch admin analytics');
    }
  },

  /**
   * Get Facilities for Admin Review by status
   */
  async getFacilities(status?: 'PENDING' | 'APPROVED' | 'REJECTED'): Promise<Facility[]> {
    try {
      const endpoint = status === 'PENDING' ? '/admin/facilities/pending' : '/admin/facilities';
      const res = await api.get<any>(endpoint, { params: { status } });
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
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch admin facilities');
    }
  },

  /**
   * Approve a Facility
   */
  async approveFacility(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/facilities/${id}/approve`);
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to approve facility');
    }
  },

  /**
   * Reject a Facility
   */
  async rejectFacility(id: string, reason: string): Promise<boolean> {
    try {
      await api.patch(`/admin/facilities/${id}/reject`, { reason });
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to reject facility');
    }
  },

  /**
   * Get Platform Users with search query & role/status filters
   */
  async getUsers(params: { search?: string; role?: string; status?: string } = {}): Promise<User[]> {
    try {
      const res = await api.get<any>('/admin/users', { params });
      const raw = res.data;
      const list = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.users)
        ? raw.users
        : Array.isArray(raw?.data)
        ? raw.data
        : [];
      return list;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch admin users');
    }
  },

  /**
   * Ban User Account
   */
  async banUser(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/users/${id}/ban`);
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to ban user');
    }
  },

  /**
   * Unban / Restore User Account
   */
  async unbanUser(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/users/${id}/unban`);
      return true;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to unban user');
    }
  },

  /**
   * Get Platform-wide Bookings Audit List
   */
  async getPlatformBookings(): Promise<Booking[]> {
    try {
      const res = await api.get<any>('/admin/bookings');
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
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch platform bookings');
    }
  },
};

/* ---------- LocalStorage & Mock Data ---------- */
const ADMIN_FAC_KEY = 'qc_admin_facilities';
const ADMIN_USR_KEY = 'qc_admin_users';

function getLocalAdminFacilities(statusFilter?: string): Facility[] {
  try {
    const raw = localStorage.getItem(ADMIN_FAC_KEY);
    if (raw) {
      const list: Facility[] = JSON.parse(raw);
      if (statusFilter) return list.filter((f) => f.status === statusFilter);
      return list;
    }
  } catch {}

  const defaults: Facility[] = [
    {
      id: 'fac-101',
      ownerId: 'usr-owner-1',
      ownerName: 'Apex Sports Pvt Ltd',
      name: 'Cyber Sports Arena',
      description: '6 International grade indoor badminton courts with BWF approved synthetic mats and LED floodlights.',
      address: 'Phase 2, DLF Cyber City, Gurgaon',
      location: 'Gurgaon, Delhi NCR',
      status: 'PENDING',
      sports: ['BADMINTON', 'SQUASH'],
      amenities: ['Parking', 'Changing Rooms', 'Showers', 'WiFi', 'First Aid'],
      images: [
        'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=800&q=80',
      ],
      startingPrice: 500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fac-102',
      ownerId: 'usr-owner-2',
      ownerName: 'GreenTurf Sports Arena',
      name: 'Whitefield Football Turf & Box Cricket',
      description: 'FIFA 2-star certified synthetic turf for 7v7 football tournaments and floodlit box cricket matches.',
      address: 'ITPL Main Road, Whitefield, Bengaluru',
      location: 'Bengaluru',
      status: 'PENDING',
      sports: ['FOOTBALL', 'CRICKET'],
      amenities: ['Floodlights', 'Parking', 'Equipment Rental', 'Cafeteria'],
      images: [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=800&q=80',
      ],
      startingPrice: 1200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'fac-103',
      ownerId: 'usr-owner-3',
      ownerName: 'Metro Smash Club',
      name: 'SmashZone Tennis & Pickleball Park',
      description: '4 clay tennis courts and 2 pickleball courts with professional coaching facilities.',
      address: 'Sector 62, Noida, Uttar Pradesh',
      location: 'Noida',
      status: 'APPROVED',
      sports: ['TENNIS'],
      amenities: ['Parking', 'Showers', 'Cafeteria'],
      images: [
        'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80',
      ],
      startingPrice: 800,
      createdAt: '2026-01-15T00:00:00.000Z',
      updatedAt: '2026-01-15T00:00:00.000Z',
    },
  ];

  if (statusFilter) return defaults.filter((f) => f.status === statusFilter);
  return defaults;
}

function updateLocalFacilityStatus(id: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
  try {
    const list = getLocalAdminFacilities();
    const updated = list.map((f) =>
      f.id === id ? { ...f, status, rejectionReason: reason, updatedAt: new Date().toISOString() } : f
    );
    localStorage.setItem(ADMIN_FAC_KEY, JSON.stringify(updated));
  } catch {}
}

function getLocalAdminUsers(params: { search?: string; role?: string; status?: string } = {}): User[] {
  try {
    const raw = localStorage.getItem(ADMIN_USR_KEY);
    let list: User[] = raw ? JSON.parse(raw) : getMockUsers();

    if (params.search?.trim()) {
      const q = params.search.toLowerCase().trim();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (params.role && params.role !== 'ALL') {
      list = list.filter((u) => u.role === params.role);
    }
    if (params.status && params.status !== 'ALL') {
      list = list.filter((u) => u.status === params.status);
    }
    return list;
  } catch {
    return getMockUsers();
  }
}

function getMockUsers(): User[] {
  return [
    {
      id: 'usr-1',
      name: 'John Player',
      email: 'player@quickcourt.com',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'usr-2',
      name: 'Arena Owner',
      email: 'owner@quickcourt.com',
      role: 'FACILITY_OWNER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'usr-3',
      name: 'System Administrator',
      email: 'admin@quickcourt.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
    },
    {
      id: 'usr-4',
      name: 'Suspended Account',
      email: 'spammer@quickcourt.com',
      role: 'USER',
      status: 'BANNED',
      emailVerified: false,
      createdAt: '2026-02-01T10:00:00Z',
      updatedAt: '2026-02-01T10:00:00Z',
    },
  ];
}

function updateLocalUserStatus(id: string, status: UserStatus) {
  try {
    const list = getLocalAdminUsers();
    const updated = list.map((u) => (u.id === id ? { ...u, status } : u));
    localStorage.setItem(ADMIN_USR_KEY, JSON.stringify(updated));
  } catch {}
}

function getLocalPlatformBookings(): Booking[] {
  return [
    {
      id: 'bkg-admin-01',
      userId: 'usr-1',
      userName: 'John Player',
      facilityId: 'fac-103',
      facilityName: 'SmashZone Tennis & Pickleball Park',
      courtId: 'crt-tennis-1',
      courtName: 'Court A (Hard Court)',
      sportType: 'TENNIS',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '18:00',
      endTime: '19:00',
      amount: 800,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bkg-admin-02',
      userId: 'usr-5',
      userName: 'Anita Desai',
      facilityId: 'fac-101',
      facilityName: 'Cyber Sports Arena',
      courtId: 'crt-badminton-1',
      courtName: 'Court 1 (Synthetic Mat)',
      sportType: 'BADMINTON',
      bookingDate: new Date().toISOString().split('T')[0],
      startTime: '19:00',
      endTime: '20:00',
      amount: 500,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'bkg-admin-03',
      userId: 'usr-6',
      userName: 'Suresh Raina',
      facilityId: 'fac-102',
      facilityName: 'Whitefield Football Turf & Box Cricket',
      courtId: 'crt-turf-1',
      courtName: 'Turf Pitch 1 (7v7)',
      sportType: 'FOOTBALL',
      bookingDate: '2026-08-28',
      startTime: '20:00',
      endTime: '21:00',
      amount: 1200,
      paymentStatus: 'PAID',
      bookingStatus: 'CONFIRMED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
