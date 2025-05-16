/**
 * FILE: /src/components/home/location-featured-businesses.tsx
 * PURPOSE: Clean featured businesses section (with real data structure)
 */

'use client'

import { useState, useEffect } from 'react'
import { Star, MapPin, Clock, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Business {
  id: string
  name: string
  category: string
  rating: number
  review_count: number
  images: string[]
  city: string
  address: string
  phone: string
  status: string
  verified: boolean
  slug: string
  hours?: any
}

interface FeaturedBusinessesProps {
  city: string
}

export function LocationFeaturedBusinesses({ city }: FeaturedBusinessesProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedBusinesses()
  }, [city])

  const fetchFeaturedBusinesses = async () => {
    try {
      // This will call your real API
      const response = await fetch(`/api/businesses?city=${city}&limit=6&verified=true`)
      const data = await response.json()
      
      if (data.success) {
        setBusinesses(data.data)
      } else {
        // Fallback to mock data if API fails
        setBusinesses(getMockBusinesses(city))
      }
    } catch (error) {
      console.error('Failed to fetch businesses:', error)
      setBusinesses(getMockBusinesses(city))
    } finally {
      setLoading(false)
    }
  }

  // Mock data for development (matches your database schema)
  const getMockBusinesses = (city: string): Business[] => [
    {
      id: '1',
      name: 'The Garden Cafe',
      category: 'restaurant',
      rating: 4.8,
      review_count: 234,
      images: ['/api/placeholder/400/300'],
      city: city,
      address: 'Central Area',
      phone: '+91-9876543210',
      status: 'active',
      verified: true,
      slug: 'the-garden-cafe',
      hours: { monday: '9:00 AM - 10:00 PM' }
    },
    {
      id: '2',
      name: 'Style Studio',
      category: 'beauty-spa',
      rating: 4.6,
      review_count: 189,
      images: ['/api/placeholder/400/300'],
      city: city,
      address: 'Market Street',
      phone: '+91-9876543211',
      status: 'active',
      verified: true,
      slug: 'style-studio'
    },
    {
      id: '3',
      name: 'HealthCare Clinic',
      category: 'healthcare',
      rating: 4.9,
      review_count: 156,
      images: ['/api/placeholder/400/300'],
      city: city,
      address: 'Medical District',
      phone: '+91-9876543212',
      status: 'active',
      verified: true,
      slug: 'healthcare-clinic'
    }
  ]

  const isBusinessOpen = (business: Business) => {
    if (!business.hours) return false
    const today = new Date().toLocaleDateString('en-US' )
    const todayHours = business.hours[today]
    return todayHours && todayHours !== 'Closed'
  }

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading businesses...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-bold text-gray-900">
            Popular in {city}
          </h2>
          <Link href={`/search?city=${city}`}>
            <Button variant="outline">View All</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {businesses.slice(0, 3).map((business) => (
            <Link
              key={business.id}
              href={`/business/${business.slug}`}
              className="group block"
            >
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={business.images[0] || '/api/placeholder/400/300'}
                    alt={business.name}
                    fill
                    className="object-cover"
                  />
                  {business.verified && (
                    <Badge className="absolute top-3 left-3 bg-green-600">
                      Verified
                    </Badge>
                  )}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-medium ${
                    isBusinessOpen(business) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {isBusinessOpen(business) ? 'Open' : 'Closed'}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600">
                    {business.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{business.category}</p>

                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-medium">{business.rating}</span>
                    <span className="text-sm text-gray-500">({business.review_count})</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {business.address}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}