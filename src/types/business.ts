/**
 * ================================================================
 * FILE: /src/types/business.ts
 * PURPOSE: Enhanced business type definitions matching database schema
 * STATUS: ✅ Updated for comprehensive schema
 * ================================================================
 */

// Business type enum (matches database)
export type BusinessType = 'service' | 'store' | 'restaurant' | 'professional'

// Business status enum (matches database)
export type BusinessStatus = 'draft'|'pending' | 'active' | 'suspended' | 'rejected'

// Verification status enum (matches database)
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'requires_update'

// Plan type enum (matches database)
export type PlanType = 'free' | 'premium' | 'super_premium'

// Social media links interface
export interface SocialMediaLinks {
  facebook?: string | null
  instagram?: string | null
  twitter?: string | null
  linkedin?: string | null
  youtube?: string | null
}

// Business hours interface
export interface BusinessHours {
  monday?: string | null
  tuesday?: string | null
  wednesday?: string | null
  thursday?: string | null
  friday?: string | null
  saturday?: string | null
  sunday?: string | null
}

// Main Business interface (matches database schema)
export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  description: string | null
  short_description?: string | null
  category_id?: string | null
  category?: string // For backward compatibility
  business_type: BusinessType
  
  // Contact information
  email: string | null
  phone: string | null
  website: string | null
  social_media?: SocialMediaLinks | null
  
  // Address and location
  address: string | null
  address_2?: string | null
  city: string | null
  state: string | null
  postal_code?: string | null
  zip_code?: string | null // For backward compatibility
  country?: string
  latitude?: number | null
  longitude?: number | null
  timezone?: string
  
  // Business hours
  business_hours?: BusinessHours | null
  hours?: BusinessHours | null // For backward compatibility
  
  // Media
  logo_url: string | null
  cover_image_url?: string | null
  images: string[]
  videos?: string[]
  
  // Status and verification
  status: BusinessStatus
  verification_status: VerificationStatus
  verification_notes?: string | null
  verification_documents?: string[]
  verified_at?: string | null
  verified_by?: string | null
  verified?: boolean // For backward compatibility
  
  // Plan and features
  plan: PlanType
  plan_started_at?: string | null
  plan_expires_at?: string | null
  ai_agent_enabled: boolean
  ai_enabled?: boolean // For backward compatibility
  custom_domain?: string | null
  
  // SEO
  meta_title?: string | null
  meta_description?: string | null
  keywords?: string[]
  
  // Stats (readonly)
  views_count: number
  rating: number
  review_count: number
  ai_interaction_count: number
  
  // Additional data
  tags?: string[]
  amenities?: string[]
  payment_methods?: string[]
  languages_spoken?: string[]
  
  // AI configuration
  ai_prompt?: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// Business section configuration
export interface BusinessSection {
  id: string
  business_id: string
  section_type: string
  is_enabled: boolean
  is_visible: boolean
  sort_order: number
  config?: Record<string, any>
  permissions?: Record<string, any>
  created_at: string
  updated_at: string
}

// Default sections for each business type
export const DEFAULT_BUSINESS_SECTIONS: Record<BusinessType, string[]> = {
  restaurant: ['menu', 'table_booking', 'reviews', 'gallery', 'jobs'],
  service: ['services', 'appointments', 'reviews', 'gallery', 'jobs'],
  store: ['products', 'reviews', 'gallery', 'jobs', 'news'],
  professional: ['services', 'appointments', 'reviews', 'gallery', 'jobs']
}

// Create business input interface
export interface CreateBusinessInput {
  name: string
  business_type: BusinessType
  description?: string
  short_description?: string
  category?: string
  
  // Contact
  phone?: string
  email?: string
  website?: string
  social_media?: SocialMediaLinks
  
  // Location
  address?: string
  address_2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  latitude?: number
  longitude?: number
  
  // Hours
  business_hours?: BusinessHours
  
  // Media
  logo_url?: string
  cover_image_url?: string
  images?: string[]
  videos?: string[]
  
  // SEO
  meta_title?: string
  meta_description?: string
  keywords?: string[]
  
  // Additional
  tags?: string[]
  amenities?: string[]
  payment_methods?: string[]
  languages_spoken?: string[]
  
  // AI
  ai_prompt?: string
}

// Update business input interface
export interface UpdateBusinessInput extends Partial<CreateBusinessInput> {
  id: string
  status?: BusinessStatus
  verification_status?: VerificationStatus
  plan?: PlanType
  ai_agent_enabled?: boolean
}

// Business category interface
export interface BusinessCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon_url?: string
  parent_id?: string | null
  level: number
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Business search filters
export interface BusinessSearchFilters {
  query?: string
  business_type?: BusinessType
  category?: string
  city?: string
  state?: string
  country?: string
  status?: BusinessStatus
  verification_status?: VerificationStatus
  plan?: PlanType
  rating_min?: number
  amenities?: string[]
  tags?: string[]
  has_ai_agent?: boolean
  
  // Pagination
  page?: number
  limit?: number
  
  // Sorting
  sort_by?: 'name' | 'rating' | 'created_at' | 'views_count'
  sort_order?: 'asc' | 'desc'
  
  // Location-based
  latitude?: number
  longitude?: number
  radius_km?: number
}

// Business list response
export interface BusinessListResponse {
  businesses: Business[]
  total: number
  page: number
  limit: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

// Business form data interface (for React Hook Form)
export interface BusinessFormData {
  // Basic info
  name: string
  business_type: BusinessType
  description: string
  short_description?: string
  category?: string
  tagline?: string
  
  // Contact
  phone?: string
  whatsapp_enabled?: boolean
  email?: string
  website?: string
  
  // Social media
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  youtube?: string
  
  // Location
  address?: string
  address_2?: string
  city?: string
  state?: string
  postal_code?: string
  zipCode?: string // For form compatibility
  country?: string
  
  // Business hours (form fields)
  mondayHours?: string
  tuesdayHours?: string
  wednesdayHours?: string
  thursdayHours?: string
  fridayHours?: string
  saturdayHours?: string
  sundayHours?: string
  
  // File uploads
  logoFile?: FileList
  images?: FileList
  
  // Additional
  tags?: string[]
  amenities?: string[]
  payment_methods?: string[]
  languages_spoken?: string[]
  
  // SEO
  meta_title?: string
  meta_description?: string
  keywords?: string[]
  
  // AI
  ai_prompt?: string
  ai_agent_enabled?: boolean
  
  // Sections configuration
  sections?: {
    [key: string]: {
      enabled: boolean
      visible: boolean
      sort_order: number
    }
  }
}

// Business stats interface
export interface BusinessStats {
  id: string
  business_id: string
  date: string
  page_views: number
  unique_visitors: number
  ai_interactions: number
  phone_clicks: number
  website_clicks: number
  direction_requests: number
  email_clicks: number
  appointments_booked: number
  orders_placed: number
  revenue: number
  search_appearances: number
  search_clicks: number
  created_at: string
}

// Business integration interface
export interface BusinessIntegration {
  id: string
  business_id: string
  integration_type: string
  config: Record<string, any>
  is_active: boolean
  last_sync?: string | null
  sync_status: string
  created_at: string
  updated_at: string
}

// Export default for main categories
export default DEFAULT_BUSINESS_SECTIONS