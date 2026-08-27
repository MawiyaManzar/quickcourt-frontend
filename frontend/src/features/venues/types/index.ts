export type SportType = 'Badminton' | 'Tennis' | 'Football' | 'Cricket' | 'Basketball' | 'Table Tennis';
export type VenueType = 'INDOOR' | 'OUTDOOR' | 'BOTH';

export interface Court {
  id: string;
  name: string;
  sport: SportType;
  pricePerHour: number;
  openingTime: string; // e.g. "06:00"
  closingTime: string; // e.g. "23:00"
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Venue {
  id: string;
  name: string;
  tagline?: string;
  description: string;
  city: string;
  area?: string;
  fullAddress?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  sports: SportType[];
  venueType?: VenueType;
  startingPrice: number;
  rating?: number;
  reviewCount?: number;
  images: string[];
  amenities: Amenity[] | string[];
  courts: Court[];
  reviews?: Review[];
  contactPhone?: string;
  contactEmail?: string;
  isFeatured?: boolean;
}

export interface VenueFilterParams {
  q?: string;
  city?: string;
  sports?: SportType[];
  venueType?: VenueType | 'ALL';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface VenueListResponse {
  venues: Venue[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
