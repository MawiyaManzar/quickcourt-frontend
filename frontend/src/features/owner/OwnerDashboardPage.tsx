import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { ownerService } from './services/ownerService';
import type { OwnerAnalytics, Booking } from '../../types';
import styles from './OwnerDashboardPage.module.css';

const SPORT_COLORS = ['#2ECC71', '#3498DB', '#E74C3C', '#F1C40F'];

export default function OwnerDashboardPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<OwnerAnalytics | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const [anData, bkgData] = await Promise.all([
        ownerService.getAnalytics(),
        ownerService.getOwnerBookings(),
      ]);
      setAnalytics(anData);
      setRecentBookings(bkgData.slice(0, 5));
      setIsLoading(false);
    }
    loadData();
  }, []);

  if (isLoading || !analytics) {
    return (
      <div className={styles.container}>
        <div style={{ height: 300, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Facility Owner Dashboard</h1>
        <p className={styles.subtitle}>
          Overview of your sports venue performance, revenue, and upcoming bookings.
        </p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Total Bookings</span>
            <span className={styles.kpiIcon}>📅</span>
          </div>
          <div className={styles.kpiValue}>{analytics.totalBookings}</div>
          <div className={styles.kpiTrend}>↑ +14% vs last week</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Courts</span>
            <span className={styles.kpiIcon}>🎾</span>
          </div>
          <div className={styles.kpiValue}>{analytics.activeCourts}</div>
          <div className={styles.kpiTrend}>Operational</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Earnings (This Month)</span>
            <span className={styles.kpiIcon}>💰</span>
          </div>
          <div className={styles.kpiValue}>₹{analytics.monthlyEarnings.toLocaleString()}</div>
          <div className={styles.kpiTrend}>↑ +18% vs last month</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Upcoming Bookings</span>
            <span className={styles.kpiIcon}>⏰</span>
          </div>
          <div className={styles.kpiValue}>{analytics.upcomingBookings}</div>
          <div className={styles.kpiTrend}>Next 7 days</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className={styles.chartsRow}>
        {/* Booking & Revenue Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Revenue Trend (This Week)</h2>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.bookingTrend}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1D2E',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2ECC71"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sport Breakdown Pie Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Revenue by Sport</h2>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.sportBreakdown}
                  dataKey="revenue"
                  nameKey="sport"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name }) => name}
                >
                  {analytics.sportBreakdown.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={SPORT_COLORS[index % SPORT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1D2E',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Upcoming Bookings */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>Recent Customer Bookings</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/owner/bookings')}>
            View All Bookings →
          </Button>
        </div>

        <div className={styles.feedList}>
          {recentBookings.map((bkg) => (
            <div key={bkg.id} className={styles.feedItem}>
              <div className={styles.itemLeft}>
                <span className={styles.userName}>{bkg.userName || 'Customer'}</span>
                <span className={styles.itemSub}>
                  {bkg.courtName} • 📅 {bkg.bookingDate} ({bkg.startTime} – {bkg.endTime})
                </span>
              </div>
              <div className={styles.itemRight}>
                <span className={styles.amount}>₹{bkg.amount}</span>
                <span className={styles.badge}>{bkg.bookingStatus}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
