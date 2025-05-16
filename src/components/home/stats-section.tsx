/**
 * FILE: /src/components/home/stats-section.tsx
 * PURPOSE: Trust signals and stats
 */

import { Building, Users, Star, MapPin } from 'lucide-react'

const stats = [
  {
    icon: Building,
    value: '50,000+',
    label: 'Verified Businesses',
    color: 'text-blue-600'
  },
  {
    icon: Users,
    value: '1M+',
    label: 'Happy Customers',
    color: 'text-green-600'
  },
  {
    icon: Star,
    value: '2M+',
    label: 'Genuine Reviews',
    color: 'text-yellow-600'
  },
  {
    icon: MapPin,
    value: '500+',
    label: 'Cities Covered',
    color: 'text-purple-600'
  }
]

export function StatsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Millions
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Join the community that&apos;s revolutionizing local business discovery
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}