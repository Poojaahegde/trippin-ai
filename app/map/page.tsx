'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Place, PlaceCategory } from '../../lib/types';
import { getPlaces, addPlaces } from '../../lib/storage';
import { SEED_PLACES } from '../../data/seed-places';

// Category to Leaflet marker color mapping
const CATEGORY_ICON_COLOR: Record<string, string> = {
  Eat: '#f97316',
  Coffee: '#d97706',
  Explore: '#10b981',
  Stay: '#8b5cf6',
  Shop: '#ec4899',
  Nightlife: '#6366f1',
  Viewpoint: '#0ea5e9',
  Beach: '#06b6d4',
  Activity: '#84cc16',
};

const ALL_CATEGORIES: PlaceCategory[] = [
  'Eat', 'Coffee', 'Explore', 'Stay', 'Shop', 'Nightlife', 'Viewpoint', 'Beach', 'Activity',
];

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<unknown>(null);
  const markersRef = useRef<unknown[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [activeCategory, setActiveCategory] = useState<PlaceCategory | 'All'>('All');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Load seed data for demo if no saved places
  useEffect(() => {
    let saved = getPlaces();
    if (saved.length === 0) {
      saved = addPlaces(SEED_PLACES);
    }
    setPlaces(saved);
  }, []);

  // Initialize Leaflet map after places load
  useEffect(() => {
    if (!mapRef.current || places.length === 0 || mapReady) return;

    // Dynamically import Leaflet (avoids SSR issues)
    import('leaflet').then((L) => {
      if (!mapRef.current || leafletMapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [38.7072, -9.1469], // Default: Lisbon
        zoom: 5,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      leafletMapRef.current = map;
      setMapReady(true);
    });
  }, [places, mapReady]);

  // Add / refresh markers when places or filter changes
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady) return;

    import('leaflet').then((L) => {
      const map = leafletMapRef.current as ReturnType<typeof L.map>;

      // Clear existing markers
      markersRef.current.forEach((m) => (m as ReturnType<typeof L.marker>).remove());
      markersRef.current = [];

      const filtered = activeCategory === 'All'
        ? places
        : places.filter((p) => p.category === activeCategory);

      const bounds: [number, number][] = [];

      filtered.forEach((place) => {
        if (!place.lat || !place.lng) return;

        const color = CATEGORY_ICON_COLOR[place.category] || '#64748b';

        // Custom SVG marker
        const svgIcon = L.divIcon({
          html: `<div style="
            width:28px;height:28px;border-radius:50% 50% 50% 0;
            background:${color};transform:rotate(-45deg);
            border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);">
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          className: '',
        });

        const marker = L.marker([place.lat, place.lng], { icon: svgIcon })
          .addTo(map)
          .on('click', () => setSelectedPlace(place));

        markersRef.current.push(marker);
        bounds.push([place.lat, place.lng]);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds as [number, number][], { padding: [50, 50], maxZoom: 12 });
      }
    });
  }, [places, activeCategory, mapReady]);

  const filteredPlaces = activeCategory === 'All'
    ? places
    : places.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">✈️</span>
            <span className="font-bold text-slate-900">TripPin AI</span>
          </Link>
          <div className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-600 hover:text-sky-600">Dashboard</Link>
            <Link href="/collections" className="text-slate-600 hover:text-sky-600">Trips</Link>
            <Link href="/itinerary" className="text-slate-600 hover:text-sky-600">Itinerary</Link>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left sidebar ─────────────────────────────────────────── */}
        <div className="w-72 bg-white border-r border-slate-100 flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-slate-50">
            <h2 className="font-semibold text-slate-900 mb-3">Filter by Category</h2>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory('All')}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  activeCategory === 'All'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({places.length})
              </button>
              {ALL_CATEGORIES.map((cat) => {
                const count = places.filter((p) => p.category === cat).length;
                if (count === 0) return null;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      activeCategory === cat
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredPlaces.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedPlace(p)}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedPlace?.id === p.id
                    ? 'border-sky-300 bg-sky-50'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_ICON_COLOR[p.category] }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.city}, {p.country}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Map ──────────────────────────────────────────────────── */}
        <div className="flex-1 relative">
          <div ref={mapRef} className="w-full h-full" />

          {/* Place detail card */}
          {selectedPlace && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-80 z-[1000]">
              <button
                onClick={() => setSelectedPlace(null)}
                className="absolute top-3 right-3 text-slate-400 hover:text-slate-700 text-lg leading-none"
              >
                ×
              </button>
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0"
                  style={{ backgroundColor: CATEGORY_ICON_COLOR[selectedPlace.category] + '20' }}
                >
                  <div
                    className="w-3 h-3 rounded-full m-auto mt-3.5"
                    style={{ backgroundColor: CATEGORY_ICON_COLOR[selectedPlace.category] }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{selectedPlace.name}</h3>
                  <p className="text-sm text-slate-400">{selectedPlace.city}, {selectedPlace.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: CATEGORY_ICON_COLOR[selectedPlace.category] + '20',
                    color: CATEGORY_ICON_COLOR[selectedPlace.category],
                  }}
                >
                  {selectedPlace.category}
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(selectedPlace.confidence * 100)}% confidence
                </span>
              </div>
              {selectedPlace.notes && (
                <p className="text-sm text-slate-600 mb-3">{selectedPlace.notes}</p>
              )}
              <p className="text-xs text-slate-400 mb-4">Source: {selectedPlace.source}</p>
              <Link
                href="/collections"
                className="block text-center text-sm bg-sky-500 text-white rounded-xl py-2 hover:bg-sky-600 transition-colors"
              >
                + Add to Trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
