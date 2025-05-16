/**
 * FILE: /src/app/page.tsx
 * PURPOSE: Location-aware homepage (replaces existing)
 */

import { Metadata } from 'next'
import { LocationAwareHomepage } from '@/components/home/location-aware-homepage'

export const metadata: Metadata = {
  title: 'Find Local Businesses Near You | AI Business Directory',
  description: 'Discover the best restaurants, services, and stores in your area. Read reviews, get directions, and connect with local businesses.',
  keywords: 'local business, directory, restaurants, services, reviews, near me',
  openGraph: {
    title: 'AI Business Directory - Find Local Businesses',
    description: 'Discover and connect with local businesses in your area',
    type: 'website',
  },
}

export default function HomePage() {
  return <LocationAwareHomepage />
}