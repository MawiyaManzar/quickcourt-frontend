import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { ownerService } from './services/ownerService';
import type { Facility } from '../../types';
import styles from './OwnerFacilitiesPage.module.css';

export default function OwnerFacilitiesPage() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    setIsLoading(true);
    const list = await ownerService.getMyFacilities();
    setFacilities(list);
    setIsLoading(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete facility "${name}"?`)) return;
    try {
      await ownerService.deleteFacility(id);
      toast.success('Facility deleted');
      fetchFacilities();
    } catch {
      toast.error('Failed to delete facility');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Facility Management</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Manage your sports venues and check admin approval statuses.
          </p>
        </div>
        <Button onClick={() => navigate('/owner/facilities/new')}>
          + Add New Facility
        </Button>
      </div>

      {isLoading ? (
        <div style={{ height: 260, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      ) : facilities.length === 0 ? (
        <div className={styles.emptyState}>
          <span style={{ fontSize: '3rem' }}>🏢</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>No Facilities Added Yet</h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: 400 }}>
            List your sports venue on QuickCourt to start receiving court bookings from players.
          </p>
          <Button onClick={() => navigate('/owner/facilities/new')}>
            Submit First Facility
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {facilities.map((fac) => {
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
                  className={styles.cardImage}
                />
                <div className={styles.cardBody}>
                  <div className={styles.titleRow}>
                    <h3 className={styles.facilityName}>{fac.name}</h3>
                    <span className={badgeClass}>{fac.status}</span>
                  </div>

                  <div className={styles.location}>📍 {fac.location}</div>

                  <div className={styles.sportsRow}>
                    {fac.sports.map((s) => (
                      <span key={s} className={styles.sportTag}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <p className={styles.description}>{fac.description}</p>

                  <div className={styles.cardFooter}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/owner/courts')}
                    >
                      🎾 Courts
                    </Button>
                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/owner/facilities/${fac.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(fac.id, fac.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
