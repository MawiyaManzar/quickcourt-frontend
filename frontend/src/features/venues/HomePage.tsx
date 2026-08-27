import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { venueService } from './services/venueService';
import type { Venue, SportType } from './types';
import VenueCard from './components/VenueCard';
import styles from './HomePage.module.css';

const HERO_SLIDES = [
  {
    badge: 'Instant Court Booking',
    title: 'Book Premium Sports Venues',
    highlight: 'Near You',
    subtitle: 'Find and book badminton courts, football turfs, tennis courts, and cricket nets in seconds with instant confirmation.',
    image: 'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Explore All Venues',
    ctaLink: '/venues',
  },
  {
    badge: 'FIFA & BWF Certified',
    title: 'Play on Professional',
    highlight: 'Standard Turfs & Mats',
    subtitle: 'High quality synthetic mats, floodlit night arenas, and climate-controlled indoor courts across all major cities.',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'Find Badminton Courts',
    ctaLink: '/venues?sport=Badminton',
  },
  {
    badge: 'Night Play Available',
    title: 'Book Late Night',
    highlight: 'Turf & Cricket Slots',
    subtitle: 'High power LED lights, box cricket nets, and 7v7 soccer turfs open till late night.',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1600&q=80',
    ctaText: 'View Football Turfs',
    ctaLink: '/venues?sport=Football',
  },
];

const SPORTS_LIST: { name: SportType; icon: string; count: string }[] = [
  { name: 'Badminton', icon: '🏸', count: '12+ Arenas' },
  { name: 'Tennis', icon: '🎾', count: '8+ Courts' },
  { name: 'Football', icon: '⚽', count: '15+ Turfs' },
  { name: 'Cricket', icon: '🏏', count: '10+ Box Nets' },
  { name: 'Basketball', icon: '🏀', count: '6+ Courts' },
  { name: 'Table Tennis', icon: '🏓', count: '5+ Academies' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredVenues, setFeaturedVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Hero carousel auto-play timer (5s)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch featured venues
  useEffect(() => {
    venueService.fetchFeaturedVenues().then((venues) => {
      setFeaturedVenues(venues);
      setIsLoading(false);
    });
  }, []);

  const activeSlide = HERO_SLIDES[currentSlide];

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div
          className={styles.heroBg}
          style={{ backgroundImage: `url(${activeSlide.image})` }}
        />
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>{activeSlide.badge}</span>
          <h1 className={styles.heroTitle}>
            {activeSlide.title} <span className={styles.heroHighlight}>{activeSlide.highlight}</span>
          </h1>
          <p className={styles.heroSubtitle}>{activeSlide.subtitle}</p>

          <div className={styles.heroActions}>
            <Link to={activeSlide.ctaLink} className={styles.primaryCta}>
              {activeSlide.ctaText} →
            </Link>
            <Link to="/venues" className={styles.secondaryCta}>
              Browse All
            </Link>
          </div>
        </div>

        {/* Carousel Dots */}
        <div className={styles.dots}>
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.dot} ${idx === currentSlide ? styles.dotActive : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Popular Sports Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Popular Sports</h2>
            <p className={styles.sectionSubtitle}>Select a sport to discover top venues near you</p>
          </div>
          <Link to="/venues" className={styles.viewAllLink}>
            View All Sports →
          </Link>
        </div>

        <div className={styles.sportsGrid}>
          {SPORTS_LIST.map((sport) => (
            <div
              key={sport.name}
              className={styles.sportCard}
              onClick={() => navigate(`/venues?sport=${encodeURIComponent(sport.name)}`)}
            >
              <div className={styles.sportIcon}>{sport.icon}</div>
              <div className={styles.sportName}>{sport.name}</div>
              <div className={styles.sportCount}>{sport.count}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Venues Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Top Rated Venues</h2>
            <p className={styles.sectionSubtitle}>Hand-picked, highly rated sports arenas with top amenities</p>
          </div>
          <Link to="/venues" className={styles.viewAllLink}>
            Explore All Venues →
          </Link>
        </div>

        {isLoading ? (
          <div className={styles.venuesGrid}>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  height: 340,
                  background: 'var(--color-surface)',
                  borderRadius: '16px',
                  opacity: 0.6,
                }}
              />
            ))}
          </div>
        ) : (
          <div className={styles.venuesGrid}>
            {featuredVenues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose QuickCourt Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Why QuickCourt?</h2>
            <p className={styles.sectionSubtitle}>Designed for players, built for effortless booking</p>
          </div>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>⚡</div>
            <h3 className={styles.featureTitle}>Instant Booking</h3>
            <p className={styles.featureDesc}>
              No waiting for phone calls or confirmation emails. Lock in your time slot instantly in real time.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🛡️</div>
            <h3 className={styles.featureTitle}>100% Verified Venues</h3>
            <p className={styles.featureDesc}>
              Every court listed on QuickCourt undergoes quality verification for mats, lighting, and safety.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🏷️</div>
            <h3 className={styles.featureTitle}>Best Rates Guaranteed</h3>
            <p className={styles.featureDesc}>
              Direct owner pricing with zero hidden fees. Enjoy transparent hourly rates and regular discounts.
            </p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>🔄</div>
            <h3 className={styles.featureTitle}>Flexible Cancellation</h3>
            <p className={styles.featureDesc}>
              Plans changed? Cancel up to 24 hours before your booking slot for instant credits or refunds.
            </p>
          </div>
        </div>
      </section>

      {/* Facility Owner CTA Banner */}
      <section className={styles.ownerBanner}>
        <div className={styles.ownerContent}>
          <h2 className={styles.ownerTitle}>Are you a Sports Facility Owner?</h2>
          <p className={styles.ownerDesc}>
            Join 200+ facility owners on QuickCourt. Manage courts, automate slot bookings, and boost your monthly revenue effortlessy.
          </p>
        </div>
        <Link to="/auth/register" className={styles.primaryCta}>
          Register Your Venue →
        </Link>
      </section>
    </div>
  );
}
