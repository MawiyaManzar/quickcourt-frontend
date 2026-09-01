import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Avatar } from '../ui/Avatar';
import styles from './UserLayout.module.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', exact: true },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
];

export default function UserLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className={styles.root}>
      {/* Top Navigation Header */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          {/* Brand Logo */}
          <NavLink to="/" className={styles.logo}>
            <div className={styles.logoMark}>H</div>
            <span>AppName</span>
          </NavLink>

          {/* Nav Links (desktop) */}
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
            {isAuthenticated ? (
              <>
                <div className={styles.userChip}>
                  <Avatar src={user?.avatar} name={user?.name} size="sm" />
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

            {/* Mobile hamburger */}
            <button
              className={styles.menuToggle}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </nav>

        {/* Mobile Nav Dropdown */}
        {mobileOpen && (
          <>
            <div className={styles.mobileOverlay} onClick={() => setMobileOpen(false)} />
            <div className={styles.mobileNav}>
              {NAV_LINKS.map(({ to, label, exact }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={exact}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.active : ''}`}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          </>
        )}
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
              <div className={styles.logoMark}>H</div>
              <span>AppName</span>
            </div>
            <p className={styles.footerText}>
              A hackathon-ready frontend template built with React, TypeScript, and Vite.
            </p>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Navigation</h4>
            <div className={styles.footerLinks}>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Profile</NavLink>
            </div>
          </div>

          <div className={styles.footerCol}>
            <h4 className={styles.footerHeading}>Account</h4>
            <div className={styles.footerLinks}>
              <NavLink to="/auth/login">Login</NavLink>
              <NavLink to="/auth/register">Register</NavLink>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} AppName. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
