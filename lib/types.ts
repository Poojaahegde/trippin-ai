// TripPin AI — Core TypeScript Types

export type PlaceCategory =
  | 'Eat'
  | 'Coffee'
  | 'Explore'
  | 'Stay'
  | 'Shop'
  | 'Nightlife'
  | 'Viewpoint'
  | 'Beach'
  | 'Activity';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  city: string;
  country: string;
  confidence: number; // 0–1, extraction confidence score
  source: string;     // URL or text snippet this was extracted from
  notes?: string;
  lat?: number;
  lng?: number;
  addedAt: string;    // ISO date string
}

export interface Collection {
  id: string;
  name: string;         // e.g. "Lisbon 2026", "Tokyo Food Spots"
  emoji?: string;       // optional decorative emoji
  description?: string;
  placeIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ItineraryDay {
  day: number;
  date?: string;
  morning: Place[];
  afternoon: Place[];
  evening: Place[];
  notes: string;        // reasoning for the grouping
}

export interface Itinerary {
  id: string;
  collectionId: string;
  collectionName: string;
  totalDays: number;
  days: ItineraryDay[];
  generatedAt: string;
}

export interface ExtractionResult {
  places: Place[];
  sourceText: string;
  extractedAt: string;
  totalFound: number;
}

export interface AnalyticsSnapshot {
  totalPlaces: number;
  totalCollections: number;
  totalItineraries: number;
  placesPerCategory: Record<PlaceCategory, number>;
  topCities: { city: string; count: number }[];
  placesPerSource: { source: string; count: number }[];
  activationAchieved: boolean;   // has user saved >= 3 places?
  itineraryGenerationRate: number; // % sessions that generated an itinerary
}

// Seed / demo data type
export interface SeedData {
  places: Place[];
  collections: Collection[];
}
