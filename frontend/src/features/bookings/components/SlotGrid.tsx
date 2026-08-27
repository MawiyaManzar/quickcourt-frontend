import type { TimeSlot } from '../types';
import styles from './SlotGrid.module.css';

interface SlotGridProps {
  slots: TimeSlot[];
  selectedSlotIds: string[];
  onToggleSlot: (slot: TimeSlot) => void;
}

export default function SlotGrid({ slots, selectedSlotIds, onToggleSlot }: SlotGridProps) {
  if (slots.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
        No time slots available for this date. Please select another date.
      </div>
    );
  }

  return (
    <div className={styles.gridContainer}>
      {slots.map((slot) => {
        const isSelected = selectedSlotIds.includes(slot.id);
        const isBooked = slot.status === 'BOOKED';
        const isMaintenance = slot.status === 'MAINTENANCE';

        return (
          <div
            key={slot.id}
            className={`${styles.slotCard} ${
              isSelected
                ? styles.slotSelected
                : isBooked
                ? styles.slotBooked
                : isMaintenance
                ? styles.slotMaintenance
                : ''
            }`}
            onClick={() => !isBooked && !isMaintenance && onToggleSlot(slot)}
          >
            <span className={styles.timeText}>
              {slot.startTime} – {slot.endTime}
            </span>
            <span className={styles.priceText}>₹{slot.price}</span>
            <span className={styles.statusBadge}>
              {isSelected
                ? 'Selected'
                : isBooked
                ? 'Booked'
                : isMaintenance
                ? 'Blocked'
                : 'Available'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
