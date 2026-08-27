import { User, Facility, Court, CourtBlock, Booking, OtpVerification } from '../types';

export const mockOtps: OtpVerification[] = [];

export const mockUsers: User[] = [
  {
    id: 'usr-owner-1',
    name: 'Alex Owner',
    email: 'owner@quickcourt.com',
    passwordHash: '$2a$10$w4rN3Z2lPz.3B5N4W7O6e.fF2/Q5H8k0l2V9X1A2B3C4D5E6F7G8H', // hashed 'password123'
    role: 'FACILITY_OWNER',
    status: 'ACTIVE',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-customer-1',
    name: 'John Player',
    email: 'player@quickcourt.com',
    passwordHash: '$2a$10$w4rN3Z2lPz.3B5N4W7O6e.fF2/Q5H8k0l2V9X1A2B3C4D5E6F7G8H',
    role: 'USER',
    status: 'ACTIVE',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr-admin-1',
    name: 'Admin Chief',
    email: 'admin@quickcourt.com',
    passwordHash: '$2a$10$w4rN3Z2lPz.3B5N4W7O6e.fF2/Q5H8k0l2V9X1A2B3C4D5E6F7G8H',
    role: 'ADMIN',
    status: 'ACTIVE',
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockFacilities: Facility[] = [
  {
    id: 'fac-1',
    ownerId: 'usr-owner-1',
    name: 'Smash Sports Arena',
    description: 'Premier indoor badminton and tennis hub with wooden floors and pro lighting.',
    address: '123 Stadium Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560038',
    phone: '+91 9876543210',
    sports: ['Badminton', 'Tennis', 'Squash'],
    amenities: ['Parking', 'Changing Room', 'Shower', 'Drinking Water', 'Equipment Rental'],
    images: ['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea'],
    status: 'APPROVED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fac-2',
    ownerId: 'usr-owner-1',
    name: 'Urban Turf & Courts',
    description: 'State of the art 7v7 football turf and synthetic basketball court.',
    address: '45 Green Park Avenue',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    phone: '+91 9876543211',
    sports: ['Football', 'Basketball'],
    amenities: ['Floodlights', 'Parking', 'Cafeteria'],
    images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018'],
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockCourts: Court[] = [
  {
    id: 'crt-1',
    facilityId: 'fac-1',
    name: 'Badminton Court 1 (Wood)',
    sport: 'Badminton',
    pricePerHour: 500,
    openingTime: '06:00',
    closingTime: '22:00',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'crt-2',
    facilityId: 'fac-1',
    name: 'Badminton Court 2 (Synthetic)',
    sport: 'Badminton',
    pricePerHour: 450,
    openingTime: '06:00',
    closingTime: '22:00',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'crt-3',
    facilityId: 'fac-1',
    name: 'Tennis Court A',
    sport: 'Tennis',
    pricePerHour: 800,
    openingTime: '07:00',
    closingTime: '21:00',
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const mockBlocks: CourtBlock[] = [
  {
    id: 'blk-1',
    courtId: 'crt-1',
    date: '2026-08-28',
    startTime: '13:00',
    endTime: '15:00',
    reason: 'Routine Wooden Floor Maintenance',
    createdById: 'usr-owner-1',
    createdAt: new Date().toISOString(),
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'bkg-1',
    reference: 'QC-20260827-891',
    userId: 'usr-customer-1',
    facilityId: 'fac-1',
    courtId: 'crt-1',
    sport: 'Badminton',
    date: '2026-08-27',
    startTime: '18:00',
    endTime: '19:00',
    amount: 500,
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'bkg-2',
    reference: 'QC-20260828-412',
    userId: 'usr-customer-1',
    facilityId: 'fac-1',
    courtId: 'crt-2',
    sport: 'Badminton',
    date: '2026-08-28',
    startTime: '19:00',
    endTime: '20:00',
    amount: 450,
    paymentStatus: 'PAID',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];
