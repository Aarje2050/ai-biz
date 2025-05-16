/**
 * FILE: /src/components/home/location-promo.tsx
 * PURPOSE: City-specific promotional banner
 */

import { Sparkles, Star, Gift, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface LocationPromoProps {
  city: string
}

const getPromoData = (city: string) => {
  const promoData: Record<string, any> = {
    'Delhi': {
      title: 'Discover Delhi\'s Best Businesses',
      subtitle: 'From Chandni Chowk to CP - Find everything local',
      highlight: '50+ New Restaurants',
      action: 'Explore Delhi',
      gradient: 'from-red-500 to-orange-500',
      icon: TrendingUp
    },
    'Mumbai': {
      title: 'Mumbai\'s Business Hub',
      subtitle: 'From Bandra to Borivali - Connect with locals',
      highlight: '100+ Verified Services',
      action: 'Explore Mumbai',
      gradient: 'from-blue-500 to-purple-500',
      icon: Star
    },
    'Udaipur': {
      title: 'City of Lakes Business Directory',
      subtitle: 'Heritage meets modern business',
      highlight: 'Tourist-friendly Services',
      action: 'Explore Udaipur',
      gradient: 'from-pink-500 to-purple-500',
      icon: Gift
    },
    'Bangalore': {
      title: 'Silicon Valley of India',
      subtitle: 'Tech-savvy businesses at your fingertips',
      highlight: 'AI-Powered Services',
      action: 'Explore Bangalore',
      gradient: 'from-green-500 to-blue-500',
      icon: Sparkles
    }
  }

  return promoData[city] || {
    title: `Discover ${city}'s Best Businesses`,
    subtitle: 'Find local businesses with AI assistance',
    highlight: 'Verified Services',
    action: `Explore ${city}`,
    gradient: 'from-blue-500 to-purple-500',
    icon: Star
  }
}

export function LocationPromo({ city }: LocationPromoProps) {
  const promo = getPromoData(city)
  const Icon = promo.icon

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className={`bg-gradient-to-r ${promo.gradient} rounded-3xl p-8 text-white overflow-hidden relative`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-[url('data:image/svg+xml,%3Csvg "></div>
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-8 h-8" />
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {promo.highlight}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {promo.title}
              </h2>
              <p className="text-white/90 text-lg mb-6">
                {promo.subtitle}
              </p>
              <Button asChild variant="secondary" size="lg" className="bg-white text-gray-900 hover:bg-white/90">
                <Link href={`/search?city=${city}`}>
                  {promo.action}
                </Link>
              </Button>
            </div>

            {/* Floating Elements */}
            <div className="relative hidden md:block">
              <div className="absolute top-4 right-4 bg-white/10 backdrop-blur rounded-full p-4">
                <Star className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="absolute bottom-4 left-4 bg-white/10 backdrop-blur rounded-full p-4">
                <Sparkles className="w-6 h-6 text-blue-300" />
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold mb-2">AI</div>
                <div className="text-white/80">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}