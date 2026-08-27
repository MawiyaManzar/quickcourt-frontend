import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import styles from './UserLayout.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/venues', label: 'Venues' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/profile', label: 'Profile' },
];

export default function UserLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className={styles.root}>
      {/* Top Navigation */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <NavLink to="/" className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#16a34a" />
              <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="18" cy="21" r="3" fill="white"/>
            </svg>
            <span>QuickCourt</span>
          </NavLink>

          <div className={styles.links}>
            {NAV_LINKS.map(({ to, label, exact }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className={styles.actions}>
            {isAuthenticated ? (
              <>
                <div className={styles.userChip}>
                  <div className={styles.avatar}>
                    {user?.avatar
                      ? <img src={user.avatar} alt={user.name} />
                      : <span>{user?.name?.[0]?.toUpperCase()}</span>
                    }
                  </div>
                  <span className={styles.userName}>{user?.name}</span>
                </div>
                <button className={styles.logoutBtn} onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink to="/auth/login"    className={styles.loginBtn}>Login</NavLink>
                <NavLink to="/auth/register" className={styles.registerBtn}>Sign Up</NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
