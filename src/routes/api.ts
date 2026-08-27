import { Router } from 'express';
import { register, verifyOtp, resendOtp, login, getCurrentUser } from '../controllers/authController';
import {
  createFacility,
  getMyFacilities,
  getFacilityById,
  updateFacility,
} from '../controllers/ownerFacilityController';
import {
  getCourtsByFacility,
  createCourt,
  updateCourt,
  deleteCourt,
} from '../controllers/ownerCourtController';
import {
  getCourtAvailability,
  createCourtBlock,
  deleteCourtBlock,
} from '../controllers/ownerBlockController';
import { getOwnerBookings, getOwnerAnalytics } from '../controllers/ownerBookingController';

// User / Customer Controllers
import { getVenues, getVenueById } from '../controllers/userVenueController';
import { getSmartPicks } from '../controllers/smartPickController';
import {
  createBooking,
  processPayment,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/userBookingController';
import { getUserProfile, updateUserProfile } from '../controllers/userProfileController';

// Admin Controllers
import {
  getAdminDashboard,
  getPendingFacilities,
  approveFacility,
  rejectFacility,
  getAdminUsers,
  banUser,
  unbanUser,
} from '../controllers/adminController';

import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// ==================== AUTH & OTP ROUTES ====================
router.post('/auth/register', register); // 1. Register & generate OTP
router.post('/auth/verify-otp', verifyOtp); // 2. Verify 6-digit OTP & return JWT
router.post('/auth/resend-otp', resendOtp); // 3. Resend fresh 6-digit OTP
router.post('/auth/login', login);
router.get('/users/me', authenticateToken, getCurrentUser);

// ==================== USER / CUSTOMER PUBLIC DISCOVERY ROUTES ====================
router.get('/venues', getVenues); // Search, filter by sport, city, price (PRD 5.2)
router.get('/venues/:id', getVenueById); // Approved venue detail (PRD 5.3)
router.get('/smart-picks', getSmartPicks); // Rule-based slot recommendation engine (PRD 9)

// ==================== USER BOOKING & PAYMENT ROUTES ====================
router.post('/bookings', authenticateToken, createBooking); // Create booking with double-booking prevention (PRD 6, 8)
router.post('/payments', authenticateToken, processPayment); // Simulated payment processing (PRD 10)
router.get('/bookings', authenticateToken, getMyBookings); // View user's own bookings (PRD 11)
router.get('/bookings/:id', authenticateToken, getBookingById); // Booking details
router.patch('/bookings/:id/cancel', authenticateToken, cancelBooking); // Cancel booking (PRD 11)

// ==================== USER PROFILE ROUTES ====================
router.get('/users/profile', authenticateToken, getUserProfile); // View profile (PRD 12)
router.patch('/users/profile', authenticateToken, updateUserProfile); // Edit profile (PRD 12)

// ==================== FACILITY OWNER MANAGEMENT ROUTES ====================
router.post('/facilities', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), createFacility);
router.get('/facilities/my', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), getMyFacilities);
router.get('/facilities/:id', authenticateToken, getFacilityById);
router.patch('/facilities/:id', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), updateFacility);

// ==================== COURT MANAGEMENT ROUTES ====================
router.get('/facilities/:facilityId/courts', authenticateToken, getCourtsByFacility);
router.post('/facilities/:facilityId/courts', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), createCourt);
router.patch('/courts/:courtId', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), updateCourt);
router.delete('/courts/:courtId', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), deleteCourt);

// ==================== AVAILABILITY & BLOCKING ROUTES ====================
router.get('/courts/:courtId/availability', getCourtAvailability);
router.post('/courts/:courtId/blocks', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), createCourtBlock);
router.delete('/court-blocks/:blockId', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), deleteCourtBlock);

// ==================== OWNER BOOKING & ANALYTICS ROUTES ====================
router.get('/owner/bookings', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), getOwnerBookings);
router.get('/owner/analytics', authenticateToken, requireRole('FACILITY_OWNER', 'ADMIN'), getOwnerAnalytics);

// ==================== ADMIN ROUTES ====================
router.get('/admin/dashboard', authenticateToken, requireRole('ADMIN'), getAdminDashboard); // Platform KPIs (PRD 19)
router.get('/admin/facilities/pending', authenticateToken, requireRole('ADMIN'), getPendingFacilities); // Pending facility review (PRD 20)
router.patch('/admin/facilities/:id/approve', authenticateToken, requireRole('ADMIN'), approveFacility); // Approve facility (PRD 20)
router.patch('/admin/facilities/:id/reject', authenticateToken, requireRole('ADMIN'), rejectFacility); // Reject facility (PRD 20)
router.get('/admin/users', authenticateToken, requireRole('ADMIN'), getAdminUsers); // User list with search/filters (PRD 21)
router.patch('/admin/users/:id/ban', authenticateToken, requireRole('ADMIN'), banUser); // Ban user (PRD 21)
router.patch('/admin/users/:id/unban', authenticateToken, requireRole('ADMIN'), unbanUser); // Unban user (PRD 21)

export default router;
