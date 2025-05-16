/**
 * FILE: /src/components/home/location-aware-homepage.tsx
 * PURPOSE: Fixed location detection loading state
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LocationCategoryGrid } from './location-category-grid'
import { LocationFeaturedBusinesses } from './location-featured-businesses'

interface LocationData {
  city: string
  state: string
  country: string
  isDetected: boolean
}

export function LocationAwareHomepage() {
  const [location, setLocation] = useState<LocationData>({ 
    city: 'India', 
    state: '', 
    country: 'India',
    isDetected: false 
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [showCitySelector, setShowCitySelector] = useState(false)
  const router = useRouter()

  const INDIAN_CITIES = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
    'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
    'Nagpur', 'Indore', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara',
    'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut'
  ]

  // Real location detection
  useEffect(() => {
    detectUserLocation()
  }, [])

  const detectUserLocation = async () => {
    setIsLocationLoading(true)
    
    try {
      // First try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            await reverseGeocode(latitude, longitude)
          },
          async (error) => {
            console.log('Geolocation failed:', error)
            // Fallback to IP-based detection
            await detectByIP()
          },
          { timeout: 10000, enableHighAccuracy: true }
        )
      } else {
        await detectByIP()
      }
    } catch (error) {
      console.error('Location detection error:', error)
      setLocation({ city: 'India', state: '', country: 'India', isDetected: false })
      setIsLocationLoading(false)
    }
  }

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Using OpenStreetMap Nominatim (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      )
      const data = await response.json()
      
      if (data && data.address) {
        const city = data.address.city || data.address.town || data.address.village || 'India'
        const state = data.address.state || ''
        const country = data.address.country || 'India'
        
        setLocation({ city, state, country, isDetected: true })
      } else {
        throw new Error('No address found')
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      await detectByIP()
    } finally {
      setIsLocationLoading(false) // Fixed: ensure loading stops
    }
  }

  const detectByIP = async () => {
    try {
      // Fallback to IP-based detection
      const response = await fetch('http://ip-api.com/json/')
      const data = await response.json()
      
      if (data.status === 'success') {
        setLocation({
          city: data.city || 'India',
          state: data.regionName || '',
          country: data.country || 'India',
          isDetected: true
        })
      }
    } catch (error) {
      console.error('IP detection failed:', error)
      setLocation({ city: 'India', state: '', country: 'India', isDetected: false })
    } finally {
      setIsLocationLoading(false) // Fixed: ensure loading stops here too
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    const params = new URLSearchParams({
      q: searchQuery,
      city: location.city
    })
    router.push(`/search?${params}`)
  }

  const handleLocationChange = (newCity: string) => {
    setLocation({
      city: newCity,
      state: '',
      country: 'India',
      isDetected: false
    })
    setShowCitySelector(false)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Simple Hero Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            {/* Location Display */}
            <div className="mb-8">
              <button
                onClick={() => setShowCitySelector(!showCitySelector)}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {isLocationLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                      Detecting location...
                    </>
                  ) : (
                    <>Showing results for {location.city}</>
                  )}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* City Selector */}
              {showCitySelector && (
                <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md mx-auto">
                  <p className="text-sm text-gray-600 mb-3">Choose your city:</p>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {INDIAN_CITIES.map((city) => (
                      <button
                        key={city}
                        onClick={() => handleLocationChange(city)}
                        className="text-left px-3 py-2 hover:bg-gray-50 rounded text-sm"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="max-w-lg mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search for businesses in ${location.city}...`}
                  className="pl-12 pr-24 py-4 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-0"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full"
                >
                  Search
                </Button>
              </div>
            </form>

            {/* Popular Searches */}
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {getPopularSearches(location.city).map((term) => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="px-3 py-1 text-sm text-gray-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <LocationCategoryGrid city={location.city} />

      {/* Featured Businesses */}
      <LocationFeaturedBusinesses city={location.city} />

      {/* Simple Stats */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-3xl mx-auto">
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">50,000+</div>
              <div className="text-sm text-gray-600">Businesses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">1M+</div>
              <div className="text-sm text-gray-600">Reviews</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">500+</div>
              <div className="text-sm text-gray-600">Cities</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">24/7</div>
              <div className="text-sm text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

// City-specific popular searches
function getPopularSearches(city: string): string[] {
  const citySearches: Record<string, string[]> = {
    'Mumbai': ['Restaurants', 'Salons', 'Doctors', 'Gyms'],
    'Delhi': ['Food', 'Healthcare', 'Beauty', 'Fitness'],
    'Bangalore': ['Tech Services', 'Cafes', 'Hospitals', 'Coworking'],
    'Chennai': ['Restaurants', 'Medical', 'Education', 'Auto Services'],
    'Hyderabad': ['IT Services', 'Food', 'Healthcare', 'Shopping'],
  }
  
  return citySearches[city] || ['Restaurants', 'Services', 'Healthcare', 'Shopping']
}