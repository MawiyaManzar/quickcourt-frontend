import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import styles from './OwnerLayout.module.css';

const NAV = [
  { to: '/owner',            label: '📊 Dashboard', exact: true },
  { to: '/owner/facilities', label: '🏢 Facilities' },
  { to: '/owner/courts',     label: '🎾 Courts' },
  { to: '/owner/slots',      label: '📅 Time Slots' },
  { to: '/owner/bookings',   label: '📋 Bookings' },
  { to: '/owner/profile',    label: '👤 Profile' },
];

export default function OwnerLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/auth/login'); };

  return (
    <div className={styles.root}>
      {/* Mobile Top Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#16a34a"/>
            <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="18" cy="21" r="3" fill="white"/>
          </svg>
          <span>QuickCourt</span>
        </div>
        <button
          className={styles.menuToggle}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logo}>
          <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#16a34a"/>
            <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <circle cx="18" cy="21" r="3" fill="white"/>
          </svg>
          <span>QuickCourt</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ to, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.bottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
            <div>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>Facility Owner</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className={styles.main}><Outlet /></main>
    </div>
  );
}
