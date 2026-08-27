import { useEffect, useState, type SyntheticEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { adminService } from './services/adminService';
import type { Facility } from '../../types';
import styles from './AdminFacilitiesPage.module.css';

type TabType = 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminFacilitiesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('PENDING');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Rejection Modal State
  const [rejectModalFacility, setRejectModalFacility] = useState<Facility | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Inspect Modal State
  const [inspectFacility, setInspectFacility] = useState<Facility | null>(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setIsLoading(true);
    const list = await adminService.getFacilities();
    setFacilities(list);
    setIsLoading(false);
  };

  const handleApprove = async (facility: Facility) => {
    if (!window.confirm(`Approve facility "${facility.name}" for public customer bookings?`)) return;
    try {
      await adminService.approveFacility(facility.id);
      toast.success(`Facility "${facility.name}" approved successfully!`);
      fetchFacilities();
    } catch {
      toast.error('Failed to approve facility');
    }
  };

  const handleConfirmReject = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!rejectModalFacility || !rejectionReason.trim()) {
      toast.error('Rejection reason required');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.rejectFacility(rejectModalFacility.id, rejectionReason.trim());
      toast.success(`Facility rejected`);
      setRejectModalFacility(null);
      setRejectionReason('');
      fetchFacilities();
    } catch {
      toast.error('Failed to reject facility');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingList = facilities.filter((f) => f.status === 'PENDING');
  const approvedList = facilities.filter((f) => f.status === 'APPROVED');
  const rejectedList = facilities.filter((f) => f.status === 'REJECTED');

  const currentList =
    activeTab === 'PENDING'
      ? pendingList
      : activeTab === 'APPROVED'
      ? approvedList
      : rejectedList;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Facility Approval & Verification</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Inspect sports venues submitted by facility owners and approve them for public listing.
        </p>
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        <button
          className={`${styles.tabButton} ${activeTab === 'PENDING' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('PENDING')}
        >
          Pending Review <span className={styles.tabCount}>{pendingList.length}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'APPROVED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('APPROVED')}
        >
          Approved <span className={styles.tabCount}>{approvedList.length}</span>
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'REJECTED' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('REJECTED')}
        >
          Rejected <span className={styles.tabCount}>{rejectedList.length}</span>
        </button>
      </div>

      {isLoading ? (
        <div style={{ height: 260, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      ) : currentList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>
            No {activeTab.toLowerCase()} facilities at this time.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {currentList.map((fac) => {
            const badgeClass =
              fac.status === 'APPROVED'
                ? styles.badgeApproved
                : fac.status === 'PENDING'
                ? styles.badgePending
                : styles.badgeRejected;

            return (
              <div key={fac.id} className={styles.card}>
                <img
                  src={
                    fac.images[0] ||
                    'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={fac.name}
                  className={styles.cardImg}
                />
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.facilityName}>{fac.name}</h3>
                    <span className={badgeClass}>{fac.status}</span>
                  </div>

                  <div className={styles.ownerMeta}>
                    🏢 Owner: <strong>{fac.ownerName || 'Partner Owner'}</strong> • 📍 {fac.location}
                  </div>

                  <p className={styles.description}>{fac.description}</p>

                  <div className={styles.cardFooter}>
                    <Button variant="outline" size="sm" onClick={() => setInspectFacility(fac)}>
                      Inspect Details
                    </Button>

                    {fac.status === 'PENDING' && (
                      <div className={styles.actions}>
                        <Button variant="danger" size="sm" onClick={() => setRejectModalFacility(fac)}>
                          Reject
                        </Button>
                        <Button size="sm" onClick={() => handleApprove(fac)}>
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalFacility && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleConfirmReject} className={styles.modalCard}>
            <h2 className={styles.modalTitle}>Reject Facility Application</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Facility: <strong>{rejectModalFacility.name}</strong>
            </p>

            <Input
              label="Reason for Rejection *"
              placeholder="e.g. Incomplete address proof, missing court safety photos"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
            />

            <div className={styles.modalActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRejectModalFacility(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={isSubmitting}>
                Confirm Rejection
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Inspect Facility Modal */}
      {inspectFacility && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h2 className={styles.modalTitle}>{inspectFacility.name}</h2>
            <div style={{ fontSize: '0.875rem', color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>📍 <strong>Address:</strong> {inspectFacility.address} ({inspectFacility.location})</div>
              <div>🏢 <strong>Owner:</strong> {inspectFacility.ownerName || 'Partner Owner'}</div>
              <div>🎾 <strong>Sports:</strong> {inspectFacility.sports.join(', ')}</div>
              <div>✨ <strong>Amenities:</strong> {inspectFacility.amenities.join(', ')}</div>
              <div>📝 <strong>Description:</strong> {inspectFacility.description}</div>
              {inspectFacility.rejectionReason && (
                <div style={{ color: '#ef4444' }}>⚠️ <strong>Rejection Reason:</strong> {inspectFacility.rejectionReason}</div>
              )}
            </div>

            <div className={styles.modalActions}>
              <Button variant="outline" onClick={() => setInspectFacility(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
