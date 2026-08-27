import { useEffect, useState } from 'react';
import { Input } from '../../components/ui/Input';
import { ownerService } from './services/ownerService';
import type { Booking } from '../../types';
import styles from './OwnerBookingsPage.module.css';

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    const list = await ownerService.getOwnerBookings();
    setBookings(list);
    setIsLoading(false);
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.courtName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.facilityName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || b.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Facility Bookings Overview</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Monitor customer reservations across your sports venues and courts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchInput}>
          <Input
            placeholder="Search by customer name, facility, or court..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className={styles.selectInput}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <div style={{ height: 280, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      ) : filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No bookings found matching your search filters.</p>
        </div>
      ) : (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Facility & Court</th>
                <th>Sport</th>
                <th>Date & Time</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((b) => {
                const badgeClass =
                  b.bookingStatus === 'CONFIRMED'
                    ? styles.badgeConfirmed
                    : b.bookingStatus === 'COMPLETED'
                    ? styles.badgeCompleted
                    : styles.badgeCancelled;

                return (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td className={styles.customerName}>{b.userName || 'Customer'}</td>
                    <td>
                      <div>{b.facilityName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {b.courtName}
                      </div>
                    </td>
                    <td>{b.sportType}</td>
                    <td>
                      <div>📅 {b.bookingDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        ⏰ {b.startTime} – {b.endTime}
                      </div>
                    </td>
                    <td className={styles.price}>₹{b.amount}</td>
                    <td>
                      <span className={badgeClass}>{b.bookingStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
