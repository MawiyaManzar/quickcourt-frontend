import { useEffect, useState, type SyntheticEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ownerService } from './services/ownerService';
import type { Facility, Court, SportType } from '../../types';
import styles from './OwnerCourtsPage.module.css';

const SPORT_OPTIONS: SportType[] = [
  'BADMINTON',
  'TENNIS',
  'FOOTBALL',
  'CRICKET',
  'BASKETBALL',
  'TABLE_TENNIS',
  'SQUASH',
];

export default function OwnerCourtsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal Form State
  const [courtName, setCourtName] = useState<string>('');
  const [sportType, setSportType] = useState<SportType>('BADMINTON');
  const [pricePerHour, setPricePerHour] = useState<number>(500);
  const [openingTime, setOpeningTime] = useState<string>('06:00');
  const [closingTime, setClosingTime] = useState<string>('23:00');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      loadCourts(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  const loadFacilities = async () => {
    setIsLoading(true);
    const list = await ownerService.getMyFacilities();
    setFacilities(list);
    if (list.length > 0) {
      setSelectedFacilityId(list[0].id);
    } else {
      setIsLoading(false);
    }
  };

  const loadCourts = async (facilityId: string) => {
    setIsLoading(true);
    const list = await ownerService.getCourts(facilityId);
    setCourts(list);
    setIsLoading(false);
  };

  const handleOpenAddModal = () => {
    setEditingCourt(null);
    setCourtName('');
    setSportType('BADMINTON');
    setPricePerHour(500);
    setOpeningTime('06:00');
    setClosingTime('23:00');
    setStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (court: Court) => {
    setEditingCourt(court);
    setCourtName(court.name);
    setSportType(court.sportType);
    setPricePerHour(court.pricePerHour);
    setOpeningTime(court.openingTime);
    setClosingTime(court.closingTime);
    setStatus(court.status);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (court: Court) => {
    const newStatus = court.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await ownerService.updateCourt(court.id, { status: newStatus });
      toast.success(`Court set to ${newStatus}`);
      loadCourts(selectedFacilityId);
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteCourt = async (court: Court) => {
    if (!window.confirm(`Delete court "${court.name}"?`)) return;
    try {
      await ownerService.deleteCourt(court.id);
      toast.success('Court deleted');
      loadCourts(selectedFacilityId);
    } catch {
      toast.error('Failed to delete court');
    }
  };

  const handleSaveCourt = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!courtName.trim()) {
      toast.error('Court name required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCourt) {
        await ownerService.updateCourt(editingCourt.id, {
          name: courtName.trim(),
          sportType,
          pricePerHour: Number(pricePerHour),
          openingTime,
          closingTime,
          status,
        });
        toast.success('Court updated');
      } else {
        await ownerService.createCourt({
          facilityId: selectedFacilityId,
          name: courtName.trim(),
          sportType,
          pricePerHour: Number(pricePerHour),
          openingTime,
          closingTime,
          status,
        });
        toast.success('New court added!');
      }
      setIsModalOpen(false);
      loadCourts(selectedFacilityId);
    } catch {
      toast.error('Failed to save court');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Court Management</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Manage individual courts, hourly pricing, and active operational hours.
          </p>
        </div>
        <Button onClick={handleOpenAddModal} disabled={!selectedFacilityId}>
          + Add Court
        </Button>
      </div>

      {/* Facility Selector */}
      <div className={styles.selectorBar}>
        <span className={styles.selectLabel}>Select Facility:</span>
        <select
          className={styles.selectInput}
          value={selectedFacilityId}
          onChange={(e) => setSelectedFacilityId(e.target.value)}
        >
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.location})
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div style={{ height: 240, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      ) : courts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No courts added yet for this facility.</p>
          <Button style={{ marginTop: '1rem' }} onClick={handleOpenAddModal}>
            Add First Court
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {courts.map((crt) => (
            <div key={crt.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.courtName}>{crt.name}</h3>
                <span
                  className={crt.status === 'ACTIVE' ? styles.badgeActive : styles.badgeInactive}
                >
                  {crt.status}
                </span>
              </div>

              <div className={styles.detailsList}>
                <div>🏀 Sport: <strong>{crt.sportType}</strong></div>
                <div>⏰ Hours: <strong>{crt.openingTime} – {crt.closingTime}</strong></div>
                <div className={styles.price}>₹{crt.pricePerHour} / hour</div>
              </div>

              <div className={styles.cardActions}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(crt)}
                >
                  {crt.status === 'ACTIVE' ? 'Pause' : 'Activate'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleOpenEditModal(crt)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteCourt(crt)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleSaveCourt} className={styles.modalCard}>
            <h2 className={styles.modalTitle}>
              {editingCourt ? 'Edit Court' : 'Add New Court'}
            </h2>

            <Input
              label="Court Name *"
              placeholder="e.g. Court 1 (Synthetic Mat)"
              value={courtName}
              onChange={(e) => setCourtName(e.target.value)}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Sport Type *</label>
              <select
                className={styles.selectInput}
                style={{ width: '100%' }}
                value={sportType}
                onChange={(e) => setSportType(e.target.value as SportType)}
              >
                {SPORT_OPTIONS.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Price Per Hour (₹) *"
              type="number"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(Number(e.target.value))}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Opening Time"
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                required
              />
              <Input
                label="Closing Time"
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                required
              />
            </div>

            <div className={styles.modalActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Save Court
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
