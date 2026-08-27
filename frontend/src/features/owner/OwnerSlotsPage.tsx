import { useEffect, useState, type SyntheticEvent } from 'react';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ownerService } from './services/ownerService';
import type { Facility, Court, TimeSlot } from '../../types';
import styles from './OwnerSlotsPage.module.css';

export default function OwnerSlotsPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Block Modal state
  const [blockModalSlot, setBlockModalSlot] = useState<TimeSlot | null>(null);
  const [blockReason, setBlockReason] = useState<string>('Scheduled Maintenance');
  const [isBlocking, setIsBlocking] = useState<boolean>(false);

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacilityId) {
      loadCourts(selectedFacilityId);
    }
  }, [selectedFacilityId]);

  useEffect(() => {
    if (selectedCourtId && selectedDate) {
      loadSlots(selectedCourtId, selectedDate);
    }
  }, [selectedCourtId, selectedDate]);

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
    const list = await ownerService.getCourts(facilityId);
    setCourts(list);
    if (list.length > 0) {
      setSelectedCourtId(list[0].id);
    } else {
      setSlots([]);
      setIsLoading(false);
    }
  };

  const loadSlots = async (courtId: string, date: string) => {
    setIsLoading(true);
    const data = await ownerService.getCourtSlots(courtId, date);
    setSlots(data);
    setIsLoading(false);
  };

  const handleConfirmBlock = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!blockModalSlot) return;

    setIsBlocking(true);
    try {
      await ownerService.blockSlot({
        courtId: selectedCourtId,
        date: selectedDate,
        startTime: blockModalSlot.startTime,
        endTime: blockModalSlot.endTime,
        reason: blockReason,
      });
      toast.success('Slot blocked successfully');
      setBlockModalSlot(null);
      loadSlots(selectedCourtId, selectedDate);
    } catch {
      toast.error('Failed to block slot');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async (slot: TimeSlot) => {
    if (!window.confirm(`Unblock time slot ${slot.startTime} – ${slot.endTime}?`)) return;
    try {
      await ownerService.unblockSlot(slot.blockId || '', selectedCourtId, selectedDate, slot.startTime);
      toast.success('Slot is now available for user booking');
      loadSlots(selectedCourtId, selectedDate);
    } catch {
      toast.error('Failed to unblock slot');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Time Slot Availability & Maintenance</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
          Manage court slot availability, view customer reservations, or block slots for private maintenance.
        </p>
      </div>

      {/* Filter controls */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <span className={styles.label}>Facility:</span>
          <select
            className={styles.selectInput}
            value={selectedFacilityId}
            onChange={(e) => setSelectedFacilityId(e.target.value)}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.label}>Court:</span>
          <select
            className={styles.selectInput}
            value={selectedCourtId}
            onChange={(e) => setSelectedCourtId(e.target.value)}
            disabled={courts.length === 0}
          >
            {courts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.sportType})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.label}>Date:</span>
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Status Legend */}
      <div className={styles.legendBar}>
        <div className={styles.legendItem}>
          <span className={styles.dotAvailable} /> Available (Bookable)
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotBooked} /> Booked by Customer
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotBlocked} /> Blocked (Maintenance / Private)
        </div>
      </div>

      {/* Slot Grid */}
      {isLoading ? (
        <div style={{ height: 260, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      ) : slots.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--color-surface)', borderRadius: '16px' }}>
          <p style={{ color: 'var(--color-text-muted)' }}>No court selected or no operating hours configured.</p>
        </div>
      ) : (
        <div className={styles.slotGrid}>
          {slots.map((s) => {
            const isAvail = s.status === 'AVAILABLE';
            const isBooked = s.status === 'BOOKED';
            const isBlocked = s.status === 'BLOCKED';

            const cardClass = isAvail
              ? styles.slotAvailable
              : isBooked
              ? styles.slotBooked
              : styles.slotBlocked;

            const textClass = isAvail
              ? styles.textAvailable
              : isBooked
              ? styles.textBooked
              : styles.textBlocked;

            return (
              <div key={s.startTime} className={`${styles.slotCard} ${cardClass}`}>
                <div className={styles.timeText}>
                  {s.startTime} – {s.endTime}
                </div>
                <div className={`${styles.statusText} ${textClass}`}>{s.status}</div>

                {isBlocked && s.blockReason && (
                  <div style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center' }}>
                    {s.blockReason}
                  </div>
                )}

                {isAvail && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setBlockReason('Scheduled Maintenance');
                      setBlockModalSlot(s);
                    }}
                  >
                    Block Slot
                  </Button>
                )}

                {isBlocked && (
                  <Button variant="danger" size="sm" onClick={() => handleUnblock(s)}>
                    Unblock
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Block Modal */}
      {blockModalSlot && (
        <div className={styles.modalOverlay}>
          <form onSubmit={handleConfirmBlock} className={styles.modalCard}>
            <h2 className={styles.modalTitle}>Block Slot for Maintenance</h2>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
              Slot: <strong>{blockModalSlot.startTime} – {blockModalSlot.endTime}</strong> on{' '}
              <strong>{selectedDate}</strong>
            </p>

            <Input
              label="Reason for Blocking *"
              placeholder="e.g. Mat Maintenance, Private Tournament, Repairs"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              required
            />

            <div className={styles.modalActions}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setBlockModalSlot(null)}
                disabled={isBlocking}
              >
                Cancel
              </Button>
              <Button type="submit" variant="danger" isLoading={isBlocking}>
                Confirm Block
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
