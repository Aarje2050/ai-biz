/**
 * FILE: /src/app/search/page.tsx
 * PURPOSE: Clean, minimal, SEO-friendly search page like Google SERP
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, MapPin, Star, Clock, Filter, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SearchResult {
  id: string
  name: string
  slug: string
  description?: string
  category?: string
  city?: string
  phone?: string
  logo_url?: string
  rating?: number
  review_count?: number
  verified: boolean
  ai_enabled?: boolean
  matchScore?: number
  distance?: string
  isOpen?: boolean
}

interface SearchResponse {
  businesses: SearchResult[]
  resultCount: number
  searchTime?: number
  aiSummary?: string
  relatedQueries?: string[]
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [city, setCity] = useState(searchParams.get('city') || 'All Cities')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const performSearch = useCallback(async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams({ q: query })
      if (city !== 'All Cities') params.append('city', city)
      
      const response = await fetch(`/api/search?${params}`)
      const data: SearchResponse = await response.json()
      
      setResults(data.businesses || [])
      setSearchResponse(data)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [query, city])

  useEffect(() => {
    const q = searchParams.get('q')
    const c = searchParams.get('city')
    if (q) {
      setQuery(q)
      if (c) setCity(c)
      performSearch()
    }
  }, [searchParams, performSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    const params = new URLSearchParams({ q: query })
    if (city !== 'All Cities') params.append('city', city)
    router.push(`/search?${params}`)
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <title>{query ? `${query} - Search Results` : 'Search Local Businesses'}</title>
      <meta name="description" content={`Find ${query || 'local businesses'} in ${city}. Read reviews, get contact info, and connect with verified businesses.`} />
      
      <div className="min-h-screen bg-white">
        {/* Clean Search Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-medium text-gray-900">
                AI Business
              </Link>
              
              <form onSubmit={handleSearch} className="flex-1">
                <div className="flex items-center gap-3 max-w-2xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search businesses..."
                      className="pl-10 h-10 border-gray-300 focus:border-blue-500"
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={loading}>
                    Search
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 py-4">
          {/* Search Info Bar */}
          {searchResponse && (
            <div className="text-sm text-gray-600 mb-3 flex items-center justify-between">
              <span>
                About {searchResponse.resultCount.toLocaleString()} results
                {searchResponse.searchTime && ` (${searchResponse.searchTime}ms)`}
              </span>
              
              {/* Simple Filters */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-1"
              >
                <Filter className="w-4 h-4" />
                Filters
                <ChevronDown className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Filter Bar */}
          {showFilters && (
            <div className="bg-gray-50 p-3 rounded-lg mb-4 flex gap-4">
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded"
              >
                <option>All Cities</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
                <option>Chennai</option>
                <option>Kolkata</option>
              </select>
              <Button size="sm" onClick={performSearch}>
                Apply
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-2">Searching...</p>
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-600 mb-4">
                We couldn't find any businesses matching "{query}"
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Different keywords</li>
                  <li>Check your spelling</li>
                  <li>More general terms</li>
                  <li>Browse categories instead</li>
                </ul>
              </div>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((business) => (
                <article
                  key={business.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Business Image */}
                    <div className="w-16 h-16 flex-shrink-0">
                      <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden">
                        {business.logo_url ? (
                          <Image
                            src={business.logo_url}
                            alt={business.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Logo</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link
                            href={`/business/${business.slug}`}
                            className="text-blue-600 hover:underline text-lg font-medium leading-tight"
                          >
                            {business.name}
                          </Link>
                          
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{business.rating || 'Not rated'}</span>
                              {business.review_count && (
                                <span>({business.review_count})</span>
                              )}
                            </div>
                            
                            {business.category && (
                              <span>• {business.category}</span>
                            )}
                            
                            {business.distance && (
                              <span>• {business.distance}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            {business.verified && (
                              <Badge className="bg-green-100 text-green-800 text-xs">
                                Verified
                              </Badge>
                            )}
                            {business.ai_enabled && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">
                                AI Assistant
                              </Badge>
                            )}
                            {business.isOpen && (
                              <div className="flex items-center gap-1 text-green-600 text-xs">
                                <Clock className="w-3 h-3" />
                                Open now
                              </div>
                            )}
                          </div>

                          {business.description && (
                            <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                              {business.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                            {business.phone && (
                              <span>📞 {business.phone}</span>
                            )}
                            {business.city && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {business.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Related Queries */}
          {searchResponse?.relatedQueries && searchResponse.relatedQueries.length > 0 && (
            <div className="mt-8 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Related searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchResponse.relatedQueries.map((related, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setQuery(related)
                      setShowFilters(false)
                      const params = new URLSearchParams({ q: related })
                      if (city !== 'All Cities') params.append('city', city)
                      router.push(`/search?${params}`)
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    {related}
                  </button>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SearchResultsPage",
            "name": `Search Results for ${query}`,
            "url": `${process.env.NEXT_PUBLIC_APP_URL}/search?q=${encodeURIComponent(query)}`,
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": results.length,
              "itemListElement": results.slice(0, 10).map((business, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "LocalBusiness",
                  "name": business.name,
                  "url": `${process.env.NEXT_PUBLIC_APP_URL}/business/${business.slug}`,
                  "description": business.description,
                  "aggregateRating": business.rating ? {
                    "@type": "AggregateRating",
                    "ratingValue": business.rating,
                    "reviewCount": business.review_count || 0
                  } : undefined
                }
              }))
            }
          })
        }}
      />
    </>
  )
}