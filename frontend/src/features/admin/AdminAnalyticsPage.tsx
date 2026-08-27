import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { adminService, type AdminAnalyticsData } from './services/adminService';
import styles from './AdminAnalyticsPage.module.css';

const SPORT_COLORS = ['#2ECC71', '#3498DB', '#E74C3C', '#F1C40F', '#9B59B6'];

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<string>('30days');
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      const data = await adminService.getAnalytics(timeRange);
      setAnalytics(data);
      setIsLoading(false);
    }
    loadAnalytics();
  }, [timeRange]);

  if (isLoading || !analytics) {
    return (
      <div className={styles.container}>
        <div style={{ height: 320, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Platform Analytics & Insights</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            System activity trends, user registration velocity, facility approvals, and revenue simulation.
          </p>
        </div>

        <select
          className={styles.timeSelector}
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
        >
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="3months">Last 3 Months</option>
          <option value="1year">Last 1 Year</option>
        </select>
      </div>

      <div className={styles.grid}>
        {/* Booking Activity Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Platform Booking Activity</h2>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.bookingTrend}>
                <defs>
                  <linearGradient id="colorBkg" x1="0" y1="0" x2="0" y2="1">
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
                  dataKey="bookings"
                  stroke="#2ECC71"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorBkg)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Registration Velocity */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>User Growth Trend</h2>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.userTrend}>
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
                <Bar dataKey="users" fill="#3498DB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Facility Approval Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Facility Approval Submissions</h2>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.facilityApprovalTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1D2E',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="submitted" name="Submitted" fill="#F1C40F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="approved" name="Approved" fill="#2ECC71" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected" name="Rejected" fill="#E74C3C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sport Breakdown Pie Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Most Active Sports</h2>
          </div>
          <div className={styles.chartContent}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.sportBreakdown}
                  dataKey="count"
                  nameKey="sport"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  label={({ name }) => name}
                >
                  {analytics.sportBreakdown.map((_, idx) => (
                    <Cell key={idx} fill={SPORT_COLORS[idx % SPORT_COLORS.length]} />
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
    </div>
  );
}
