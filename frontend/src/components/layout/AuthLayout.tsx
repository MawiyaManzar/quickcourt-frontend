import { Outlet } from 'react-router-dom';
import styles from './AuthLayout.module.css';

export default function AuthLayout() {
  return (
    <div className={styles.root}>
      {/* Left panel — Branding */}
      <div className={styles.brand}>
        <div className={styles.logo}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="10" fill="#16a34a" />
            <path d="M10 26 L18 10 L26 26" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx="18" cy="21" r="3" fill="white" />
          </svg>
          <span className={styles.logoText}>QuickCourt</span>
        </div>
        <h1 className={styles.tagline}>Book Local Sports Courts.<br />Play More.</h1>
        <p className={styles.sub}>Badminton · Tennis · Football · Cricket · Basketball</p>

        {/* Decorative sport icons */}
        <div className={styles.sportIcons}>
          {['🏸', '🎾', '⚽', '🏏', '🏀'].map((icon) => (
            <span key={icon} className={styles.sportIcon}>{icon}</span>
          ))}
        </div>
      </div>

      {/* Right panel — Form */}
      <div className={styles.form}>
        <Outlet />
      </div>
    </div>
  );
}
