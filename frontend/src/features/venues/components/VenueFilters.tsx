import type { SportType, VenueType } from '../types';
import styles from './VenueFilters.module.css';

const ALL_SPORTS: SportType[] = [
  'Badminton',
  'Tennis',
  'Football',
  'Cricket',
  'Basketball',
  'Table Tennis',
];

interface VenueFiltersProps {
  selectedSports: SportType[];
  onSportsChange: (sports: SportType[]) => void;
  maxPrice: number;
  onPriceChange: (price: number) => void;
  venueType: VenueType | 'ALL';
  onVenueTypeChange: (type: VenueType | 'ALL') => void;
  minRating: number;
  onRatingChange: (rating: number) => void;
  onClearAll: () => void;
}

export default function VenueFilters({
  selectedSports,
  onSportsChange,
  maxPrice,
  onPriceChange,
  venueType,
  onVenueTypeChange,
  minRating,
  onRatingChange,
  onClearAll,
}: VenueFiltersProps) {
  const toggleSport = (sport: SportType) => {
    if (selectedSports.includes(sport)) {
      onSportsChange(selectedSports.filter((s) => s !== sport));
    } else {
      onSportsChange([...selectedSports, sport]);
    }
  };

  return (
    <aside className={styles.filtersContainer}>
      <div className={styles.filterHeader}>
        <h3 className={styles.title}>
          <span>⚙️</span> Filters
        </h3>
        <button onClick={onClearAll} className={styles.clearBtn}>
          Clear All
        </button>
      </div>

      {/* Sport Types */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Sport Type</span>
        <div className={styles.checkboxList}>
          {ALL_SPORTS.map((sport) => (
            <label key={sport} className={styles.checkboxItem}>
              <input
                type="checkbox"
                checked={selectedSports.includes(sport)}
                onChange={() => toggleSport(sport)}
              />
              <span>{sport}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className={styles.group}>
        <div className={styles.priceDisplay}>
          <span className={styles.groupLabel}>Max Price / Hour</span>
          <span>₹{maxPrice}</span>
        </div>
        <input
          type="range"
          min={200}
          max={3000}
          step={100}
          value={maxPrice}
          onChange={(e) => onPriceChange(Number(e.target.value))}
          className={styles.rangeSlider}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)' }}>
          <span>₹200</span>
          <span>₹3000</span>
        </div>
      </div>

      {/* Venue Type (Indoor / Outdoor / All) */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Venue Environment</span>
        <div className={styles.checkboxList}>
          <label className={styles.checkboxItem}>
            <input
              type="radio"
              name="venueType"
              checked={venueType === 'ALL'}
              onChange={() => onVenueTypeChange('ALL')}
            />
            <span>All Types</span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="radio"
              name="venueType"
              checked={venueType === 'INDOOR'}
              onChange={() => onVenueTypeChange('INDOOR')}
            />
            <span>Indoor Only</span>
          </label>
          <label className={styles.checkboxItem}>
            <input
              type="radio"
              name="venueType"
              checked={venueType === 'OUTDOOR'}
              onChange={() => onVenueTypeChange('OUTDOOR')}
            />
            <span>Outdoor Only</span>
          </label>
        </div>
      </div>

      {/* Minimum Rating */}
      <div className={styles.group}>
        <span className={styles.groupLabel}>Minimum Rating</span>
        <div className={styles.ratingList}>
          {[0, 4.0, 4.5].map((stars) => (
            <button
              key={stars}
              type="button"
              className={`${styles.ratingOption} ${minRating === stars ? styles.ratingOptionActive : ''}`}
              onClick={() => onRatingChange(stars)}
            >
              ★ {stars === 0 ? 'All Ratings' : `${stars}+ Stars`}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
