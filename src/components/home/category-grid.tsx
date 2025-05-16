/**
 * FILE: /src/components/home/category-grid.tsx
 * PURPOSE: Popular categories with icons
 */

import { Utensils, Scissors, Stethoscope, Dumbbell, ShoppingBag, Wrench, GraduationCap, Car } from 'lucide-react'
import Link from 'next/link'

const categories = [
  { name: 'Restaurants', icon: Utensils, slug: 'restaurants', color: 'bg-orange-100 text-orange-600' },
  { name: 'Beauty & Spa', icon: Scissors, slug: 'beauty-spa', color: 'bg-pink-100 text-pink-600' },
  { name: 'Healthcare', icon: Stethoscope, slug: 'healthcare', color: 'bg-green-100 text-green-600' },
  { name: 'Fitness', icon: Dumbbell, slug: 'fitness', color: 'bg-purple-100 text-purple-600' },
  { name: 'Shopping', icon: ShoppingBag, slug: 'shopping', color: 'bg-blue-100 text-blue-600' },
  { name: 'Home Services', icon: Wrench, slug: 'home-services', color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Education', icon: GraduationCap, slug: 'education', color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Automotive', icon: Car, slug: 'automotive', color: 'bg-red-100 text-red-600' },
]

export function CategoryGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Find exactly what you&apos;re looking for in your neighborhood
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className="group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-center group-hover:-translate-y-1">
                  <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 ${category.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
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