import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { venueService } from './services/venueService';
import type { Venue } from './types';
import VenueMap from './components/VenueMap';
import styles from './VenueDetailPage.module.css';

type TabType = 'overview' | 'courts' | 'amenities' | 'map' | 'reviews';

export default function VenueDetailPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    if (!venueId) return;
    setIsLoading(true);
    venueService.fetchVenueById(venueId).then((data) => {
      setVenue(data);
      setIsLoading(false);
    });
  }, [venueId]);

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div style={{ height: 400, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '64px 0' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.75rem', fontWeight: 700 }}>Venue Not Found</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '8px' }}>
          The requested venue could not be found or has been removed.
        </p>
        <Link to="/venues" className={styles.backBtn} style={{ marginTop: '24px', display: 'inline-block' }}>
          ← Back to All Venues
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Back Navigation Link */}
      <Link to="/venues" className={styles.backBtn}>
        ← Back to Venues
      </Link>

      {/* Gallery Banner */}
      <div className={styles.galleryGrid}>
        <img
          src={venue.images[0] || 'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=1200&q=80'}
          alt={venue.name}
          className={styles.mainPhoto}
        />
        <div className={styles.subPhotos}>
          <img
            src={venue.images[1] || venue.images[0]}
            alt={`${venue.name} preview 2`}
            className={styles.subPhoto}
          />
          <img
            src={venue.images[2] || venue.images[0]}
            alt={`${venue.name} preview 3`}
            className={styles.subPhoto}
          />
        </div>
      </div>

      {/* Main Layout (Left Info + Right Sticky Booking Card) */}
      <div className={styles.detailLayout}>
        <div className={styles.leftContent}>
          {/* Header Info */}
          <div className={styles.venueHeader}>
            <h1 className={styles.venueTitle}>{venue.name}</h1>
            <p className={styles.tagline}>{venue.tagline}</p>

            <div className={styles.metaRow}>
              <div className={styles.ratingBadge}>
                ★ {venue.rating.toFixed(1)} ({venue.reviewCount} reviews)
              </div>
              <div className={styles.locationBadge}>
                📍 {venue.fullAddress}
              </div>
            </div>

            <div className={styles.sportsRow} style={{ marginTop: '8px' }}>
              {venue.sports.map((sport) => (
                <span key={sport} className={styles.sportTag}>
                  {sport}
                </span>
              ))}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabs}>
            {(['overview', 'courts', 'amenities', 'map', 'reviews'] as TabType[]).map((tab) => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className={styles.tabSection}>
              <h3 className={styles.sectionHeading}>About the Venue</h3>
              <p className={styles.description}>{venue.description}</p>

              <h3 className={styles.sectionHeading} style={{ marginTop: '16px' }}>Operating Hours</h3>
              <p className={styles.description}>Open Daily: 06:00 AM – 11:00 PM</p>

              {venue.contactPhone && (
                <div>
                  <h3 className={styles.sectionHeading} style={{ marginTop: '16px' }}>Contact Information</h3>
                  <p className={styles.description}>📞 {venue.contactPhone} {venue.contactEmail && `| ✉️ ${venue.contactEmail}`}</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Courts */}
          {activeTab === 'courts' && (
            <div className={styles.tabSection}>
              <h3 className={styles.sectionHeading}>Available Courts & Fields</h3>
              <div className={styles.courtsGrid}>
                {venue.courts.map((court) => (
                  <div key={court.id} className={styles.courtCard}>
                    <div className={styles.courtInfo}>
                      <h4 className={styles.courtName}>{court.name}</h4>
                      <span className={styles.courtMeta}>
                        Sport: <strong>{court.sport}</strong> • Hours: {court.openingTime} – {court.closingTime}
                      </span>
                    </div>

                    <div className={styles.courtAction}>
                      <span className={styles.courtPrice}>₹{court.pricePerHour}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>/hr</span></span>
                      <button
                        className={styles.bookCourtBtn}
                        onClick={() => navigate(`/venues/${venue.id}/book?courtId=${court.id}`)}
                      >
                        Book Court
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Amenities */}
          {activeTab === 'amenities' && (
            <div className={styles.tabSection}>
              <h3 className={styles.sectionHeading}>Amenities & Facilities</h3>
              <div className={styles.amenitiesGrid}>
                {venue.amenities.map((item) => (
                  <div key={item.id} className={styles.amenityCard}>
                    <span className={styles.amenityIcon}>{item.icon}</span>
                    <span className={styles.amenityName}>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Location Map */}
          {activeTab === 'map' && (
            <div className={styles.tabSection}>
              <h3 className={styles.sectionHeading}>Venue Location</h3>
              <p className={styles.description} style={{ marginBottom: '12px' }}>
                📍 {venue.fullAddress}
              </p>
              <VenueMap
                latitude={venue.latitude}
                longitude={venue.longitude}
                venueName={venue.name}
                address={venue.fullAddress}
              />
            </div>
          )}

          {/* Tab 5: Reviews */}
          {activeTab === 'reviews' && (
            <div className={styles.tabSection}>
              <h3 className={styles.sectionHeading}>Customer Reviews</h3>
              <div className={styles.reviewsList}>
                {venue.reviews.map((review) => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewUser}>{review.userName}</span>
                      <span className={styles.reviewDate}>{review.date}</span>
                    </div>
                    <div style={{ color: '#f59e0b', fontSize: '14px' }}>
                      {'★'.repeat(Math.floor(review.rating))} ({review.rating.toFixed(1)})
                    </div>
                    <p className={styles.reviewComment}>"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Booking Sidebar */}
        <aside className={styles.bookingSidebar}>
          <div className={styles.priceBlock}>
            <span className={styles.priceSub}>Starting from</span>
            <span className={styles.mainPrice}>₹{venue.startingPrice}<span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}> / hour</span></span>
          </div>

          <Link to={`/venues/${venue.id}/book`} className={styles.bookNowBtn}>
            Book Court Now →
          </Link>

          <div className={styles.sidebarMeta}>
            <div className={styles.metaItem}>
              <span>⚡</span> <span>Instant Confirmation</span>
            </div>
            <div className={styles.metaItem}>
              <span>🔄</span> <span>Free Cancellation up to 24h before</span>
            </div>
            <div className={styles.metaItem}>
              <span>🛡️</span> <span>Verified QuickCourt Partner</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
