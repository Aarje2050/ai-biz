export interface User {
    id: string
    email: string
    created_at: string
    updated_at: string
  }
  
  export interface Profile {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    is_admin: boolean
    created_at: string
    updated_at: string
  }
  
  export interface CreateProfileInput {
    full_name?: string
    avatar_url?: string
  }
  
  export interface UpdateProfileInput extends Partial<CreateProfileInput> {
    id: string
  }