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
      if (data && typeof data.totalUsers === 'number') {
        return data as AdminDashboard;
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 120));

    return {
      totalUsers: 1250,
      totalOwners: 203,
      totalBookings: 3245,
      activeCourts: 645,
      bookingTrend: [
        { date: 'Mon', bookings: 120, revenue: 60000 },
        { date: 'Tue', bookings: 180, revenue: 90000 },
        { date: 'Wed', bookings: 150, revenue: 75000 },
        { date: 'Thu', bookings: 220, revenue: 110000 },
        { date: 'Fri', bookings: 350, revenue: 175000 },
        { date: 'Sat', bookings: 540, revenue: 270000 },
        { date: 'Sun', bookings: 480, revenue: 240000 },
      ],
      userTrend: [],
      sportBreakdown: [],
      pendingFacilities: 3,
    };
  },

  /**
   * Get Admin Visual Analytics Data
   */
  async getAnalytics(timeRange = '30days'): Promise<AdminAnalyticsData> {
    try {
      const res = await api.get<any>('/admin/analytics', { params: { range: timeRange } });
      const raw = res.data;
      const data = raw?.data || raw;
      if (data && Array.isArray(data.bookingTrend)) {
        return data as AdminAnalyticsData;
      }
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 120));

    return {
      timeRange,
      bookingTrend: [
        { date: 'Week 1', bookings: 450, revenue: 225000 },
        { date: 'Week 2', bookings: 620, revenue: 310000 },
        { date: 'Week 3', bookings: 780, revenue: 390000 },
        { date: 'Week 4', bookings: 920, revenue: 460000 },
      ],
      userTrend: [
        { date: 'Week 1', users: 80 },
        { date: 'Week 2', users: 115 },
        { date: 'Week 3', users: 140 },
        { date: 'Week 4', users: 195 },
      ],
      facilityApprovalTrend: [
        { month: 'May', submitted: 15, approved: 12, rejected: 3 },
        { month: 'Jun', submitted: 22, approved: 18, rejected: 4 },
        { month: 'Jul', submitted: 28, approved: 24, rejected: 4 },
        { month: 'Aug', submitted: 35, approved: 30, rejected: 5 },
      ],
      sportBreakdown: [
        { sport: 'BADMINTON', count: 1450, revenue: 725000 },
        { sport: 'TENNIS', count: 820, revenue: 492000 },
        { sport: 'FOOTBALL', count: 540, revenue: 378000 },
        { sport: 'CRICKET', count: 280, revenue: 196000 },
        { sport: 'BASKETBALL', count: 155, revenue: 77500 },
      ],
      revenueSimulation: [
        { month: 'May', revenue: 450000 },
        { month: 'Jun', revenue: 620000 },
        { month: 'Jul', revenue: 780000 },
        { month: 'Aug', revenue: 950000 },
      ],
    };
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
      if (list.length > 0) return list;
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 100));
    return getLocalAdminFacilities(status);
  },

  /**
   * Approve a Facility (makes it publicly visible)
   */
  async approveFacility(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/facilities/${id}/approve`);
    } catch {
      // Fallback
    }
    updateLocalFacilityStatus(id, 'APPROVED');
    return true;
  },

  /**
   * Reject a Facility with compliance reason
   */
  async rejectFacility(id: string, reason: string): Promise<boolean> {
    try {
      await api.patch(`/admin/facilities/${id}/reject`, { reason });
    } catch {
      // Fallback
    }
    updateLocalFacilityStatus(id, 'REJECTED', reason);
    return true;
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
      if (list.length > 0) return list;
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 100));
    return getLocalAdminUsers(params);
  },

  /**
   * Ban User Account
   */
  async banUser(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/users/${id}/ban`);
    } catch {
      // Fallback
    }
    updateLocalUserStatus(id, 'BANNED');
    return true;
  },

  /**
   * Unban / Restore User Account
   */
  async unbanUser(id: string): Promise<boolean> {
    try {
      await api.patch(`/admin/users/${id}/unban`);
    } catch {
      // Fallback
    }
    updateLocalUserStatus(id, 'ACTIVE');
    return true;
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
      if (list.length > 0) return list;
    } catch {
      // Fallback
    }

    await new Promise((r) => setTimeout(r, 120));
    return getLocalPlatformBookings();
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
