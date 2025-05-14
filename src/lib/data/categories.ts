/**
 * ================================================================
 * FILE: /src/lib/data/categories.ts
 * PURPOSE: Business categories data structure
 * STATUS: ✅ Complete - matches database schema
 * ================================================================
 */

import { BusinessCategory } from '@/types/business'

// Main categories (level 0)
export const MAIN_CATEGORIES: BusinessCategory[] = [
  {
    id: '1',
    name: 'Food & Restaurants',
    slug: 'food-restaurants',
    description: 'Restaurants, cafes, and food services',
    icon_url: '/icons/restaurant.svg',
    parent_id: null,
    level: 0,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Healthcare',
    slug: 'healthcare',
    description: 'Doctors, dentists, hospitals, and medical services',
    icon_url: '/icons/healthcare.svg',
    parent_id: null,
    level: 0,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Professional Services',
    slug: 'professional-services',
    description: 'Lawyers, accountants, consultants, and other professionals',
    icon_url: '/icons/professional.svg',
    parent_id: null,
    level: 0,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Home Services',
    slug: 'home-services',
    description: 'Plumbers, electricians, cleaning services, and contractors',
    icon_url: '/icons/home-services.svg',
    parent_id: null,
    level: 0,
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Retail & Shopping',
    slug: 'retail-shopping',
    description: 'Stores, supermarkets, and shopping centers',
    icon_url: '/icons/retail.svg',
    parent_id: null,
    level: 0,
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Beauty & Wellness',
    slug: 'beauty-wellness',
    description: 'Salons, spas, gyms, and wellness centers',
    icon_url: '/icons/beauty.svg',
    parent_id: null,
    level: 0,
    sort_order: 6,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    name: 'Automotive',
    slug: 'automotive',
    description: 'Car dealers, repair shops, and automotive services',
    icon_url: '/icons/automotive.svg',
    parent_id: null,
    level: 0,
    sort_order: 7,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    name: 'Travel & Tourism',
    slug: 'travel-tourism',
    description: 'Hotels, travel agencies, and tourist attractions',
    icon_url: '/icons/travel.svg',
    parent_id: null,
    level: 0,
    sort_order: 8,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    name: 'Education',
    slug: 'education',
    description: 'Schools, colleges, training centers, and tutoring',
    icon_url: '/icons/education.svg',
    parent_id: null,
    level: 0,
    sort_order: 9,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '10',
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, events, recreation, and entertainment venues',
    icon_url: '/icons/entertainment.svg',
    parent_id: null,
    level: 0,
    sort_order: 10,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// Subcategories (level 1)
export const SUBCATEGORIES: BusinessCategory[] = [
  // Food & Restaurants subcategories
  {
    id: '1-1',
    name: 'Fine Dining',
    slug: 'fine-dining',
    description: 'Upscale restaurants and fine dining establishments',
    icon_url: '/icons/fine-dining.svg',
    parent_id: '1',
    level: 1,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1-2',
    name: 'Fast Food',
    slug: 'fast-food',
    description: 'Quick service restaurants and fast food chains',
    icon_url: '/icons/fast-food.svg',
    parent_id: '1',
    level: 1,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1-3',
    name: 'Cafes & Coffee',
    slug: 'cafes-coffee',
    description: 'Coffee shops, cafes, and tea houses',
    icon_url: '/icons/cafe.svg',
    parent_id: '1',
    level: 1,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1-4',
    name: 'Bakeries',
    slug: 'bakeries',
    description: 'Bakeries, pastry shops, and dessert places',
    icon_url: '/icons/bakery.svg',
    parent_id: '1',
    level: 1,
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '1-5',
    name: 'Delivery & Takeout',
    slug: 'delivery-takeout',
    description: 'Food delivery and takeout services',
    icon_url: '/icons/delivery.svg',
    parent_id: '1',
    level: 1,
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Healthcare subcategories
  {
    id: '2-1',
    name: 'General Physicians',
    slug: 'general-physicians',
    description: 'Family doctors and general practitioners',
    icon_url: '/icons/doctor.svg',
    parent_id: '2',
    level: 1,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2-2',
    name: 'Specialists',
    slug: 'specialists',
    description: 'Specialist doctors and consultants',
    icon_url: '/icons/specialist.svg',
    parent_id: '2',
    level: 1,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2-3',
    name: 'Dentists',
    slug: 'dentists',
    description: 'Dental clinics and oral care',
    icon_url: '/icons/dentist.svg',
    parent_id: '2',
    level: 1,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2-4',
    name: 'Hospitals',
    slug: 'hospitals',
    description: 'Hospitals and medical centers',
    icon_url: '/icons/hospital.svg',
    parent_id: '2',
    level: 1,
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2-5',
    name: 'Pharmacies',
    slug: 'pharmacies',
    description: 'Medicine stores and pharmacies',
    icon_url: '/icons/pharmacy.svg',
    parent_id: '2',
    level: 1,
    sort_order: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Professional Services subcategories
  {
    id: '3-1',
    name: 'Legal Services',
    slug: 'legal-services',
    description: 'Lawyers, legal consultants, notaries',
    icon_url: '/icons/legal.svg',
    parent_id: '3',
    level: 1,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3-2',
    name: 'Financial Services',
    slug: 'financial-services',
    description: 'Accountants, financial advisors, tax consultants',
    icon_url: '/icons/financial.svg',
    parent_id: '3',
    level: 1,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3-3',
    name: 'Consulting',
    slug: 'consulting',
    description: 'Business consultants, IT consultants, management advisors',
    icon_url: '/icons/consulting.svg',
    parent_id: '3',
    level: 1,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Home Services subcategories
  {
    id: '4-1',
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Plumbers, pipe repair, drain cleaning',
    icon_url: '/icons/plumbing.svg',
    parent_id: '4',
    level: 1,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4-2',
    name: 'Electrical',
    slug: 'electrical',
    description: 'Electricians, wiring, electrical repairs',
    icon_url: '/icons/electrical.svg',
    parent_id: '4',
    level: 1,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4-3',
    name: 'Cleaning Services',
    slug: 'cleaning-services',
    description: 'House cleaning, office cleaning, deep cleaning',
    icon_url: '/icons/cleaning.svg',
    parent_id: '4',
    level: 1,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4-4',
    name: 'HVAC',
    slug: 'hvac',
    description: 'Heating, ventilation, air conditioning services',
    icon_url: '/icons/hvac.svg',
    parent_id: '4',
    level: 1,
    sort_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Professional Services subcategories
  {
    id: '3-1',
    name: 'Legal Services',
    slug: 'legal-services',
    description: 'Lawyers, legal consultants, notaries',
    icon_url: '/icons/legal.svg',
    parent_id: '3',
    level: 1,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3-2',
    name: 'Financial Services',
    slug: 'financial-services',
    description: 'Accountants, financial advisors, tax consultants',
    icon_url: '/icons/financial.svg',
    parent_id: '3',
    level: 1,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3-3',
    name: 'Consulting',
    slug: 'consulting',
    description: 'Business consultants, IT consultants, management advisors',
    icon_url: '/icons/consulting.svg',
    parent_id: '3',
    level: 1,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // Retail & Shopping subcategories
  {
    id: '5-1',
    name: 'Grocery Stores',
    slug: 'grocery-stores',
    description: 'Supermarkets, convenience stores, organic stores',
    icon_url: '/icons/grocery.svg',
    parent_id: '5',
    level: 1,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5-2',
    name: 'Electronics',
    slug: 'electronics-retail',
    description: 'Electronics stores, mobile shops, computer stores',
    icon_url: '/icons/electronics.svg',
    parent_id: '5',
    level: 1,
    sort_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5-3',
    name: 'Clothing & Fashion',
    slug: 'clothing-fashion',
    description: 'Fashion stores, boutiques, shoe stores',
    icon_url: '/icons/clothing.svg',
    parent_id: '5',
    level: 1,
    sort_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// All categories combined
export const ALL_CATEGORIES = [...MAIN_CATEGORIES, ...SUBCATEGORIES]

// Helper functions
export const getCategoriesByParent = (parentId: string | null): BusinessCategory[] => {
  return ALL_CATEGORIES.filter(category => category.parent_id === parentId)
}

export const getMainCategories = (): BusinessCategory[] => {
  return MAIN_CATEGORIES
}

export const getSubcategories = (parentId: string): BusinessCategory[] => {
  return getCategoriesByParent(parentId)
}

export const getCategoryBySlug = (slug: string): BusinessCategory | undefined => {
  return ALL_CATEGORIES.find(category => category.slug === slug)
}

export const getCategoryById = (id: string): BusinessCategory | undefined => {
  return ALL_CATEGORIES.find(category => category.id === id)
}

// Category hierarchy helper
export const getCategoryHierarchy = (categoryId: string): BusinessCategory[] => {
  const category = getCategoryById(categoryId)
  if (!category) return []

  const hierarchy: BusinessCategory[] = [category]
  
  if (category.parent_id) {
    hierarchy.unshift(...getCategoryHierarchy(category.parent_id))
  }
  
  return hierarchy
}

// Business type to category mapping
export const BUSINESS_TYPE_CATEGORIES = {
  restaurant: ['1'], // Food & Restaurants
  service: ['2', '3', '4', '6'], // Healthcare, Professional, Home Services, Beauty
  store: ['5', '7'], // Retail, Automotive
  professional: ['2', '3', '9'], // Healthcare, Professional Services, Education
} as const

// Get suggested categories based on business type
export const getSuggestedCategories = (businessType: string) => {
  const categoryIds = BUSINESS_TYPE_CATEGORIES[businessType as keyof typeof BUSINESS_TYPE_CATEGORIES] || []
  return categoryIds.map(id => getCategoryById(id)).filter(Boolean) as BusinessCategory[]
}

// Simple category list for backward compatibility
export const SIMPLE_CATEGORIES = [
  'Restaurant',
  'Retail',
  'Healthcare', 
  'Beauty & Wellness',
  'Automotive',
  'Professional Services',
  'Home Services',
  'Entertainment',
  'Fitness & Recreation',
  'Technology',
  'Real Estate',
  'Financial Services',
  'Education',
  'Travel & Tourism',
  'Other'
]

export default ALL_CATEGORIES