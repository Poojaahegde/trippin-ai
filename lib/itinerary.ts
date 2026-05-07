// TripPin AI — Itinerary Generator
// Generates a day-by-day travel plan from a collection of places

import { Place, Collection, Itinerary, ItineraryDay } from './types';

const TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;
type TimeSlot = typeof TIME_SLOTS[number];

// Category to preferred time-of-day mapping
const CATEGORY_TIME_PREFERENCE: Record<string, TimeSlot> = {
  Coffee: 'morning',
  Eat: 'afternoon',
  Explore: 'morning',
  Viewpoint: 'morning',
  Beach: 'afternoon',
  Shop: 'afternoon',
  Activity: 'morning',
  Stay: 'evening',
  Nightlife: 'evening',
};

function groupByCity(places: Place[]): Record<string, Place[]> {
  return places.reduce((acc, place) => {
    const city = place.city || 'Unknown';
    if (!acc[city]) acc[city] = [];
    acc[city].push(place);
    return acc;
  }, {} as Record<string, Place[]>);
}

function assignTimeSlot(place: Place): TimeSlot {
  return CATEGORY_TIME_PREFERENCE[place.category] || 'afternoon';
}

function generateDayNote(places: Place[]): string {
  const categories = [...new Set(places.map((p) => p.category))];
  const city = places[0]?.city || 'the area';

  if (categories.includes('Coffee') && categories.includes('Explore')) {
    return `Start with coffee, then explore the highlights of ${city}. A walkable, low-effort day.`;
  }
  if (categories.includes('Beach')) {
    return `A beach-forward day in ${city}. Spend the afternoon on the water, then wind down for dinner.`;
  }
  if (categories.includes('Nightlife')) {
    return `Mix cultural sights in the day with ${city}'s nightlife in the evening.`;
  }
  if (categories.includes('Eat') && categories.includes('Shop')) {
    return `Food and shopping day in ${city} — great for wandering through local markets and eateries.`;
  }
  return `A curated day exploring the best of ${city}.`;
}

export function generateItinerary(
  collection: Collection,
  allPlaces: Place[],
  numDays: number
): Itinerary {
  // Get only places in this collection
  const collectionPlaces = allPlaces.filter((p) => collection.placeIds.includes(p.id));

  // Group by city for logical routing
  const byCity = groupByCity(collectionPlaces);
  const cities = Object.keys(byCity);

  // Distribute cities across days
  const daysPerCity = Math.ceil(numDays / Math.max(cities.length, 1));
  const days: ItineraryDay[] = [];

  let dayIndex = 1;

  for (const city of cities) {
    const cityPlaces = byCity[city];
    // Spread city places across allocated days
    const chunks = chunkArray(cityPlaces, Math.ceil(cityPlaces.length / daysPerCity));

    for (const chunk of chunks) {
      if (dayIndex > numDays) break;

      const morning: Place[] = [];
      const afternoon: Place[] = [];
      const evening: Place[] = [];

      for (const place of chunk) {
        const slot = assignTimeSlot(place);
        if (slot === 'morning') morning.push(place);
        else if (slot === 'afternoon') afternoon.push(place);
        else evening.push(place);
      }

      days.push({
        day: dayIndex,
        morning,
        afternoon,
        evening,
        notes: generateDayNote(chunk),
      });

      dayIndex++;
    }
  }

  // Fill remaining days if needed
  while (days.length < numDays) {
    days.push({
      day: days.length + 1,
      morning: [],
      afternoon: [],
      evening: [],
      notes: 'Free day — explore at your own pace.',
    });
  }

  return {
    id: Math.random().toString(36).substring(2, 10),
    collectionId: collection.id,
    collectionName: collection.name,
    totalDays: numDays,
    days: days.slice(0, numDays),
    generatedAt: new Date().toISOString(),
  };
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}
