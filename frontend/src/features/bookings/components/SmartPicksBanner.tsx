import type { SmartPick } from '../types';
import styles from './SmartPicksBanner.module.css';

interface SmartPicksBannerProps {
  picks: SmartPick[];
  onSelectPick: (pick: SmartPick) => void;
}

export default function SmartPicksBanner({ picks, onSelectPick }: SmartPicksBannerProps) {
  if (picks.length === 0) return null;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span>⚡</span> QuickCourt Smart Picks Recommended Slots
      </div>

      <div className={styles.picksGrid}>
        {picks.map((pick) => (
          <div key={pick.id} className={styles.pickCard} onClick={() => onSelectPick(pick)}>
            <span className={styles.badge}>{pick.badgeText}</span>
            <span className={styles.timeLabel}>
              {pick.startTime} – {pick.endTime}
            </span>
            <span className={styles.priceLabel}>
              ₹{pick.price} / hour • 1-click select
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
