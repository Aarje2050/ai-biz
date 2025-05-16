/**
 * FILE: /src/components/home/hero-section.tsx
 * PURPOSE: Hero with search + location detection
 */

'use client'

import { useState } from 'react'
import { Search, MapPin, Star } from 'lucide-react'
import { SearchBar } from './search-bar'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/10" />
      
      <div className="container mx-auto px-4 text-white relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Find Local
              <br />
              <span className="text-yellow-300">Businesses</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Discover the best restaurants, services, and stores near you
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <SearchBar />
          </div>

          {/* Quick Stats */}
          <div className="flex justify-center items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
              <span>1M+ Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-300" />
              <span>50K+ Businesses</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}