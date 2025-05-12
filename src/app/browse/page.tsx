'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Button } from '@/components/ui'
import { Search, MapPin, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { debounce } from '@/lib/utils'
import type { Business } from '@/types/business'

const categories = [
  'All',
  'Restaurant',
  'Retail',
  'Healthcare',
  'Beauty & Wellness',
  'Automotive',
  'Professional Services',
  'Home & Garden',
  'Entertainment',
  'Fitness & Recreation',
  'Technology',
  'Real Estate',
  'Financial Services',
  'Education',
  'Travel & Hospitality',
  'Other'
]

export default function BrowsePage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchBusinesses = async (newSearch = false) => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory !== 'All') params.append('category', selectedCategory)
      params.append('page', String(newSearch ? 1 : page))
      params.append('limit', '12')
      params.append('verified', 'true')

      const response = await fetch(`/api/businesses?${params}`)
      const data = await response.json()

      if (data.success) {
        if (newSearch) {
          setBusinesses(data.data)
          setPage(1)
        } else {
          setBusinesses(prev => [...prev, ...data.data])
        }
        setHasMore(data.pagination.hasNextPage)
      }
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search
  const debouncedSearch = debounce(() => {
    setLoading(true)
    fetchBusinesses(true)
  }, 500)

  useEffect(() => {
    if (searchQuery !== '') {
      debouncedSearch()
    } else {
      setLoading(true)
      fetchBusinesses(true)
    }
  }, [searchQuery, selectedCategory])

  const loadMore = () => {
    setPage(prev => prev + 1)
    fetchBusinesses()
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Browse Businesses</h1>
        <p className="text-muted-foreground">
          Discover local businesses with AI assistance
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading && businesses.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-12">
          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse different categories.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <Card key={business.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1">{business.name}</CardTitle>
                      <CardDescription>{business.category}</CardDescription>
                    </div>
                    {business.verified && (
                      <Star className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {business.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {business.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    {business.city && business.state && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {business.city}, {business.state}
                      </span>
                    )}
                  </div>

                  <Link href={`/business/${business.slug}`}>
                    <Button className="w-full" variant="outline">
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="text-center mt-8">
              <Button onClick={loadMore} disabled={loading}>
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}