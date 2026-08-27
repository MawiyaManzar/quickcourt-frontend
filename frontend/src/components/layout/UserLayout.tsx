import { useState, type SyntheticEvent } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import styles from './UserLayout.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/venues', label: 'Venues' },
  { to: '/bookings', label: 'My Bookings' },
  { to: '/profile', label: 'Profile' },
];

const CITIES = ['Delhi NCR', 'Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai'];

export default function UserLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('Delhi NCR');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  const handleSearchSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/venues?q=${encodeURIComponent(searchQuery.trim())}&city=${encodeURIComponent(selectedCity)}`);
    } else {
      navigate(`/venues?city=${encodeURIComponent(selectedCity)}`);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    navigate(`/venues?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className={styles.root}>
      {/* Top Navigation Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          {/* Brand Logo */}
          <NavLink to="/" className={styles.logo}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="#16a34a" />
              <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="18" cy="21" r="3" fill="white"/>
            </svg>
            <span>QuickCourt</span>
          </NavLink>

          {/* City Selector */}
          <div className={styles.citySelector}>
            <span className={styles.cityIcon}>📍</span>
            <select
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              className={styles.cityDropdown}

            >
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Header Search Bar */}
          <form onSubmit={handleSearchSubmit} className={styles.headerSearch}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search sports or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </form>

          {/* Nav Links */}
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

          {/* Actions / Auth */}
          <div className={styles.actions}>
            {/* Notification Bell */}
            <button className={styles.iconBtn} title="Notifications" aria-label="Notifications">
              🔔
            </button>

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
                <NavLink to="/auth/login" className={styles.loginBtn}>Login</NavLink>
                <NavLink to="/auth/register" className={styles.registerBtn}>Sign Up</NavLink>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerCol}>
            <div className={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="8" fill="#16a34a" />
                <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="18" cy="21" r="3" fill="white"/>
              </svg>
              <span>QuickCourt</span>
            </div>
            <p className={styles.footerText}>
              Book your favorite local sports courts in seconds. Real-time availability, instant confirmations.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Sports</h4>
            <div className={styles.footerLinks}>
              <NavLink to="/venues?sport=Badminton">Badminton Courts</NavLink>
              <NavLink to="/venues?sport=Football">Football Turfs</NavLink>
              <NavLink to="/venues?sport=Tennis">Tennis Courts</NavLink>
              <NavLink to="/venues?sport=Cricket">Box Cricket Nets</NavLink>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Platform</h4>
            <div className={styles.footerLinks}>
              <NavLink to="/venues">Explore All Venues</NavLink>
              <NavLink to="/auth/register">List Your Venue</NavLink>
              <NavLink to="/auth/login">Owner Login</NavLink>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 QuickCourt Platform. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

