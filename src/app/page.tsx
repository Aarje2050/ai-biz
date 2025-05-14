'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, TrendingUp, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// Popular categories data
const popularCategories = [
  { name: 'Restaurants', icon: '🍽️', count: '2,500+', slug: 'restaurants' },
  { name: 'Healthcare', icon: '🏥', count: '1,200+', slug: 'healthcare' },
  { name: 'Professional Services', icon: '💼', count: '800+', slug: 'professional-services' },
  { name: 'Home Services', icon: '🔧', count: '1,500+', slug: 'home-services' },
  { name: 'Retail & Shopping', icon: '🛍️', count: '900+', slug: 'retail-shopping' },
  { name: 'Beauty & Wellness', icon: '💆', count: '600+', slug: 'beauty-wellness' },
];

// Trending searches
const trendingSearches = [
  'Italian restaurants near me',
  'Emergency dentist',
  'Auto repair shops',
  'Hair salons',
  '24/7 pharmacies',
  'Pizza delivery'
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleTrendingClick = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleCategoryClick = (slug: string) => {
    router.push(`/categories/${slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      

      {/* Main Search Section */}
      <main className="max-w-4xl mx-auto px-4 pt-20 pb-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Find Local Businesses
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Discover verified businesses with AI-powered search
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search for restaurants, services, doctors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                className="w-full pl-11 pr-4 py-4 text-lg rounded-full border-2 border-gray-200 focus:border-blue-500 focus:ring-0"
              />
            </div>
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                size="lg"
                className="px-8 rounded-full"
              >
                Search Businesses
              </Button>
            </div>
          </div>
        </div>

        {/* Trending Searches */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-6">
            <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
            <span className="text-sm font-medium text-gray-500">Trending Searches</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {trendingSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleTrendingClick(search)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
              >
                {search}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Categories */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Popular Categories
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {popularCategories.map((category) => (
              <Card 
                key={category.slug}
                className="hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => handleCategoryClick(category.slug)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{category.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{category.count} businesses</p>
                  <ArrowRight className="w-4 h-4 mx-auto text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 AI Business Directory. Find and connect with local businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}