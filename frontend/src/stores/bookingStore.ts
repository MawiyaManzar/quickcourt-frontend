import { create } from 'zustand';

// ---- Sport & Court selection ----
export interface BookingCourt {
  id: string;
  name: string;
  sportType: string;
  pricePerHour: number;
  openingTime: string;
  closingTime: string;
}

// ---- Booking flow state (multi-step wizard) ----
export interface BookingState {
  venueId: string | null;
  venueName: string | null;
  sport: string | null;
  court: BookingCourt | null;
  date: string | null;           // ISO date string YYYY-MM-DD
  startTime: string | null;      // "HH:MM" 24-hr
  endTime: string | null;        // "HH:MM" 24-hr
  totalAmount: number;
  currentStep: number;           // 1–5

  // Setters
  setVenue: (id: string, name: string) => void;
  setSport: (sport: string) => void;
  setCourt: (court: BookingCourt) => void;
  setDateTime: (date: string, startTime: string, endTime: string) => void;
  setTotalAmount: (amount: number) => void;
  setStep: (step: number) => void;
  reset: () => void;
}

const initialState = {
  venueId: null,
  venueName: null,
  sport: null,
  court: null,
  date: null,
  startTime: null,
  endTime: null,
  totalAmount: 0,
  currentStep: 1,
};

export const useBookingStore = create<BookingState>()((set) => ({
  ...initialState,

  setVenue: (id, name) => set({ venueId: id, venueName: name }),
  setSport: (sport) => set({ sport, court: null, date: null, startTime: null, endTime: null }),
  setCourt: (court) => set({ court, date: null, startTime: null, endTime: null }),
  setDateTime: (date, startTime, endTime) => set({ date, startTime, endTime }),
  setTotalAmount: (totalAmount) => set({ totalAmount }),
  setStep: (currentStep) => set({ currentStep }),
  reset: () => set(initialState),
}));
