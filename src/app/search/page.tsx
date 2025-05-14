'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, MapPin, Star, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { GMBBusinessCard } from '@/components/business/gmb-business-card';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category?: string;
  city?: string;
  state?: string;
  phone?: string;
  logo_url?: string;
  hours?: any;
  status: string;
  verification_status?: string;
  ai_agent_enabled?: boolean;
  rating?: number;
  review_count?: number;
  matchScore?: number;
  matchReason?: string;
}

interface SearchResponse {
  businesses: SearchResult[];
  aiSummary?: string;
  relatedQueries?: string[];
  suggestions?: string[];
  resultCount: number;
  searchTime?: number;
  intent?: any;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResponse, setSearchResponse] = useState<SearchResponse | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data: SearchResponse = await response.json();
      
      setResults(data.businesses || []);
      setSearchResponse(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setSearchResponse(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams, performSearch]);

  const handleSearch = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
  };

  const formatDistance = (business: SearchResult) => {
    return "1.2 km"; // Mock distance - replace with actual calculation
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-gray-900">AI Business</span>
            </Link>
            
            <div className="flex-1 max-w-2xl relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search businesses..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  className="pl-10 pr-4 h-12 text-lg border-2 border-gray-200 rounded-full focus:border-blue-500 focus:ring-0"
                />
              </div>

              {/* Search Suggestions */}
              {showSuggestions && searchResponse?.suggestions && (
                <Card className="absolute top-full mt-2 w-full z-50 border-gray-200 shadow-lg">
                  <CardContent className="p-4">
                    <h4 className="text-sm font-medium text-gray-600 mb-3">Suggestions</h4>
                    <div className="space-y-1">
                      {searchResponse.suggestions.slice(0, 4).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <Search className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-700">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <Button 
              onClick={() => handleSearch()}
              disabled={!query.trim() || loading}
              size="lg"
              className="px-6 rounded-full"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Search Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Searching...</p>
          </div>
        ) : (
          <>
            {/* Empty State - when no search query */}
            {!results.length && !query && (
              <div className="max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-6xl mb-6">🏢</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Discover Local Businesses
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Search for restaurants, services, healthcare, and more
                  </p>
                </div>

                {/* Trending Searches */}
                <div className="mt-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                    Popular Searches
                  </h3>
                  <div className="flex flex-wrap justify-center gap-3">
                    {[
                      "Italian restaurants near me",
                      "Emergency dental care", 
                      "Auto repair shops",
                      "Hair salons",
                      "24/7 pharmacies",
                      "Coffee shops",
                      "Plumbers near me",
                      "Gyms and fitness"
                    ].map((trending, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(trending)}
                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700 hover:text-gray-900"
                      >
                        {trending}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Categories */}
                <div className="mt-12">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">
                    Browse by Category
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { name: 'Restaurants', icon: '🍽️', query: 'restaurants' },
                      { name: 'Healthcare', icon: '🏥', query: 'doctors clinics' },
                      { name: 'Services', icon: '🔧', query: 'home services' },
                      { name: 'Shopping', icon: '🛍️', query: 'stores shopping' }
                    ].map((category, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(category.query)}
                        className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center group"
                      >
                        <div className="text-3xl mb-2">{category.icon}</div>
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {category.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
              <>
                {/* Search Stats */}
                <div className="text-sm text-gray-600 mb-4">
                  About {searchResponse?.resultCount?.toLocaleString() || results.length.toLocaleString()} results
                  {searchResponse?.searchTime && (
                    <span> ({searchResponse.searchTime}ms)</span>
                  )}
                </div>

                {/* AI Summary Card */}
                {searchResponse?.aiSummary && (
                  <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Search className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">Search Summary</h3>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {searchResponse.aiSummary}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* No Results */}
                {results.length === 0 && query && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No results found for "{query}"
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Try different keywords or check your spelling
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setQuery('');
                        router.push('/');
                      }}
                    >
                      Back to Home
                    </Button>
                  </div>
                )}

                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((business) => (
                    <GMBBusinessCard 
                      key={business.id} 
                      business={{
                        ...business,
                        verified: business.verification_status === 'verified',
                        ai_enabled: business.ai_agent_enabled,
                        tagline: business.description?.substring(0, 50) + '...',
                        hours: business.hours || {},
                        images: business.logo_url ? [business.logo_url] : []
                      }}
                      showDistance={true}
                      distance={formatDistance(business)}
                      onClick={() => router.push(`/business/${business.slug}`)}
                    />
                  ))}
                </div>

                {/* Related Queries */}
                {searchResponse?.relatedQueries && searchResponse.relatedQueries.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Searches</h3>
                    <div className="flex flex-wrap gap-3">
                      {searchResponse.relatedQueries.map((relatedQuery, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          onClick={() => handleSuggestionClick(relatedQuery)}
                          className="hover:bg-blue-50 hover:border-blue-300"
                        >
                          <Search className="w-4 h-4 mr-2" />
                          {relatedQuery}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}