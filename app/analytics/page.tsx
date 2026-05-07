'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getPlaces, getCollections, getItineraries, addPlaces, saveCollections } from '../../lib/storage';
import { SEED_PLACES } from '../../data/seed-places';
import { SEED_COLLECTIONS } from '../../data/seed-collections';

const CATEGORY_COLORS_HEX: Record<string, string> = {
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

const METRIC_CARDS = [
  { label: 'Total Saved Places', key: 'totalPlaces', icon: '📍', color: 'sky' },
  { label: 'Trip Collections', key: 'totalCollections', icon: '🗂️', color: 'emerald' },
  { label: 'Itineraries Generated', key: 'totalItineraries', icon: '📅', color: 'violet' },
  { label: 'Activation Rate', key: 'activationRate', icon: '⚡', color: 'amber' },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalPlaces: 0,
    totalCollections: 0,
    totalItineraries: 0,
    activationRate: '0%',
    activationAchieved: false,
    categoryData: [] as { name: string; count: number; fill: string }[],
    sourceData: [] as { name: string; count: number }[],
    topCities: [] as { city: string; count: number }[],
  });

  useEffect(() => {
    let places = getPlaces();
    let cols = getCollections();
    if (places.length === 0) {
      places = addPlaces(SEED_PLACES);
      saveCollections(SEED_COLLECTIONS);
      cols = SEED_COLLECTIONS;
    }
    const itineraries = getItineraries();

    // Category distribution
    const catCounts: Record<string, number> = {};
    places.forEach((p) => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    const categoryData = Object.entries(catCounts).map(([name, count]) => ({
      name, count, fill: CATEGORY_COLORS_HEX[name] || '#94a3b8',
    }));

    // Source distribution
    const sourceCounts: Record<string, number> = {};
    places.forEach((p) => {
      const key = p.source.includes('TikTok') ? 'TikTok'
        : p.source.includes('YouTube') ? 'YouTube'
        : p.source.includes('Instagram') ? 'Instagram'
        : p.source.includes('blog') ? 'Travel Blog'
        : 'Pasted Text';
      sourceCounts[key] = (sourceCounts[key] || 0) + 1;
    });
    const sourceData = Object.entries(sourceCounts).map(([name, count]) => ({ name, count }));

    // Top cities
    const cityCounts: Record<string, number> = {};
    places.forEach((p) => { cityCounts[p.city] = (cityCounts[p.city] || 0) + 1; });
    const topCities = Object.entries(cityCounts).sort(([, a], [, b]) => b - a).slice(0, 5).map(([city, count]) => ({ city, count }));

    const activationAchieved = places.length >= 3;
    const activationRate = places.length > 0
      ? Math.min(100, Math.round((Math.min(places.length, 10) / 10) * 100)) + '%'
      : '0%';

    setStats({
      totalPlaces: places.length,
      totalCollections: cols.length,
      totalItineraries: itineraries.length,
      activationRate,
      activationAchieved,
      categoryData,
      sourceData,
      topCities,
    });
  }, []);

  const metricValues: Record<string, string | number> = {
    totalPlaces: stats.totalPlaces,
    totalCollections: stats.totalCollections,
    totalItineraries: stats.totalItineraries,
    activationRate: stats.activationRate,
  };

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
            <Link href="/collections" className="text-slate-600 hover:text-sky-600">Collections</Link>
            <Link href="/case-study" className="text-slate-600 hover:text-sky-600">Case Study</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-500">Mock PM-style metrics dashboard. Data is based on your current session.</p>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {METRIC_CARDS.map((m) => (
            <div key={m.key} className="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
              <p className="text-2xl mb-2">{m.icon}</p>
              <p className="text-2xl font-bold text-slate-900">{metricValues[m.key]}</p>
              <p className="text-sm text-slate-500 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Activation banner */}
        <div className={"rounded-2xl border p-5 mb-8 flex items-center gap-4 " +
          (stats.activationAchieved ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200')}>
          <span className="text-3xl">{stats.activationAchieved ? '✅' : '⏳'}</span>
          <div>
            <p className="font-semibold text-slate-800">
              Activation: {stats.activationAchieved ? 'Achieved' : 'Pending'}
            </p>
            <p className="text-sm text-slate-600">
              {stats.activationAchieved
                ? 'User has saved 3+ places. Core value delivered.'
                : `Save ${3 - stats.totalPlaces} more places to hit the activation threshold.`}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Category chart */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Places by Category</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats.categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Source pie */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Places by Source</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={stats.sourceData} cx="50%" cy="50%" outerRadius={80} dataKey="count" nameKey="name" label>
                  {stats.sourceData.map((_, i) => (
                    <Cell key={i} fill={['#0ea5e9','#10b981','#f97316','#8b5cf6','#ec4899'][i % 5]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top cities */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 mb-6">
          <h3 className="font-semibold text-slate-900 mb-4">Top Cities</h3>
          <div className="space-y-3">
            {stats.topCities.map((c, i) => (
              <div key={c.city} className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 w-5">{i + 1}</span>
                <span className="text-sm font-medium text-slate-800 w-28">{c.city}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${(c.count / Math.max(...stats.topCities.map((x) => x.count))) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-slate-500 w-8 text-right">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PM Metrics framework */}
        <div className="bg-slate-900 text-white rounded-2xl p-6">
          <h3 className="font-semibold mb-4">PM Metrics Framework</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {[
              { metric: 'Activation', def: 'User saves >= 3 places in first session', target: '40%' },
              { metric: 'D7 Retention', def: 'User returns within 7 days to plan a trip', target: '20%' },
              { metric: 'Itinerary Rate', def: '% of sessions that generate an itinerary', target: '25%' },
              { metric: 'Places/Session', def: 'Average places extracted per session', target: '6+' },
              { metric: 'Collection Rate', def: '% of users who create a named trip', target: '35%' },
              { metric: 'Map Engagement', def: 'User opens map after extracting places', target: '60%' },
            ].map((r) => (
              <div key={r.metric} className="bg-white/10 rounded-xl p-4">
                <p className="font-semibold text-sky-300">{r.metric}</p>
                <p className="text-slate-300 text-xs mt-1">{r.def}</p>
                <p className="text-white font-bold mt-2">Target: {r.target}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
