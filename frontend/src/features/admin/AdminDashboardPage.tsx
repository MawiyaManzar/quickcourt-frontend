import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { adminService } from './services/adminService';
import type { AdminDashboard, Booking, User } from '../../types';
import styles from './AdminDashboardPage.module.css';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [dash, users, bkgs] = await Promise.all([
        adminService.getDashboard(),
        adminService.getUsers(),
        adminService.getPlatformBookings(),
      ]);
      setDashboard(dash);
      setRecentUsers(users.slice(0, 5));
      setRecentBookings(bkgs.slice(0, 5));
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading || !dashboard) {
    return (
      <div className={styles.container}>
        <div style={{ height: 300, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>System Control & Overview</h1>
        <p className={styles.subtitle}>
          Platform-wide KPIs, facility approval requests, user accounts, and booking statistics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Users</span>
            <span className={styles.kpiIcon}>👥</span>
          </div>
          <div className={styles.kpiValue}>{dashboard.totalUsers.toLocaleString()}</div>
          <div className={styles.kpiTrend}>↑ +12% this month</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Facility Owners</span>
            <span className={styles.kpiIcon}>🏢</span>
          </div>
          <div className={styles.kpiValue}>{dashboard.totalOwners.toLocaleString()}</div>
          <div className={styles.kpiTrend}>Registered Partner Owners</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Bookings</span>
            <span className={styles.kpiIcon}>📅</span>
          </div>
          <div className={styles.kpiValue}>{dashboard.totalBookings.toLocaleString()}</div>
          <div className={styles.kpiTrend}>Platform Lifetime</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Courts</span>
            <span className={styles.kpiIcon}>🎾</span>
          </div>
          <div className={styles.kpiValue}>{dashboard.activeCourts.toLocaleString()}</div>
          <div className={styles.kpiTrend}>Operational Courts</div>
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {dashboard.pendingFacilities > 0 && (
        <div className={styles.alertBanner}>
          <div className={styles.alertLeft}>
            <span className={styles.alertIcon}>⚠️</span>
            <div>
              <h2 className={styles.alertTitle}>
                {dashboard.pendingFacilities} Facility Approval Requests Pending Review
              </h2>
              <p className={styles.alertText}>
                New sports venues have been submitted by owners and require compliance inspection before being published.
              </p>
            </div>
          </div>
          <Button onClick={() => navigate('/admin/facilities')}>
            Review Facilities →
          </Button>
        </div>
      )}

      {/* Recent Feeds Grid */}
      <div className={styles.panelsGrid}>
        {/* Recent Registrations */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent User Registrations</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
              View All Users →
            </Button>
          </div>
          <div className={styles.feedList}>
            {recentUsers.map((u) => (
              <div key={u.id} className={styles.feedItem}>
                <div className={styles.itemLeft}>
                  <span className={styles.name}>{u.name}</span>
                  <span className={styles.sub}>{u.email}</span>
                </div>
                <span className={styles.roleBadge}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Platform Bookings</h2>
            <Button variant="outline" size="sm" onClick={() => navigate('/admin/bookings')}>
              View All Bookings →
            </Button>
          </div>
          <div className={styles.feedList}>
            {recentBookings.map((b) => (
              <div key={b.id} className={styles.feedItem}>
                <div className={styles.itemLeft}>
                  <span className={styles.name}>{b.userName || 'Customer'}</span>
                  <span className={styles.sub}>
                    {b.facilityName} • {b.sportType} (₹{b.amount})
                  </span>
                </div>
                <span className={styles.roleBadge}>{b.bookingStatus}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
