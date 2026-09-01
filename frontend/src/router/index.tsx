import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RoleRoute, PublicOnlyRoute } from './guards';

/* ---- Lazy page imports (code splitting per route) ---- */

// Auth
const LoginPage    = lazy(() => import('../features/auth/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/RegisterPage'));

// Public / User
const HomePage      = lazy(() => import('../features/home/HomePage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const ProfilePage   = lazy(() => import('../features/profile/ProfilePage'));

// Admin
const AdminDashboardPage = lazy(() => import('../features/admin/AdminDashboardPage'));
const AdminUsersPage     = lazy(() => import('../features/admin/AdminUsersPage'));
const AdminSettingsPage  = lazy(() => import('../features/admin/AdminSettingsPage'));

// Layouts
const AuthLayout  = lazy(() => import('../components/layout/AuthLayout'));
const UserLayout  = lazy(() => import('../components/layout/UserLayout'));
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));

// Fallback for lazy loading
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#714B67', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
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
          { path: '/auth/login',    element: <Suspense fallback={<PageLoader />}><LoginPage /></Suspense> },
          { path: '/auth/register', element: <Suspense fallback={<PageLoader />}><RegisterPage /></Suspense> },
        ],
      },
    ],
  },

  /* =========== USER ROUTES =========== */
  {
    element: <Suspense fallback={<PageLoader />}><UserLayout /></Suspense>,
    children: [
      /* Public pages */
      { path: '/', element: <Suspense fallback={<PageLoader />}><HomePage /></Suspense> },

      /* Protected user pages */
      {
        element: <RoleRoute allowedRoles={['USER', 'MANAGER']} />,
        children: [
          { path: '/dashboard', element: <Suspense fallback={<PageLoader />}><DashboardPage /></Suspense> },
          { path: '/profile',   element: <Suspense fallback={<PageLoader />}><ProfilePage /></Suspense> },
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
          { path: '/admin',          element: <Suspense fallback={<PageLoader />}><AdminDashboardPage /></Suspense> },
          { path: '/admin/users',    element: <Suspense fallback={<PageLoader />}><AdminUsersPage /></Suspense> },
          { path: '/admin/settings', element: <Suspense fallback={<PageLoader />}><AdminSettingsPage /></Suspense> },
        ],
      },
    ],
  },

  /* =========== 404 =========== */
  {
    path: '*',
    element: (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100vh', gap:16, fontFamily:'Inter, sans-serif' }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#714B67' }}>404</div>
        <div style={{ fontSize: 20, color: '#6b7280' }}>Page not found</div>
        <a href="/" style={{ color: '#714B67', fontWeight: 600 }}>← Back to Home</a>
      </div>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
