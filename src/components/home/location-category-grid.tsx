/**
 * FILE: /src/components/home/location-category-grid.tsx
 * PURPOSE: Clean category grid
 */

import { Utensils, Scissors, Stethoscope, Dumbbell, ShoppingBag, Wrench, Car, Briefcase } from 'lucide-react'
import Link from 'next/link'

interface CategoryGridProps {
  city: string
}

const categories = [
  { name: 'Restaurants', icon: Utensils, slug: 'restaurants' },
  { name: 'Beauty & Spa', icon: Scissors, slug: 'beauty-spa' },
  { name: 'Healthcare', icon: Stethoscope, slug: 'healthcare' },
  { name: 'Fitness', icon: Dumbbell, slug: 'fitness' },
  { name: 'Shopping', icon: ShoppingBag, slug: 'shopping' },
  { name: 'Home Services', icon: Wrench, slug: 'home-services' },
  { name: 'Automotive', icon: Car, slug: 'automotive' },
  { name: 'Professional', icon: Briefcase, slug: 'professional' },
]

export function LocationCategoryGrid({ city }: CategoryGridProps) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
          Browse Categories
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon
            
            return (
              <Link
                key={category.slug}
                href={`/search?category=${category.slug}&city=${city}`}
                className="group"
              >
                <div className="bg-white p-6 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-50">
                    <Icon className="w-6 h-6 text-gray-600 group-hover:text-blue-600" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                    {category.name}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}