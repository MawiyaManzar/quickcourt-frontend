import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { bookingService } from './services/bookingService';
import type { BookingRecord } from './types';
import styles from './MyBookingsPage.module.css';

type TabType = 'UPCOMING' | 'PAST' | 'CANCELLED';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<BookingRecord | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setIsLoading(true);
    const list = await bookingService.getMyBookings();
    setBookings(list);
    setIsLoading(false);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    setIsCancelling(true);
    try {
      await bookingService.cancelBooking(cancelModalBooking.id);
      toast.success('Booking cancelled successfully');
      setCancelModalBooking(null);
      fetchBookings();
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setIsCancelling(false);
    }
  };

  // Filter lists
  const upcomingList = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'PENDING'
  );
  const pastList = bookings.filter((b) => b.status === 'COMPLETED');
  const cancelledList = bookings.filter((b) => b.status === 'CANCELLED');

  const currentList =
    activeTab === 'UPCOMING'
      ? upcomingList
      : activeTab === 'PAST'
      ? pastList
      : cancelledList;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>My Bookings</h1>
        <Button onClick={() => navigate('/venues')}>+ Book New Court</Button>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${activeTab === 'UPCOMING' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('UPCOMING')}
        >
          Upcoming <span className={styles.tabCount}>{upcomingList.length}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'PAST' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('PAST')}
        >
          Past / Completed <span className={styles.tabCount}>{pastList.length}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'CANCELLED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('CANCELLED')}
        >
          Cancelled <span className={styles.tabCount}>{cancelledList.length}</span>
        </button>
      </div>

      {/* Content Cards */}
      {isLoading ? (
        <div style={{ height: 240, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      ) : currentList.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📅</span>
          <h2 className={styles.emptyTitle}>
            No {activeTab.toLowerCase()} bookings found
          </h2>
          <p className={styles.emptyText}>
            Ready to play? Search for top sports venues near you and reserve your preferred court in seconds.
          </p>
          <Button onClick={() => navigate('/venues')}>Explore Venues</Button>
        </div>
      ) : (
        <div className={styles.cardsList}>
          {currentList.map((item) => {
            const isUpcoming = item.status === 'CONFIRMED' || item.status === 'PENDING';
            const badgeClass =
              item.status === 'CONFIRMED' || item.status === 'PENDING'
                ? styles.badgeConfirmed
                : item.status === 'COMPLETED'
                ? styles.badgeCompleted
                : styles.badgeCancelled;

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardLeft}>
                  <img
                    src="https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=300&q=80"
                    alt={item.venueName}
                    className={styles.thumb}
                  />
                  <div className={styles.cardInfo}>
                    <div className={styles.venueName}>{item.venueName}</div>
                    <div className={styles.courtName}>
                      {item.courtName} • {item.sport}
                    </div>
                    <div className={styles.dateTimeRow}>
                      <span>📅 {item.date}</span>
                      <span>⏰ {item.startTime} – {item.endTime}</span>
                      <span>🆔 #{item.id}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.cardRight}>
                  <span className={badgeClass}>{item.status}</span>
                  <div className={styles.price}>₹{item.totalPrice}</div>

                  {isUpcoming && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCancelModalBooking(item)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalBooking && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Cancel Booking Confirmation</h3>
            <p className={styles.modalBody}>
              Are you sure you want to cancel your slot for <strong>{cancelModalBooking.courtName}</strong> on <strong>{cancelModalBooking.date}</strong> ({cancelModalBooking.startTime} – {cancelModalBooking.endTime})?
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => setCancelModalBooking(null)}
                disabled={isCancelling}
              >
                Keep Booking
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmCancel}
                isLoading={isCancelling}
              >
                Yes, Cancel Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
