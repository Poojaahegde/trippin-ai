// TripPin AI — Place Extraction Engine
// Simulates AI-powered extraction from social text / travel content

import { Place, PlaceCategory, ExtractionResult } from './types';

// Category inference keywords
const CATEGORY_KEYWORDS: Record<PlaceCategory, string[]> = {
  Eat: ['restaurant', 'food', 'eat', 'dining', 'bistro', 'trattoria', 'taverna', 'market', 'brasserie', 'burger', 'pizza', 'ramen', 'sushi'],
  Coffee: ['cafe', 'café', 'coffee', 'espresso', 'bakery', 'pastry', 'brunch', 'patisserie'],
  Explore: ['museum', 'monument', 'tower', 'castle', 'palace', 'temple', 'church', 'cathedral', 'historic', 'quarter', 'district', 'factory', 'ruins'],
  Stay: ['hotel', 'hostel', 'airbnb', 'resort', 'villa', 'inn', 'guesthouse', 'lodge', 'stay'],
  Shop: ['market', 'shop', 'store', 'mall', 'boutique', 'flea', 'bazaar', 'souk'],
  Nightlife: ['bar', 'club', 'rooftop', 'lounge', 'pub', 'speakeasy', 'cocktail', 'nightclub'],
  Viewpoint: ['viewpoint', 'miradouro', 'belvedere', 'overlook', 'summit', 'hill', 'peak', 'panorama', 'observation'],
  Beach: ['beach', 'praia', 'playa', 'cove', 'bay', 'coast', 'shore', 'surf'],
  Activity: ['hike', 'trek', 'tour', 'kayak', 'dive', 'snorkel', 'yoga', 'class', 'workshop'],
};

// Known place database for coordinate lookup (demo subset)
const PLACE_COORDINATES: Record<string, { lat: number; lng: number; city: string; country: string }> = {
  'time out market': { lat: 38.7072, lng: -9.1469, city: 'Lisbon', country: 'Portugal' },
  'lx factory': { lat: 38.7031, lng: -9.1764, city: 'Lisbon', country: 'Portugal' },
  'belém tower': { lat: 38.6916, lng: -9.2160, city: 'Lisbon', country: 'Portugal' },
  'alfama': { lat: 38.7139, lng: -9.1334, city: 'Lisbon', country: 'Portugal' },
  'pastéis de belém': { lat: 38.6974, lng: -9.2037, city: 'Lisbon', country: 'Portugal' },
  'park bar': { lat: 38.7109, lng: -9.1449, city: 'Lisbon', country: 'Portugal' },
  'miradouro da graça': { lat: 38.7173, lng: -9.1329, city: 'Lisbon', country: 'Portugal' },
  'shibuya crossing': { lat: 35.6595, lng: 139.7004, city: 'Tokyo', country: 'Japan' },
  'tsukiji outer market': { lat: 35.6654, lng: 139.7706, city: 'Tokyo', country: 'Japan' },
  'senso-ji temple': { lat: 35.7148, lng: 139.7967, city: 'Tokyo', country: 'Japan' },
  'arashiyama bamboo grove': { lat: 35.0168, lng: 135.6724, city: 'Kyoto', country: 'Japan' },
  'fushimi inari': { lat: 34.9671, lng: 135.7727, city: 'Kyoto', country: 'Japan' },
  'nishiki market': { lat: 35.0050, lng: 135.7651, city: 'Kyoto', country: 'Japan' },
  'colosseum': { lat: 41.8902, lng: 12.4922, city: 'Rome', country: 'Italy' },
  'trastevere': { lat: 41.8891, lng: 12.4666, city: 'Rome', country: 'Italy' },
  'trevi fountain': { lat: 41.9009, lng: 12.4833, city: 'Rome', country: 'Italy' },
  'eiffel tower': { lat: 48.8584, lng: 2.2945, city: 'Paris', country: 'France' },
  'le marais': { lat: 48.8566, lng: 2.3533, city: 'Paris', country: 'France' },
  'montmartre': { lat: 48.8867, lng: 2.3431, city: 'Paris', country: 'France' },
  'la sagrada familia': { lat: 41.4036, lng: 2.1744, city: 'Barcelona', country: 'Spain' },
  'park güell': { lat: 41.4145, lng: 2.1527, city: 'Barcelona', country: 'Spain' },
  'la boqueria': { lat: 41.3818, lng: 2.1720, city: 'Barcelona', country: 'Spain' },
  'seminyak beach': { lat: -8.6883, lng: 115.1568, city: 'Bali', country: 'Indonesia' },
  'ubud monkey forest': { lat: -8.5186, lng: 115.2587, city: 'Bali', country: 'Indonesia' },
  'tanah lot': { lat: -8.6213, lng: 115.0869, city: 'Bali', country: 'Indonesia' },
};

function inferCategory(placeName: string, context: string): PlaceCategory {
  const combined = (placeName + ' ' + context).toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => combined.includes(kw))) {
      return category as PlaceCategory;
    }
  }
  return 'Explore'; // default fallback
}

function lookupCoordinates(placeName: string): {
  lat?: number; lng?: number; city: string; country: string
} {
  const key = placeName.toLowerCase().trim();
  const match = PLACE_COORDINATES[key];
  if (match) return match;

  // Try partial match
  for (const [knownKey, coords] of Object.entries(PLACE_COORDINATES)) {
    if (key.includes(knownKey) || knownKey.includes(key)) return coords;
  }

  // Fallback — place city/country unknown until geocoded
  return { city: 'Unknown', country: 'Unknown' };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function calculateConfidence(placeName: string): number {
  const key = placeName.toLowerCase().trim();
  if (PLACE_COORDINATES[key]) return 0.97;
  for (const knownKey of Object.keys(PLACE_COORDINATES)) {
    if (key.includes(knownKey) || knownKey.includes(key)) return 0.88;
  }
  // Unknown place — moderate confidence based on capitalization signal
  const isCapitalized = /^[A-Z]/.test(placeName.trim());
  return isCapitalized ? 0.72 : 0.55;
}

// Main extraction function — parses unstructured travel text
export function extractPlaces(inputText: string, sourceNote: string = 'Pasted text'): ExtractionResult {
  const places: Place[] = [];

  // Pattern 1: "Places in [City]: Place1, Place2, Place3"
  const listPattern = /(?:spots?|places?|things to do|must.?visit|best|hidden gems?|top).*?(?:in|at|around)\s+([A-Z][\w\s]+?)[:—–]([^.!?]+)/gi;
  let match;

  while ((match = listPattern.exec(inputText)) !== null) {
    const cityHint = match[1].trim();
    const placeList = match[2].split(/,|and|&/).map((p) => p.trim()).filter((p) => p.length > 2);

    for (const placeName of placeList) {
      const cleaned = placeName.replace(/[^\w\s'éàèùâêîôûäëïöüç-]/gi, '').trim();
      if (cleaned.length < 3) continue;

      const coords = lookupCoordinates(cleaned);
      const category = inferCategory(cleaned, inputText);
      const confidence = calculateConfidence(cleaned);

      places.push({
        id: generateId(),
        name: cleaned,
        category,
        city: coords.city !== 'Unknown' ? coords.city : cityHint,
        country: coords.country !== 'Unknown' ? coords.country : '',
        confidence,
        source: sourceNote,
        lat: coords.lat,
        lng: coords.lng,
        addedAt: new Date().toISOString(),
      });
    }
  }

  // Pattern 2: Standalone capitalized place names with context keywords
  const standalonePattern = /(?:visit|try|check out|stop by|head to|go to|eat at|stay at|explore)\s+([A-Z][\w\s'\-éàèùâêîôûäëïöüç]{2,40})/g;

  while ((match = standalonePattern.exec(inputText)) !== null) {
    const placeName = match[1].trim().replace(/[^\w\s'éàèùâêîôûäëïöüç-]/gi, '');
    if (placeName.length < 3 || places.some((p) => p.name.toLowerCase() === placeName.toLowerCase())) continue;

    const coords = lookupCoordinates(placeName);
    const category = inferCategory(placeName, inputText);
    const confidence = calculateConfidence(placeName);

    places.push({
      id: generateId(),
      name: placeName,
      category,
      city: coords.city,
      country: coords.country,
      confidence,
      source: sourceNote,
      lat: coords.lat,
      lng: coords.lng,
      addedAt: new Date().toISOString(),
    });
  }

  // Deduplicate by lowercase name
  const seen = new Set<string>();
  const deduped = places.filter((p) => {
    const key = p.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return {
    places: deduped,
    sourceText: inputText.substring(0, 200),
    extractedAt: new Date().toISOString(),
    totalFound: deduped.length,
  };
}
