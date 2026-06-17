export interface Excursion {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  departureTime: string;
  returnTime: string;
  departurePoint: string;
  maxPassengers: number;
  priceAdult: number;
  priceChild: number;
  priceAdultHighSeason?: number;
  priceChildHighSeason?: number;
  pricePrivate?: number;
  included: string[];
  notIncluded: string[];
  highlights: string[];
  // English content
  subtitleEn?: string;
  descriptionEn?: string;
  highlightsEn?: string[];
  includedEn?: string[];
  notIncludedEn?: string[];
  durationEn?: string;
  images: string[];
  youtubeId?: string;
  badge?: string;
  badgeEn?: string;
  popular?: boolean;
}

export interface Reservation {
  id: string;
  excursionId: string;
  excursionTitle: string;
  date: string;
  adults: number;
  children: number;
  totalPrice: number;
  depositAmount: number;
  isPaid: boolean;
  isConfirmed: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  stripeSessionId?: string;
  createdAt: string;
  notes?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  platform: "google" | "tripadvisor";
  avatar?: string;
}

export interface Availability {
  date: string;
  excursionId: string;
  totalSpots: number;
  bookedSpots: number;
  isBlocked: boolean;
}
