import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RoleRoute, PublicOnlyRoute } from './guards';

/* ---- Lazy page imports (code splitting per route) ---- */

// Auth
const LoginPage        = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage     = lazy(() => import('../features/auth/RegisterPage'));
const VerifyOtpPage    = lazy(() => import('../features/auth/VerifyOtpPage'));

// User
const HomePage         = lazy(() => import('../features/venues/HomePage'));
const VenuesPage       = lazy(() => import('../features/venues/VenuesPage'));
const VenueDetailPage  = lazy(() => import('../features/venues/VenueDetailPage'));
const BookingPage      = lazy(() => import('../features/bookings/BookingPage'));
const MyBookingsPage   = lazy(() => import('../features/bookings/MyBookingsPage'));
const ProfilePage      = lazy(() => import('../features/auth/ProfilePage'));

// Owner
const OwnerDashboardPage    = lazy(() => import('../features/owner/OwnerDashboardPage'));
const OwnerFacilitiesPage   = lazy(() => import('../features/owner/OwnerFacilitiesPage'));
const OwnerFacilityFormPage = lazy(() => import('../features/owner/OwnerFacilityFormPage'));
const OwnerCourtsPage       = lazy(() => import('../features/owner/OwnerCourtsPage'));
const OwnerSlotsPage        = lazy(() => import('../features/owner/OwnerSlotsPage'));
const OwnerBookingsPage     = lazy(() => import('../features/owner/OwnerBookingsPage'));

// Admin
const AdminDashboardPage    = lazy(() => import('../features/admin/AdminDashboardPage'));
const AdminFacilitiesPage   = lazy(() => import('../features/admin/AdminFacilitiesPage'));
const AdminUsersPage        = lazy(() => import('../features/admin/AdminUsersPage'));
const AdminAnalyticsPage    = lazy(() => import('../features/admin/AdminAnalyticsPage'));
const AdminBookingsPage     = lazy(() => import('../features/admin/AdminBookingsPage'));

// Layouts
const AuthLayout   = lazy(() => import('../components/layout/AuthLayout'));
const UserLayout   = lazy(() => import('../components/layout/UserLayout'));
const OwnerLayout  = lazy(() => import('../components/layout/OwnerLayout'));
const AdminLayout  = lazy(() => import('../components/layout/AdminLayout'));

// Fallback for lazy loading
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

/* ---- Router Config ---- */
const router = createBrowserRouter([
  /* =========== AUTH (public only) =========== */
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
        children: [
          { path: '/auth/login',      element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
          { path: '/auth/register',   element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
        ],
      },
    ],
  },

  /* OTP verification is accessible regardless of auth state */
  {
    element: <Suspense fallback={<PageLoader />}><AuthLayout /></Suspense>,
    children: [
      { path: '/auth/verify-otp', element: <Suspense fallback={<PageLoader />}><VerifyOtpPage /></Suspense> },
    ],
  },

  /* =========== USER ROUTES =========== */
  {
    element: <Suspense fallback={<PageLoader />}><UserLayout /></Suspense>,
    children: [
      /* Public user pages */
      { path: '/',                        element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },
      { path: '/venues',                  element: <Suspense fallback={<PageLoader />}><VenuesPage /></Suspense> },
      { path: '/venues/:venueId',         element: <Suspense fallback={<PageLoader />}><VenueDetailPage /></Suspense> },

      /* Protected user pages */
      {
        element: <RoleRoute allowedRoles={['USER']} />,
        children: [
          { path: '/venues/:venueId/book', element: <Suspense fallback={<PageLoader />}><BookingPage /></Suspense> },
          { path: '/bookings',             element: <Suspense fallback={<PageLoader />}><MyBookingsPage /></Suspense> },
          { path: '/profile',              element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
        ],
      },
    ],
  },

  /* =========== FACILITY OWNER ROUTES =========== */
  {
    element: <RoleRoute allowedRoles={['FACILITY_OWNER']} />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><OwnerLayout /></Suspense>,
        children: [
          { path: '/owner',                           element: <Suspense fallback={<PageLoader />}><OwnerDashboardPage /></Suspense> },
          { path: '/owner/facilities',                element: <Suspense fallback={<PageLoader />}><OwnerFacilitiesPage /></Suspense> },
          { path: '/owner/facilities/new',            element: <Suspense fallback={<PageLoader />}><OwnerFacilityFormPage /></Suspense> },
          { path: '/owner/facilities/:id/edit',       element: <Suspense fallback={<PageLoader />}><OwnerFacilityFormPage /></Suspense> },
          { path: '/owner/courts',                    element: <Suspense fallback={<PageLoader />}><OwnerCourtsPage /></Suspense> },
          { path: '/owner/slots',                     element: <Suspense fallback={<PageLoader />}><OwnerSlotsPage /></Suspense> },
          { path: '/owner/bookings',                  element: <Suspense fallback={<PageLoader />}><OwnerBookingsPage /></Suspense> },
          { path: '/owner/profile',                   element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
        ],
      },
    ],
  },

  /* =========== ADMIN ROUTES =========== */
  {
    element: <RoleRoute allowedRoles={['ADMIN']} />,
    children: [
      {
        element: <Suspense fallback={<PageLoader />}><AdminLayout /></Suspense>,
        children: [
          { path: '/admin',                 element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> },
          { path: '/admin/facilities',      element: <Suspense fallback={<PageLoader />}><AdminFacilitiesPage /></Suspense> },
          { path: '/admin/users',           element: <Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense> },
          { path: '/admin/analytics',       element: <Suspense fallback={<PageLoader />}><AdminAnalyticsPage /></Suspense> },
          { path: '/admin/bookings',        element: <Suspense fallback={<PageLoader />}><AdminBookingsPage /></Suspense> },
        ],
      },
    ],
  },

  /* =========== 404 =========== */
  {
    path: '*',
    element: (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:16, fontFamily:'Inter, sans-serif' }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#16a34a' }}>404</div>
        <div style={{ fontSize: 20, color: '#64748b' }}>Page not found</div>
        <a href="/" style={{ color: '#16a34a', fontWeight: 600 }}>← Back to Home</a>
      </div>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
