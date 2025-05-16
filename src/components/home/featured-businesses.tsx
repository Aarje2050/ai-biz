/**
 * FILE: /src/components/home/featured-businesses.tsx
 * PURPOSE: Showcase top businesses
 */

import { Star, MapPin, Clock, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// This would come from your API
const featuredBusinesses = [
  {
    id: '1',
    name: 'The Garden Cafe',
    category: 'Restaurant',
    rating: 4.8,
    reviewCount: 234,
    image: '/api/placeholder/400/300',
    address: 'Connaught Place, Delhi',
    isOpen: true,
    verified: true,
    slug: 'the-garden-cafe-delhi'
  },
  {
    id: '2',
    name: 'Urban Fitness Center',
    category: 'Fitness',
    rating: 4.6,
    reviewCount: 189,
    image: '/api/placeholder/400/300',
    address: 'Bandra West, Mumbai',
    isOpen: false,
    verified: true,
    slug: 'urban-fitness-center-mumbai'
  },
  {
    id: '3',
    name: 'TechFix Solutions',
    category: 'Electronics Repair',
    rating: 4.9,
    reviewCount: 156,
    image: '/api/placeholder/400/300',
    address: 'Koramangala, Bangalore',
    isOpen: true,
    verified: true,
    slug: 'techfix-solutions-bangalore'
  }
]

export function FeaturedBusinesses() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Businesses
            </h2>
            <p className="text-gray-600 text-lg">
              Discover top-rated businesses in your area
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/browse">View All</Link>
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredBusinesses.map((business) => (
            <Link
              key={business.id}
              href={`/business/${business.slug}`}
              className="group block bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={business.image}
                  alt={business.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {business.verified && (
                  <Badge className="absolute top-3 left-3 bg-green-600">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                  business.isOpen 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {business.isOpen ? 'Open Now' : 'Closed'}
                </div>
              </div>

              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {business.name}
                  </h3>
                  <p className="text-sm text-gray-500">{business.category}</p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium ml-1">{business.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({business.reviewCount} reviews)
                  </span>
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  {business.address}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}