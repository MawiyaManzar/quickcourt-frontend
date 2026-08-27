import { Link } from 'react-router-dom';
import type { Venue } from '../types';
import styles from './VenueCard.module.css';

interface VenueCardProps {
  venue: Venue;
}

export default function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link to={`/venues/${venue.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={venue.images[0] || 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=800&q=80'}
          alt={venue.name}
          className={styles.image}
          loading="lazy"
        />
        <span className={styles.typeBadge}>{venue.venueType}</span>
        <div className={styles.ratingBadge}>
          <span className={styles.starIcon}>★</span>
          <span>{venue.rating.toFixed(1)} ({venue.reviewCount})</span>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{venue.name}</h3>

        <div className={styles.location}>
          <span>📍</span>
          <span>{venue.area}, {venue.city}</span>
        </div>

        <div className={styles.sportsRow}>
          {venue.sports.slice(0, 3).map((sport) => (
            <span key={sport} className={styles.sportTag}>
              {sport}
            </span>
          ))}
          {venue.sports.length > 3 && (
            <span className={styles.sportTag}>+{venue.sports.length - 3} more</span>
          )}
        </div>

        <div className={styles.footer}>
          <div>
            <div className={styles.priceLabel}>Starts from</div>
            <div>
              <span className={styles.priceValue}>₹{venue.startingPrice}</span>
              <span className={styles.priceUnit}> / hr</span>
            </div>
          </div>
          <span className={styles.bookBtn}>View Details</span>
        </div>
      </div>
    </Link>
  );
}
