export type Role = 'USER' | 'FACILITY_OWNER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BANNED' | 'SUSPENDED';
export type FacilityStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CourtStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type BookingStatus = 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  isVerified: boolean;
  emailVerified?: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OtpVerification {
  id: string;
  email: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

export interface Facility {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  sports: string[];
  amenities: string[];
  images: string[];
  status: FacilityStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Court {
  id: string;
  facilityId: string;
  name: string;
  sport: string;
  pricePerHour: number;
  openingTime: string; // e.g. "06:00"
  closingTime: string; // e.g. "22:00"
  status: CourtStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CourtBlock {
  id: string;
  courtId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  reason: string;
  createdById: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  reference: string;
  userId: string;
  facilityId: string;
  courtId: string;
  sport: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  amount: number;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionRef: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  facilityId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

// Authenticated Express Request helper
export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: Role;
}
