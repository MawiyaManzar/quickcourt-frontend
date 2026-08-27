import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { venueService } from './services/venueService';
import type { Venue, SportType, VenueType } from './types';
import VenueCard from './components/VenueCard';
import VenueFilters from './components/VenueFilters';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import styles from './VenuesPage.module.css';

export default function VenuesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialCity = searchParams.get('city') || '';
  const initialSport = searchParams.get('sport');
  const initialSportsList: SportType[] = initialSport ? [initialSport as SportType] : [];
  const initialPage = Number(searchParams.get('page')) || 1;

  const [query, setQuery] = useState(initialQuery);
  const [selectedSports, setSelectedSports] = useState<SportType[]>(initialSportsList);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [venueType, setVenueType] = useState<VenueType | 'ALL'>('ALL');
  const [minRating, setMinRating] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state when URL params change (e.g. from top header search or city selector)
  useEffect(() => {
    const qFromUrl = searchParams.get('q') || '';
    const sportFromUrl = searchParams.get('sport');
    if (qFromUrl !== query) setQuery(qFromUrl);
    if (sportFromUrl && !selectedSports.includes(sportFromUrl as SportType)) {
      setSelectedSports([sportFromUrl as SportType]);
    }
  }, [searchParams]);

  // Fetch venues when filter dependencies change
  useEffect(() => {
    setIsLoading(true);

    const cityParam = searchParams.get('city') || initialCity;

    venueService
      .fetchVenues({
        q: query,
        city: cityParam,
        sports: selectedSports,
        maxPrice,
        venueType,
        minRating,
        page,
        limit: 6,
      })
      .then((res) => {
        setVenues(res.venues);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setIsLoading(false);
      });
  }, [query, selectedSports, maxPrice, venueType, minRating, page, searchParams]);

  // Handle clearing all filters
  const handleClearAll = () => {
    setQuery('');
    setSelectedSports([]);
    setMaxPrice(3000);
    setVenueType('ALL');
    setMinRating(0);
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className={styles.container}>
      {/* Header Search Banner */}
      <div className={styles.searchHeader}>
        <div className={styles.titleRow}>
          <div>
            <h1 className={styles.pageTitle}>Sports Venues</h1>
            <p className={styles.resultCount}>
              {isLoading ? 'Searching...' : `Showing ${total} available venue${total !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search venue by name, sport, or area (e.g. Apex, Badminton, Indiranagar)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            className={styles.searchInput}
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setPage(1); }}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.contentLayout}>
        {/* Filters Sidebar */}
        <VenueFilters
          selectedSports={selectedSports}
          onSportsChange={(sports) => { setSelectedSports(sports); setPage(1); }}
          maxPrice={maxPrice}
          onPriceChange={(price) => { setMaxPrice(price); setPage(1); }}
          venueType={venueType}
          onVenueTypeChange={(type) => { setVenueType(type); setPage(1); }}
          minRating={minRating}
          onRatingChange={(rating) => { setMinRating(rating); setPage(1); }}
          onClearAll={handleClearAll}
        />

        {/* Venues Grid / Skeletons / Empty State */}
        <div className={styles.mainContent}>
          {isLoading ? (
            <div className={styles.venuesGrid}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SkeletonCard key={n} />
              ))}
            </div>
          ) : venues.length === 0 ? (
            <EmptyState
              icon="🏟️"
              title="No Venues Found"
              description="We couldn't find any sports venues matching your exact filter criteria. Try adjusting your search query, price range, or clearing filters."
              action={
                <Button onClick={handleClearAll}>
                  Reset All Filters
                </Button>
              }
            />
          ) : (
            <>
              <div className={styles.venuesGrid}>
                {venues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>

              {/* Numbered Pagination Controls */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      className={`${styles.pageBtn} ${pageNum === page ? styles.pageActive : ''}`}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    className={styles.pageBtn}
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
