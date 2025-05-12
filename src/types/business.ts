export interface Business {
    id: string
    user_id: string
    name: string
    slug: string
    description: string | null
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
    created_at: string
    updated_at: string
  }
  
  export interface BusinessHours {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
  }
  
  export interface CreateBusinessInput {
    name: string
    description?: string
    category: string
    phone?: string
    email?: string
    website?: string
    address?: string
    city?: string
    state?: string
    zip_code?: string
    hours?: BusinessHours
    logo_url?: string
    ai_prompt?: string
  }
  
  export interface UpdateBusinessInput extends Partial<CreateBusinessInput> {
    id: string
    verified?: boolean
    ai_enabled?: boolean
  }
  
  export interface BusinessCategory {
    id: string
    name: string
    description: string
    icon: string
  }
  
  export interface BusinessSearchFilters {
    query?: string
    category?: string
    city?: string
    state?: string
    verified?: boolean
    page?: number
    limit?: number
  }
  
  export interface BusinessListResponse {
    businesses: Business[]
    total: number
    page: number
    limit: number
    totalPages: number
  }