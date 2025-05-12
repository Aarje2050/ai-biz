import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import Link from 'next/link'
import { 
  Utensils, 
  ShoppingBag, 
  Heart, 
  Scissors, 
  Car, 
  Briefcase, 
  Home, 
  Music, 
  Dumbbell, 
  Laptop, 
  Building, 
  DollarSign, 
  GraduationCap, 
  Plane, 
  MoreHorizontal 
} from 'lucide-react'

const categories = [
  {
    name: 'Restaurant',
    description: 'Dining, cafes, bars, and food services',
    icon: Utensils,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
  },
  {
    name: 'Retail',
    description: 'Stores, boutiques, and shopping centers',
    icon: ShoppingBag,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
  },
  {
    name: 'Healthcare',
    description: 'Medical services, clinics, and wellness',
    icon: Heart,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
  },
  {
    name: 'Beauty & Wellness',
    description: 'Salons, spas, and beauty services',
    icon: Scissors,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50',
  },
  {
    name: 'Automotive',
    description: 'Car services, dealerships, and repairs',
    icon: Car,
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
  },
  {
    name: 'Professional Services',
    description: 'Consulting, legal, accounting, and more',
    icon: Briefcase,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
  },
  {
    name: 'Home & Garden',
    description: 'Home improvement, landscaping, contractors',
    icon: Home,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
  },
  {
    name: 'Entertainment',
    description: 'Events, venues, and entertainment services',
    icon: Music,
    color: 'text-indigo-500',
    bgColor: 'bg-indigo-50',
  },
  {
    name: 'Fitness & Recreation',
    description: 'Gyms, sports, and recreational activities',
    icon: Dumbbell,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50',
  },
  {
    name: 'Technology',
    description: 'IT services, software, and tech support',
    icon: Laptop,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-50',
  },
  {
    name: 'Real Estate',
    description: 'Property services, agents, and management',
    icon: Building,
    color: 'text-teal-500',
    bgColor: 'bg-teal-50',
  },
  {
    name: 'Financial Services',
    description: 'Banking, insurance, and financial planning',
    icon: DollarSign,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
  },
  {
    name: 'Education',
    description: 'Schools, tutoring, and educational services',
    icon: GraduationCap,
    color: 'text-violet-500',
    bgColor: 'bg-violet-50',
  },
  {
    name: 'Travel & Hospitality',
    description: 'Hotels, travel agencies, and tourism',
    icon: Plane,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50',
  },
  {
    name: 'Other',
    description: 'Miscellaneous business categories',
    icon: MoreHorizontal,
    color: 'text-slate-500',
    bgColor: 'bg-slate-50',
  },
]

export default function CategoriesPage() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Business Categories</h1>
        <p className="text-muted-foreground text-lg">
          Discover businesses by category. Each listing includes an AI assistant to help answer your questions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Link key={category.name} href={`/browse?category=${encodeURIComponent(category.name)}`}>
              <Card className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-2`}>
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Card className="inline-block">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-2">Don't see your category?</h2>
            <p className="text-muted-foreground mb-4">
              We're always adding new categories to better serve our community.
            </p>
            <Link href="/auth/signup" className="text-primary hover:underline">
              List your business today →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}