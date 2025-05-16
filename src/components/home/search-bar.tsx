/**
 * FILE: /src/components/home/search-bar.tsx
 * PURPOSE: Smart search with location detection
 */

'use client'

import { useState, useEffect } from 'react'
import { Search, MapPin, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const router = useRouter()

  const detectLocation = async () => {
    setIsDetectingLocation(true)
    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            // Reverse geocoding API call would go here
            setLocation('Your Current Location')
            setIsDetectingLocation(false)
          },
          (error) => {
            console.error('Location detection failed:', error)
            setIsDetectingLocation(false)
          }
        )
      }
    } catch (error) {
      setIsDetectingLocation(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchQuery = new URLSearchParams({
      q: query,
      location: location || ''
    }).toString()
    router.push(`/search?${searchQuery}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="flex bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Business/Service Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What are you looking for?"
            className="border-0 pl-12 pr-4 h-16 text-lg rounded-none focus:ring-0"
          />
        </div>

        {/* Divider */}
        <div className="w-px bg-gray-200" />

        {/* Location Input */}
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Where?"
            className="border-0 pl-12 pr-20 h-16 text-lg rounded-none focus:ring-0"
          />
          <button
            type="button"
            onClick={detectLocation}
            disabled={isDetectingLocation}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isDetectingLocation ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              'Detect'
            )}
          </button>
        </div>

        {/* Search Button */}
        <Button
          type="submit"
          size="lg"
          className="rounded-none rounded-r-2xl h-16 px-8 bg-blue-600 hover:bg-blue-700"
        >
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
      </div>

      {/* Popular Searches */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {['Restaurants', 'Salons', 'Doctors', 'Gyms', 'Grocery'].map((term) => (
          <button
            key={term}
            type="button"
            onClick={() => setQuery(term)}
            className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm hover:bg-white/30 transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </form>
  )
}