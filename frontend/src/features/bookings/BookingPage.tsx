import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import StepperWizard, { type StepItem } from '../../components/ui/StepperWizard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { venueService } from '../venues/services/venueService';
import { bookingService } from './services/bookingService';
import type { Venue, Court, SportType } from '../venues/types';
import type { TimeSlot, SmartPick, BookingRecord } from './types';
import SmartPicksBanner from './components/SmartPicksBanner';
import SlotGrid from './components/SlotGrid';
import styles from './BookingPage.module.css';

const PENDING_BOOKING_KEY = 'qc_pending_booking';

const WIZARD_STEPS: StepItem[] = [
  { id: 1, label: 'Sport' },
  { id: 2, label: 'Court' },
  { id: 3, label: 'Date & Time' },
  { id: 4, label: 'Review' },
  { id: 5, label: 'Payment' },
];

export default function BookingPage() {
  const { venueId } = useParams<{ venueId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const initialCourtId = searchParams.get('courtId');

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoadingVenue, setIsLoadingVenue] = useState<boolean>(true);

  // Wizard Selections
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [smartPicks, setSmartPicks] = useState<SmartPick[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [selectedSlotIds, setSelectedSlotIds] = useState<string[]>([]);

  // Payment State
  const [paymentMethod] = useState<'CARD' | 'UPI' | 'NETBANKING'>('CARD');
  const [cardNumber, setCardNumber] = useState('4532 8912 3456 7890');
  const [cardName, setCardName] = useState('John Player');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // Helper: save pending booking state for guest users
  const savePendingBooking = () => {
    try {
      sessionStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify({
        venueId,
        courtId: selectedCourt?.id,
        sport: selectedSport,
        date: selectedDate,
        slotIds: selectedSlotIds,
        step: currentStep,
      }));
    } catch { /* ignore */ }
  };

  // Helper: require auth — if guest, save state & redirect to login
  const requireAuth = (): boolean => {
    if (isAuthenticated) return true;
    savePendingBooking();
    toast('Please log in or sign up to complete your court reservation', { icon: '🔒' });
    navigate(`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
    return false;
  };

  // Load venue details on mount
  useEffect(() => {
    if (!venueId) return;
    setIsLoadingVenue(true);
    venueService.fetchVenueById(venueId).then((v) => {
      setVenue(v);
      setIsLoadingVenue(false);

      if (v) {
        // Auto-select initial sport
        if (v.sports.length > 0) setSelectedSport(v.sports[0]);

        // Auto-select initial court if provided in query param
        if (initialCourtId) {
          const foundCourt = v.courts.find((c) => c.id === initialCourtId);
          if (foundCourt) {
            setSelectedCourt(foundCourt);
            setSelectedSport(foundCourt.sport);
            setCurrentStep(3); // Jump to Date & Time slot selection
          }
        }

        // Restore pending booking if user just logged in
        try {
          const raw = sessionStorage.getItem(PENDING_BOOKING_KEY);
          if (raw && isAuthenticated) {
            const pending = JSON.parse(raw);
            if (pending.venueId === venueId) {
              if (pending.courtId) {
                const court = v.courts.find((c) => c.id === pending.courtId);
                if (court) {
                  setSelectedCourt(court);
                  setSelectedSport(court.sport);
                }
              }
              if (pending.date) setSelectedDate(pending.date);
              if (pending.slotIds) setSelectedSlotIds(pending.slotIds);
              if (pending.step) setCurrentStep(Math.min(pending.step, 4));
              sessionStorage.removeItem(PENDING_BOOKING_KEY);
              toast.success('Your booking selections have been restored!');
            }
          }
        } catch { /* ignore */ }
      }
    });
  }, [venueId, initialCourtId, isAuthenticated]);

  // Load slots & smart picks when court or date changes
  useEffect(() => {
    if (!selectedCourt) return;
    setIsLoadingSlots(true);

    Promise.all([
      bookingService.getCourtAvailability(selectedCourt.id, selectedDate),
      bookingService.getSmartPicks(selectedCourt.id, selectedDate),
    ]).then(([availSlots, picks]) => {
      setSlots(availSlots);
      setSmartPicks(picks);
      setIsLoadingSlots(false);
    });
  }, [selectedCourt, selectedDate]);

  // Filter courts by selected sport
  const filteredCourts = venue?.courts.filter(
    (c) => !selectedSport || c.sport === selectedSport
  ) || [];

  // Selected slots math
  const chosenSlots = slots.filter((s) => selectedSlotIds.includes(s.id));
  const totalPrice = chosenSlots.reduce((sum, s) => sum + s.price, 0);

  const handleToggleSlot = (slot: TimeSlot) => {
    if (!slot || !slot.id) return;
    if (selectedSlotIds.includes(slot.id)) {
      setSelectedSlotIds(selectedSlotIds.filter((id) => id !== slot.id));
    } else {
      setSelectedSlotIds([slot.id]); // Select single slot
    }
  };

  const handleSelectSmartPick = (pick: SmartPick) => {
    const matchingSlot = slots.find((s) => s.startTime === pick.startTime);
    if (matchingSlot && matchingSlot.status === 'AVAILABLE') {
      setSelectedSlotIds([matchingSlot.id]);
      toast.success(`Selected Smart Pick: ${pick.label}`);
    } else {
      toast.error('The recommended slot is currently unavailable');
    }
  };

  // Payment submit
  const handlePaymentSubmit = async () => {
    if (!selectedCourt || chosenSlots.length === 0) {
      toast.error('Please select at least one valid slot');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Booking (Double-booking protected)
      const firstSlot = chosenSlots[0];
      const lastSlot = chosenSlots[chosenSlots.length - 1];

      const newBooking = await bookingService.createBooking({
        courtId: selectedCourt.id,
        date: selectedDate,
        startTime: firstSlot.startTime,
        endTime: lastSlot.endTime,
      });

      // 2. Process Simulated Payment
      const paidBooking = await bookingService.processPayment({
        bookingId: newBooking.id,
        paymentMethod,
        cardNumber,
        cardName,
      });

      setConfirmedBooking(paidBooking);
      setCurrentStep(6); // Step 6: Confirmed
      toast.success('Booking confirmed successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingVenue) {
    return (
      <div className={styles.container}>
        <div style={{ height: 400, background: 'var(--color-surface)', borderRadius: '16px', opacity: 0.6 }} />
      </div>
    );
  }

  if (!venue) {
    return (
      <div className={styles.container} style={{ textAlign: 'center', padding: '64px 0' }}>
        <h2 style={{ color: '#ffffff' }}>Venue Not Found</h2>
        <Link to="/venues" style={{ color: 'var(--color-primary)', marginTop: '16px', display: 'inline-block' }}>
          ← Return to Venues
        </Link>
      </div>
    );
  }

  // Confirmation View (Step 6)
  if (currentStep === 6 && confirmedBooking) {
    return (
      <div className={styles.container}>
        <div className={styles.confirmCard}>
          <div className={styles.checkCircle}>✓</div>
          <h2 className={styles.confirmTitle}>Booking Confirmed!</h2>
          <span className={styles.refBadge}>Reference #{confirmedBooking.id}</span>

          <p className={styles.subTitle}>
            Your slot for <strong>{selectedCourt?.name || confirmedBooking.courtName}</strong> at <strong>{venue.name}</strong> has been locked in.
          </p>

          <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px', textAlign: 'left', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Date:</span>
              <strong style={{ color: '#ffffff' }}>{selectedDate}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Time Slot:</span>
              <strong style={{ color: 'var(--color-primary)' }}>{chosenSlots[0]?.startTime || '18:00'} – {chosenSlots[chosenSlots.length - 1]?.endTime || '19:00'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Total Amount Paid:</span>
              <strong style={{ color: '#ffffff' }}>₹{totalPrice || 500}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <Button onClick={() => navigate('/bookings')}>
              View My Bookings
            </Button>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h1 className={styles.venueTitle}>Book Court at {venue.name}</h1>
        <p className={styles.subTitle}>📍 {venue.area || venue.address || venue.city}</p>
      </div>

      {/* Stepper Wizard Header */}
      <StepperWizard
        steps={WIZARD_STEPS}
        currentStep={currentStep}
        onStepClick={(stepId) => setCurrentStep(stepId)}
      />

      {/* Wizard Card Body */}
      <div className={styles.stepContent}>
        {/* Step 1: Select Sport */}
        {currentStep === 1 && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Step 1: Select Sport</h2>
              <span className={styles.stepDesc}>Choose the sport you want to play</span>
            </div>

            <div className={styles.optionsGrid}>
              {venue.sports.map((sport) => {
                const isActive = selectedSport === sport;
                const icon = sport === 'Badminton' ? '🏸' : sport === 'Tennis' ? '🎾' : sport === 'Football' ? '⚽' : sport === 'Cricket' ? '🏏' : sport === 'Basketball' ? '🏀' : '🏓';

                return (
                  <div
                    key={sport}
                    className={`${styles.optionCard} ${isActive ? styles.optionCardActive : ''}`}
                    onClick={() => {
                      setSelectedSport(sport);
                      setSelectedCourt(null); // reset selected court
                    }}
                  >
                    <div className={styles.optionIcon}>{icon}</div>
                    <div>
                      <div className={styles.optionText}>{sport}</div>
                      <div className={styles.optionMeta}>Tap to select</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.actionRow}>
              <span />
              <Button disabled={!selectedSport} onClick={() => setCurrentStep(2)}>
                Next: Select Court →
              </Button>
            </div>
          </>
        )}

        {/* Step 2: Select Court */}
        {currentStep === 2 && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Step 2: Select Court for {selectedSport}</h2>
              <span className={styles.stepDesc}>Select your preferred court or field</span>
            </div>

            {filteredCourts.length === 0 ? (
              <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px' }}>
                No active courts available for {selectedSport}. Please select another sport.
              </div>
            ) : (
              <div className={styles.optionsGrid}>
                {filteredCourts.map((court) => {
                  const isActive = selectedCourt?.id === court.id;
                  return (
                    <div
                      key={court.id}
                      className={`${styles.optionCard} ${isActive ? styles.optionCardActive : ''}`}
                      onClick={() => setSelectedCourt(court)}
                    >
                      <div className={styles.optionIcon}>🏟️</div>
                      <div>
                        <div className={styles.optionText}>{court.name}</div>
                        <div className={styles.optionMeta}>
                          ₹{court.pricePerHour}/hr • {court.openingTime}–{court.closingTime}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.actionRow}>
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                ← Back
              </Button>
              <Button disabled={!selectedCourt} onClick={() => setCurrentStep(3)}>
                Next: Select Date & Time →
              </Button>
            </div>
          </>
        )}

        {/* Step 3: Date & Slot Grid */}
        {currentStep === 3 && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Step 3: Select Date & Time Slot</h2>
              <span className={styles.stepDesc}>Court: {selectedCourt?.name}</span>
            </div>

            {/* Date Selector */}
            <div className={styles.dateRow}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Booking Date:</label>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSlotIds([]);
                }}
                className={styles.dateInput}
              />
            </div>

            {/* Smart Picks Recommendation Banner */}
            <SmartPicksBanner picks={smartPicks} onSelectPick={handleSelectSmartPick} />

            {/* Time Slot Grid */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                Available Hourly Slots:
              </h3>
              {isLoadingSlots ? (
                <div style={{ height: 160, background: 'rgba(255,255,255,0.03)', borderRadius: '12px', opacity: 0.6 }} />
              ) : (
                <SlotGrid
                  slots={slots}
                  selectedSlotIds={selectedSlotIds}
                  onToggleSlot={handleToggleSlot}
                />
              )}
            </div>

            {/* Selected Summary Bar */}
            {chosenSlots.length > 0 && (
              <div style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.3)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Selected ({chosenSlots.length} hour slot)</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>
                    {chosenSlots[0]?.startTime} – {chosenSlots[chosenSlots.length - 1]?.endTime}
                  </div>
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  Total: ₹{totalPrice}
                </div>
              </div>
            )}

            <div className={styles.actionRow}>
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                ← Back
              </Button>
              <Button disabled={chosenSlots.length === 0} onClick={() => setCurrentStep(4)}>
                Next: Review Booking →
              </Button>
            </div>
          </>
        )}

        {/* Step 4: Review Summary */}
        {currentStep === 4 && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Step 4: Review Booking Summary</h2>
              <span className={styles.stepDesc}>Verify details before proceeding to payment</span>
            </div>

            <div className={styles.summaryTable}>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Venue:</span>
                <span className={styles.summaryVal}>{venue.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Sport:</span>
                <span className={styles.summaryVal}>{selectedSport}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Court:</span>
                <span className={styles.summaryVal}>{selectedCourt?.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Date:</span>
                <span className={styles.summaryVal}>{selectedDate}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Time Slot:</span>
                <span className={styles.summaryVal}>
                  {chosenSlots[0]?.startTime} – {chosenSlots[chosenSlots.length - 1]?.endTime}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Duration:</span>
                <span className={styles.summaryVal}>{chosenSlots.length} Hour(s)</span>
              </div>

              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span className={styles.totalLabel}>Total Payable Amount:</span>
                <span className={styles.totalVal}>₹{totalPrice}</span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <Button variant="outline" onClick={() => setCurrentStep(3)}>
                ← Back
              </Button>
              <Button onClick={() => { if (requireAuth()) setCurrentStep(5); }}>
                Proceed to Payment →
              </Button>
            </div>
          </>
        )}

        {/* Step 5: Payment Form */}
        {currentStep === 5 && (
          <>
            <div className={styles.stepHeader}>
              <h2 className={styles.stepTitle}>Step 5: Simulated Payment</h2>
              <span className={styles.stepDesc}>Total Amount: ₹{totalPrice}</span>
            </div>

            <div className={styles.paymentNotice}>
              🔒 Instant Confirmation. Double-booking protected. This is a simulated checkout demo.
            </div>

            {/* Payment Form according to modern web guidance */}
            <form onSubmit={(e) => { e.preventDefault(); if (requireAuth()) handlePaymentSubmit(); }} className={styles.cardForm}>
              <Input
                label="Cardholder Name"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Name as on card"
                autoComplete="cc-name"
                required
              />

              <Input
                label="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="16-digit card number"
                autoComplete="cc-number"
                inputMode="numeric"
                maxLength={19}
                required
              />

              <div className={styles.cardRow}>
                <div>
                  <span id="exp-hint" className={styles.hintText}>Format: MM/YY</span>
                  <Input
                    label="Expiry Date"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    autoComplete="cc-exp"
                    aria-describedby="exp-hint"
                    maxLength={5}
                    required
                  />
                </div>

                <Input
                  label="CVV / CSC"
                  type="password"
                  value={cardCvv}
                  onChange={(e) => setCardCvv(e.target.value)}
                  placeholder="3 digits"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  maxLength={4}
                  required
                />
              </div>

              <div className={styles.actionRow} style={{ marginTop: '16px' }}>
                <Button variant="outline" type="button" onClick={() => setCurrentStep(4)} disabled={isSubmitting}>
                  ← Back
                </Button>
                <Button type="submit" size="lg" isLoading={isSubmitting}>
                  Pay ₹{totalPrice} & Confirm Booking
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
