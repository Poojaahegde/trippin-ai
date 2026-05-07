import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TripPin AI — Turn saved reels into real trips',
  description:
    'Paste a social media link or travel notes. TripPin AI extracts places, pins them on a map, and builds your day-by-day itinerary.',
  keywords: ['travel planning', 'AI travel', 'TikTok travel', 'itinerary generator', 'travel map'],
  openGraph: {
    title: 'TripPin AI',
    description: 'Turn travel inspiration into organized trips.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Leaflet CSS — required for map rendering */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-slate-50">
          {children}
        </div>
      </body>
    </html>
  );
}
