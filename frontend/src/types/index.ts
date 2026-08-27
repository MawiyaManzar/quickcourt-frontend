// Shared TypeScript types for the entire QuickCourt frontend

/* ---- Enums ---- */
export type UserRole    = 'USER' | 'FACILITY_OWNER' | 'ADMIN';
export type UserStatus  = 'ACTIVE' | 'BANNED';
export type AuthUser    = User;

export type FacilityStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CourtStatus    = 'ACTIVE'  | 'INACTIVE';

export type BookingStatus  = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus  = 'PENDING'   | 'PAID'      | 'REFUNDED';

export type SportType =
  | 'BADMINTON'
  | 'TENNIS'
  | 'FOOTBALL'
  | 'CRICKET'
  | 'BASKETBALL'
  | 'TABLE_TENNIS'
  | 'SWIMMING'
  | 'SQUASH'
  | string;         // extensible

/* ---- User ---- */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ---- Facility ---- */
export interface Facility {
  id: string;
  ownerId: string;
  ownerName?: string;
  name: string;
  description: string;
  address: string;
  location: string;        // city / area string
  status: FacilityStatus;
  sports: SportType[];
  amenities: string[];
  images: string[];
  rejectionReason?: string;
  rating?: number;
  reviewCount?: number;
  startingPrice?: number;  // computed: lowest court price
  createdAt: string;
  updatedAt: string;
}

/* ---- Court ---- */
export interface Court {
  id: string;
  facilityId: string;
  name: string;
  sportType: SportType;
  pricePerHour: number;
  openingTime: string;     // "HH:MM"
  closingTime: string;     // "HH:MM"
  status: CourtStatus;
  createdAt: string;
  updatedAt: string;
}

/* ---- Slot Availability ---- */
export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'BLOCKED' | 'CLOSED';

export interface TimeSlot {
  startTime: string;       // "HH:MM"
  endTime: string;         // "HH:MM"
  status: SlotStatus;
  blockReason?: string;
}

/* ---- Court Block ---- */
export interface CourtBlock {
  id: string;
  courtId: string;
  date: string;            // "YYYY-MM-DD"
  startTime: string;
  endTime: string;
  reason: string;
  createdAt: string;
}

/* ---- Booking ---- */
export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  facilityId: string;
  facilityName?: string;
  facilityImage?: string;
  courtId: string;
  courtName?: string;
  sportType: SportType;
  bookingDate: string;     // "YYYY-MM-DD"
  startTime: string;       // "HH:MM"
  endTime: string;         // "HH:MM"
  amount: number;
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

/* ---- Review ---- */
export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  facilityId: string;
  bookingId: string;
  rating: number;           // 1–5
  comment: string;
  createdAt: string;
}

/* ---- API Response Wrapper ---- */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message: string;
}

/* ---- Analytics ---- */
export interface BookingTrendPoint {
  date: string;
  bookings: number;
  revenue: number;
}

export interface SportBreakdown {
  sport: SportType;
  count: number;
  revenue: number;
}

export interface HeatmapCell {
  hour: string;      // "06:00"
  day: string;       // "Mon"
  value: number;     // booking count
}

export interface OwnerAnalytics {
  totalBookings: number;
  activeCourts: number;
  monthlyEarnings: number;
  upcomingBookings: number;
  bookingTrend: BookingTrendPoint[];
  peakHours: HeatmapCell[];
  sportBreakdown: SportBreakdown[];
}

export interface AdminDashboard {
  totalUsers: number;
  totalOwners: number;
  totalBookings: number;
  activeCourts: number;
  bookingTrend: BookingTrendPoint[];
  userTrend: BookingTrendPoint[];
  sportBreakdown: SportBreakdown[];
  pendingFacilities: number;
}
