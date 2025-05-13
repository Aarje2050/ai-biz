// TypeScript definitions for Supabase database tables
// This file defines the structure of our database tables

export interface Database {
    public: {
      Tables: {
        businesses: {
          Row: {
            id: string
            user_id: string
            name: string
            slug: string
            description: string | null
            tagline: string | null  // Add this
            category: string
            phone: string | null
            email: string | null
            website: string | null
            address: string | null
            city: string | null
            state: string | null
            zip_code: string | null
            hours: BusinessHours | null
            images: string[]
            logo_url: string | null
            verified: boolean
            ai_enabled: boolean
            ai_prompt: string | null
            social_media: any  // Add this
            whatsapp_enabled: boolean  // Add this
            status: string  // Add this
            created_at: string
            updated_at: string
          }
          Insert: {
            id: string
            user_id: string
            name: string
            slug: string
            description: string | null
            tagline: string | null  // Add this
            category: string
            phone: string | null
            email: string | null
            website: string | null
            address: string | null
            city: string | null
            state: string | null
            zip_code: string | null
            hours: BusinessHours | null
            images: string[]
            logo_url: string | null
            verified: boolean
            ai_enabled: boolean
            ai_prompt: string | null
            social_media: any  // Add this
            whatsapp_enabled: boolean  // Add this
            status: string  // Add this
            created_at: string
            updated_at: string
          }
          Update: {
            id: string
            user_id: string
            name: string
            slug: string
            description: string | null
            tagline: string | null  // Add this
            category: string
            phone: string | null
            email: string | null
            website: string | null
            address: string | null
            city: string | null
            state: string | null
            zip_code: string | null
            hours: BusinessHours | null
            images: string[]
            logo_url: string | null
            verified: boolean
            ai_enabled: boolean
            ai_prompt: string | null
            social_media: any  // Add this
            whatsapp_enabled: boolean  // Add this
            status: string  // Add this
            created_at: string
            updated_at: string
          }
        }
        profiles: {
          Row: {
            id: string
            email: string
            full_name: string | null
            avatar_url: string | null
            is_admin: boolean
            is_super_admin: boolean
            is_active: boolean
            deactivated_at: string | null
            created_at: string
            updated_at: string
          }
          Insert: {
            id: string
            email: string
            full_name?: string | null
            avatar_url?: string | null
            is_admin?: boolean
            is_super_admin?: boolean
            is_active?: boolean
            deactivated_at?: string | null
            created_at?: string
            updated_at?: string
          }
          Update: {
            id?: string
            email?: string
            full_name?: string | null
            avatar_url?: string | null
            is_admin?: boolean
            is_super_admin?: boolean
            is_active?: boolean
            deactivated_at?: string | null
            created_at?: string
            updated_at?: string
          }
        }
        // Add other tables here as needed
      }
      Views: {
        // Define views here if you have any
      }
      Functions: {
        // Define custom functions here if you have any
      }
      Enums: {
        // Define enums here if you have any
      }
    }
  }
  
  // Helper types for specific use cases
  export interface BusinessHours {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  
  // Type alias for easier use
  export type Business = Database['public']['Tables']['businesses']['Row']
  export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
  export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']
  
  export type Profile = Database['public']['Tables']['profiles']['Row']
  export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
  export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
  
  // Common query types
  export type BusinessWithProfile = Business & {
    profile?: Profile
  }
  
  // Search and filter types
  export interface BusinessSearchParams {
    query?: string
    category?: string
    city?: string
    state?: string
    verified?: boolean
    page?: number
    limit?: number
    sortBy?: 'name' | 'created_at' | 'category'
    sortOrder?: 'asc' | 'desc'
  }
  
  // API response types
  export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
  
  // Business categories enum (you can add more as needed)
  export enum BusinessCategory {
    RESTAURANT = 'Restaurant',
    RETAIL = 'Retail',
    HEALTHCARE = 'Healthcare',
    BEAUTY_WELLNESS = 'Beauty & Wellness',
    AUTOMOTIVE = 'Automotive',
    PROFESSIONAL_SERVICES = 'Professional Services',
    HOME_GARDEN = 'Home & Garden',
    ENTERTAINMENT = 'Entertainment',
    FITNESS_RECREATION = 'Fitness & Recreation',
    TECHNOLOGY = 'Technology',
    REAL_ESTATE = 'Real Estate',
    FINANCIAL_SERVICES = 'Financial Services',
    EDUCATION = 'Education',
    TRAVEL_HOSPITALITY = 'Travel & Hospitality',
    OTHER = 'Other'
  }
  
  // State enums (you can add more states as needed)
  export enum USState {
    AL = 'Alabama',
    AK = 'Alaska',
    AZ = 'Arizona',
    AR = 'Arkansas',
    CA = 'California',
    CO = 'Colorado',
    CT = 'Connecticut',
    DE = 'Delaware',
    FL = 'Florida',
    GA = 'Georgia',
    HI = 'Hawaii',
    ID = 'Idaho',
    IL = 'Illinois',
    IN = 'Indiana',
    IA = 'Iowa',
    KS = 'Kansas',
    KY = 'Kentucky',
    LA = 'Louisiana',
    ME = 'Maine',
    MD = 'Maryland',
    MA = 'Massachusetts',
    MI = 'Michigan',
    MN = 'Minnesota',
    MS = 'Mississippi',
    MO = 'Missouri',
    MT = 'Montana',
    NE = 'Nebraska',
    NV = 'Nevada',
    NH = 'New Hampshire',
    NJ = 'New Jersey',
    NM = 'New Mexico',
    NY = 'New York',
    NC = 'North Carolina',
    ND = 'North Dakota',
    OH = 'Ohio',
    OK = 'Oklahoma',
    OR = 'Oregon',
    PA = 'Pennsylvania',
    RI = 'Rhode Island',
    SC = 'South Carolina',
    SD = 'South Dakota',
    TN = 'Tennessee',
    TX = 'Texas',
    UT = 'Utah',
    VT = 'Vermont',
    VA = 'Virginia',
    WA = 'Washington',
    WV = 'West Virginia',
    WI = 'Wisconsin',
    WY = 'Wyoming'
  }
  
  // Validation schemas (you can use these with Zod)
  export interface BusinessValidation {
    name: string
    category: string
    description?: string
    phone?: string
    email?: string
    website?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    hours?: BusinessHours
    logoUrl?: string
    aiPrompt?: string
  }