// Common API response types
export interface ApiResponse<T = any> {
    data?: T
    error?: string
    message?: string
    success: boolean
  }
  
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
  
  // AI Agent types
  export interface AIAgentMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: string
    business_id: string
  }
  
  export interface AIAgentConfig {
    enabled: boolean
    model: string
    max_tokens: number
    temperature: number
    system_prompt: string
  }
  
  export interface VoiceSettings {
    enabled: boolean
    voice: string
    rate: number
    pitch: number
    volume: number
  }
  
  // Search types
  export interface SearchQuery {
    query: string
    filters?: {
      category?: string
      location?: string
      verified?: boolean
    }
    sort?: {
      field: string
      direction: 'asc' | 'desc'
    }
    pagination?: {
      page: number
      limit: number
    }
  }
  
  // Error types
  export interface ErrorResponse {
    error: string
    details?: string
    code?: string
  }