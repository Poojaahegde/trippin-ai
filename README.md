# TripPin AI ✈️🗺️

> **Turn travel inspiration into real trips — paste a link, extract places, build your itinerary.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-Map-199900?logo=leaflet)](https://leafletjs.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🧭 What is TripPin AI?

Young travelers discover their next destinations through TikTok reels, Instagram saves, YouTube vlogs, and travel blogs — but they're stuck organizing these scattered saves into a real trip. TripPin AI solves exactly this gap.

Paste a social media link, a caption, or raw travel notes. TripPin AI extracts every place mentioned, categorizes them (Eat, Coffee, Explore, Stay, Shop, Nightlife, Viewpoint), pins them on an interactive map, and helps you generate a day-by-day itinerary in seconds.

---

## 🚩 Problem Statement

**"I have 300 saved Instagram posts and still don't know where to go."**

Travelers today discover destinations through short-form content at scale. A TikTok reel might mention 5 cafés in Lisbon. A YouTube vlog covers 12 spots in Tokyo. A blog post lists 8 hidden beaches in Bali. The discovery phase is rich — but the organization layer is completely broken.

Users resort to Google Maps starred pins, iOS notes, spreadsheets, and Pinterest boards. None of these tools understand travel context, categorize places automatically, or generate itineraries.

TripPin AI is the missing layer between inspiration and execution.

---

## 🎯 Target Users

- **Gen Z & Millennial solo/group travelers** (18–35) who consume travel content daily
- **Digital nomads** planning trips from content they've saved over time
- **Budget travelers** who use free platforms (TikTok, YouTube) instead of traditional travel sites
- **Trip planners** who currently use spreadsheets or Notes apps to organize destinations

---

## ✨ Core Features

### 1. 📥 Place Extraction Engine
- Paste social media text, captions, or travel blog excerpts
- AI-simulated extraction identifies place names from unstructured text
- Each extracted place includes: Name, Category, City/Country, Confidence Score, Source

### 2. 🗺️ Interactive Map View
- Leaflet + OpenStreetMap (free, no API key needed)
- Color-coded pins by category (🟠 Eat, ☕ Coffee, 🟢 Explore, 🛏️ Stay, etc.)
- Click any pin to see place details and add to a trip collection

### 3. 📂 Trip Collections
- Create named trip collections: "Lisbon 2026", "Tokyo Food Spots", "Bali Beach Clubs"
- Drag and add places to any collection
- View all saved places organized by trip

### 4. 📅 Itinerary Generator
- Select a collection + number of days
- Auto-generates a Day-by-Day morning/afternoon/evening plan
- Groups nearby places for walkable days
- Includes simple reasoning ("Grouped cafés and viewpoints for a walkable half-day")

### 5. 📊 PM Analytics Dashboard
- Mock product metrics: total saves, places per source, category breakdown
- Activation metric: did the user save 3+ places?
- Retention hook: return to plan within 7 days

### 6. 🧠 Product Case Study Page
- Problem statement, target users, pain points
- MVP scope and tradeoffs
- Success metrics and roadmap

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Map | Leaflet.js + OpenStreetMap (free) |
| State / Persistence | React useState + localStorage |
| AI Simulation | Client-side text parsing + mock NLP layer |
| Charts | Recharts |
| Deployment | Vercel (frontend) |
| Backend (optional) | FastAPI (Supabase schema included) |

**No paid APIs required to run the demo.** Everything works out of the box.

---

## 📁 Project Structure

```
trippin-ai/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── dashboard/
│   │   └── page.tsx               # Main dashboard with extractor
│   ├── map/
│   │   └── page.tsx               # Full map view
│   ├── collections/
│   │   └── page.tsx               # Trip collections manager
│   ├── itinerary/
│   │   └── page.tsx               # Itinerary generator
│   ├── analytics/
│   │   └── page.tsx               # PM analytics dashboard
│   └── case-study/
│       └── page.tsx               # Product case study
├── components/
│   ├── ui/                        # shadcn components
│   ├── PlaceCard.tsx              # Individual place display card
│   ├── MapView.tsx                # Leaflet map wrapper
│   ├── PlaceExtractor.tsx         # Extraction input + results
│   ├── CollectionManager.tsx      # Trip collections UI
│   ├── ItineraryView.tsx          # Day-by-day itinerary renderer
│   └── AnalyticsChart.tsx         # Recharts analytics wrapper
├── lib/
│   ├── extractor.ts               # Place extraction logic
│   ├── itinerary.ts               # Itinerary generation logic
│   ├── storage.ts                 # localStorage helpers
│   └── types.ts                   # TypeScript interfaces
├── data/
│   ├── seed-places.ts             # Sample extracted places
│   └── seed-collections.ts        # Sample trips/collections
├── docs/
│   ├── PRD.md                     # Product Requirements Document
│   ├── user-stories.md            # User stories
│   ├── roadmap.md                 # Product roadmap
│   ├── metrics.md                 # Metrics framework
│   └── schema.md                  # Database schema
└── public/
    └── screenshots/               # App screenshots
```

---

## 🚀 Running Locally

```bash
# Clone the repo
git clone https://github.com/Poojaahegde/trippin-ai.git
cd trippin-ai

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see TripPin AI in action.

**No environment variables required** — runs fully on mock data and localStorage.

---

## 🎬 Demo Flow

1. Go to **Dashboard** → paste sample travel text:
   `"Best spots in Lisbon: Time Out Market, LX Factory, Belém Tower, Park Bar rooftop, Pastéis de Belém"`
2. Click **Extract Places** → see all 5 places extracted with categories and scores
3. Click **View on Map** → see color-coded pins on Lisbon
4. Create a collection → **"Lisbon 2026"** → add places
5. Go to **Itinerary** → select collection, choose 2 days → generate plan
6. Check **Analytics** → see mock activation + retention metrics

---

## 📊 Product Metrics (Mock)

| Metric | Definition | Target |
|---|---|---|
| Activation Rate | User saves ≥3 places in first session | 40% |
| Itinerary Generation Rate | % of users who generate an itinerary | 25% |
| D7 Retention | Returns within 7 days to plan/edit trip | 20% |
| Places per Session | Avg places extracted per session | 6+ |
| Collection Creation Rate | % of users who name and save a trip | 35% |

---

## 🗺️ Product Roadmap

**Phase 1 — MVP (Current)**
- Text-based place extraction with mock AI
- Interactive Leaflet map with category pins
- Trip collections with localStorage
- Basic itinerary generator

**Phase 2 — Real Extraction**
- Instagram/TikTok oEmbed metadata parsing
- YouTube transcript extraction for travel vlogs
- Google Maps link parsing to extract business names

**Phase 3 — Collaborative Planning**
- Share trips with friends (real-time via Supabase)
- Vote on places within a collection
- Comments and travel notes on each place

**Phase 4 — Smart AI**
- GPT-4o powered itinerary with context reasoning
- Dietary/preference filters (vegan cafés, budget stays)
- Seasonal and weather-aware scheduling

---

## 🧠 PM Case Study Summary

**Problem:** Travel discovery has moved to social media, but the tools for organizing those saves haven't kept up. Travelers lose their best finds in Notes apps and spreadsheets.

**Solution:** A lightweight web app that bridges inspiration (social content) and execution (organized itinerary) through place extraction, map visualization, and structured planning.

**Key PM Decisions:**
- Used LocalStorage over a database to enable zero-auth demo flow
- Simulated AI extraction to validate UX before building real NLP pipeline
- Added analytics mock to demonstrate PM thinking, not just engineering
- Prioritized map-first UX over list-first because visual context drives travel planning

See full [Product Case Study →](./docs/PRD.md)

---

## 🤝 Contributing

This is a portfolio project. PRs with bug fixes or UI improvements are welcome.

---

## 📄 License

MIT License — see [LICENSE](./LICENSE) for details.

---

*Built with product thinking, not just code. — Pooja Hegde*
