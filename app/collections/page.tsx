'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Place, Collection } from '../../lib/types';
import {
  getPlaces, getCollections, createCollection,
  addPlaceToCollection, removePlaceFromCollection, deleteCollection, addPlaces, saveCollections,
} from '../../lib/storage';
import { SEED_PLACES } from '../../data/seed-places';
import { SEED_COLLECTIONS } from '../../data/seed-collections';

const CATEGORY_COLORS: Record<string, string> = {
  Eat: 'bg-orange-100 text-orange-700',
  Coffee: 'bg-amber-100 text-amber-700',
  Explore: 'bg-emerald-100 text-emerald-700',
  Stay: 'bg-violet-100 text-violet-700',
  Shop: 'bg-pink-100 text-pink-700',
  Nightlife: 'bg-indigo-100 text-indigo-700',
  Viewpoint: 'bg-sky-100 text-sky-700',
  Beach: 'bg-cyan-100 text-cyan-700',
  Activity: 'bg-lime-100 text-lime-700',
};

export default function CollectionsPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [newTripName, setNewTripName] = useState('');
  const [newTripEmoji, setNewTripEmoji] = useState('');
  const [showNewForm, setShowNewForm] = useState(false);

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
    if (cols.length > 0) setActiveCollection(cols[0]);
  }, []);

  function refresh() {
    const cols = getCollections();
    setCollections(cols);
    setActiveCollection((prev) => cols.find((c) => c.id === prev?.id) || cols[0] || null);
    setPlaces(getPlaces());
  }

  function handleCreateTrip() {
    if (!newTripName.trim()) return;
    createCollection(newTripName.trim(), newTripEmoji || undefined);
    refresh();
    setNewTripName('');
    setShowNewForm(false);
  }

  const collectionPlaces = activeCollection
    ? places.filter((p) => activeCollection.placeIds.includes(p.id))
    : [];

  const unaddedPlaces = activeCollection
    ? places.filter((p) => !activeCollection.placeIds.includes(p.id))
    : places;

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
            <Link href="/itinerary" className="text-slate-600 hover:text-sky-600">Itinerary</Link>
          </div>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Trip Collections</h1>
            <p className="text-slate-500">Organize saved places into named trips.</p>
          </div>
          <button
            onClick={() => setShowNewForm(!showNewForm)}
            className="bg-sky-500 hover:bg-sky-600 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
          >
            + New Trip
          </button>
        </div>
        {showNewForm && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 mb-6">
            <h3 className="font-semibold text-slate-900 mb-4">Create New Trip</h3>
            <div className="flex gap-3">
              <input value={newTripEmoji} onChange={(e) => setNewTripEmoji(e.target.value)}
                placeholder="..." className="w-14 border border-slate-200 rounded-xl p-2 text-center text-xl" />
              <input value={newTripName} onChange={(e) => setNewTripName(e.target.value)}
                placeholder="e.g. Tokyo 2026, Bali Beach Clubs..."
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateTrip()} />
              <button onClick={handleCreateTrip} disabled={!newTripName.trim()}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 text-white font-semibold px-5 py-2 rounded-xl text-sm">
                Create
              </button>
            </div>
          </div>
        )}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Your Trips</p>
            {collections.map((col) => (
              <div key={col.id} onClick={() => setActiveCollection(col)}
                className={"cursor-pointer rounded-2xl border p-4 transition-all " +
                  (activeCollection?.id === col.id ? 'border-sky-300 bg-sky-50 shadow-md' : 'border-slate-100 bg-white hover:bg-slate-50')}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{col.emoji || '...'}</span>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{col.name}</p>
                      <p className="text-xs text-slate-400">{col.placeIds.length} places</p>
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); deleteCollection(col.id); refresh(); }}
                    className="text-slate-300 hover:text-red-400 text-lg leading-none">x</button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-2 space-y-5">
            {activeCollection ? (
              <>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{activeCollection.emoji || '...'}</span>
                      <h2 className="font-semibold text-slate-900">{activeCollection.name}</h2>
                    </div>
                    <Link href="/itinerary"
                      className="text-xs bg-sky-500 text-white px-3 py-1.5 rounded-lg hover:bg-sky-600 transition-colors">
                      Generate Itinerary
                    </Link>
                  </div>
                  {collectionPlaces.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <p className="text-sm">No places in this trip yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {collectionPlaces.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.city}</p>
                          </div>
                          <span className={"text-xs px-2 py-0.5 rounded-full " + (CATEGORY_COLORS[p.category] || '')}>
                            {p.category}
                          </span>
                          <button onClick={() => { removePlaceFromCollection(activeCollection.id, p.id); refresh(); }}
                            className="text-slate-300 hover:text-red-400 text-sm">x</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {unaddedPlaces.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
                    <h3 className="font-medium text-slate-700 mb-3 text-sm">Add places to this trip</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {unaddedPlaces.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-800 truncate">{p.name}</p>
                            <p className="text-xs text-slate-400">{p.city}</p>
                          </div>
                          <button onClick={() => { addPlaceToCollection(activeCollection.id, p.id); refresh(); }}
                            className="text-xs bg-slate-100 hover:bg-sky-100 hover:text-sky-700 text-slate-600 px-3 py-1 rounded-lg transition-colors">
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center text-slate-400">
                <p>Select a trip to manage its places.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
