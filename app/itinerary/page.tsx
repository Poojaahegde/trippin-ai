'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Collection, Itinerary, Place } from '../../lib/types';
import { getCollections, getPlaces, saveItinerary, addPlaces, saveCollections } from '../../lib/storage';
import { generateItinerary } from '../../lib/itinerary';
import { SEED_PLACES } from '../../data/seed-places';
import { SEED_COLLECTIONS } from '../../data/seed-collections';

const CATEGORY_COLORS: Record<string, string> = {
  Eat: 'bg-orange-100 text-orange-700 border-orange-200',
  Coffee: 'bg-amber-100 text-amber-700 border-amber-200',
  Explore: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Stay: 'bg-violet-100 text-violet-700 border-violet-200',
  Shop: 'bg-pink-100 text-pink-700 border-pink-200',
  Nightlife: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Viewpoint: 'bg-sky-100 text-sky-700 border-sky-200',
  Beach: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  Activity: 'bg-lime-100 text-lime-700 border-lime-200',
};

const TIME_ICONS: Record<string, string> = {
  morning: '🌅',
  afternoon: '☀️',
  evening: '🌙',
};

export default function ItineraryPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState('');
  const [numDays, setNumDays] = useState(3);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let saved = getPlaces();
    let cols = getCollections();
    if (saved.length === 0) {
      saved = addPlaces(SEED_PLACES);
      saveCollections(SEED_COLLECTIONS);
      cols = SEED_COLLECTIONS;
    }
    setPlaces(saved);
    setCollections(cols);
    if (cols.length > 0) setSelectedCollectionId(cols[0].id);
  }, []);

  function handleGenerate() {
    const collection = collections.find((c) => c.id === selectedCollectionId);
    if (!collection) return;
    setIsGenerating(true);

    setTimeout(() => {
      const result = generateItinerary(collection, places, numDays);
      setItinerary(result);
      saveItinerary(result);
      setIsGenerating(false);
    }, 900);
  }

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);
  const collectionPlaceCount = selectedCollection?.placeIds.length || 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">...</span>
            <span className="font-bold text-slate-900">TripPin AI</span>
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-600 hover:text-sky-600">Dashboard</Link>
            <Link href="/map" className="text-slate-600 hover:text-sky-600">Map</Link>
            <Link href="/collections" className="text-slate-600 hover:text-sky-600">Collections</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Itinerary Generator</h1>
          <p className="text-slate-500">Select a trip collection and number of days to generate a day-by-day plan.</p>
        </div>

        {/* Generator controls */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 mb-8">
          <div className="grid sm:grid-cols-3 gap-4 mb-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Trip Collection</label>
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
              >
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji || ''} {c.name} ({c.placeIds.length} places)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Number of Days</label>
              <input
                type="number"
                min={1}
                max={14}
                value={numDays}
                onChange={(e) => setNumDays(Math.max(1, Math.min(14, Number(e.target.value))))}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
              />
            </div>
          </div>

          {selectedCollection && (
            <p className="text-sm text-slate-500 mb-4">
              Planning {numDays} days with {collectionPlaceCount} places across{' '}
              {[...new Set(places.filter((p) => selectedCollection.placeIds.includes(p.id)).map((p) => p.city))].join(', ')}.
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!selectedCollectionId || collectionPlaceCount === 0 || isGenerating}
            className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </div>

        {/* Itinerary output */}
        {isGenerating && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        )}

        {itinerary && !isGenerating && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {selectedCollection?.emoji} {itinerary.collectionName} — {itinerary.totalDays}-Day Plan
              </h2>
              <span className="text-xs text-slate-400">
                Generated {new Date(itinerary.generatedAt).toLocaleDateString()}
              </span>
            </div>

            {itinerary.days.map((day) => (
              <div key={day.day} className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
                <div className="bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-4">
                  <h3 className="font-bold text-white text-lg">Day {day.day}</h3>
                  {day.notes && <p className="text-sky-100 text-sm mt-0.5">{day.notes}</p>}
                </div>
                <div className="p-6 grid sm:grid-cols-3 gap-6">
                  {(['morning', 'afternoon', 'evening'] as const).map((slot) => {
                    const slotPlaces = day[slot];
                    return (
                      <div key={slot}>
                        <p className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
                          {TIME_ICONS[slot]} {slot.charAt(0).toUpperCase() + slot.slice(1)}
                        </p>
                        {slotPlaces.length === 0 ? (
                          <p className="text-xs text-slate-300 italic">Free time</p>
                        ) : (
                          <div className="space-y-2">
                            {slotPlaces.map((p) => (
                              <div key={p.id} className={"rounded-xl p-3 border text-sm " + (CATEGORY_COLORS[p.category] || 'bg-slate-50 border-slate-100')}>
                                <p className="font-medium">{p.name}</p>
                                <p className="text-xs opacity-70 mt-0.5">{p.city}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-5 text-sm text-sky-700">
              <p className="font-medium mb-1">How this itinerary was built</p>
              <p className="text-sky-600">
                Places were grouped by city and distributed across {itinerary.totalDays} days.
                Morning slots favour exploration and coffee, afternoon for food and beaches, evenings for nightlife and viewpoints.
                Categories determine time-of-day placement automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
