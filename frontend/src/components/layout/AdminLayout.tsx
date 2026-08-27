import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import styles from './AdminLayout.module.css';

const NAV = [
  { to: '/admin',              label: '📊 Dashboard', exact: true },
  { to: '/admin/facilities',   label: '🏢 Facility Approvals' },
  { to: '/admin/users',        label: '👥 Users' },
  { to: '/admin/bookings',     label: '📋 Bookings' },
  { to: '/admin/analytics',    label: '📈 Analytics' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/auth/login'); };

  return (
    <div className={styles.root}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#16a34a"/>
            <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="18" cy="21" r="3" fill="white"/>
          </svg>
          <span>QuickCourt</span>
          <span className={styles.adminBadge}>Admin</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ to, label, exact }) => (
            <NavLink key={to} to={to} end={exact}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.bottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className={styles.main}><Outlet /></main>
    </div>
  );
}
