import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Better error messages for missing environment variables
if (!supabaseUrl) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  console.log('Current env NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
}

if (!supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  console.log('Current env NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey)
}

// Only create client if we have the required environment variables
let supabase: any = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    /**
     * Supabase client for use in components
     * This client is configured for client-side use and handles auth automatically
     */
    supabase = createClientComponentClient<Database>()
  } catch (error) {
    console.error('Error creating Supabase client:', error)
    console.log('URL:', supabaseUrl)
    console.log('Key length:', supabaseAnonKey?.length || 'undefined')
  }
} else {
  console.error('Cannot create Supabase client - missing environment variables')
  console.log('Make sure your .env.local file has:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
}

/**
 * Create a new Supabase client instance
 * Used when you need a fresh client instance
 */
export function createSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing required environment variables for Supabase client')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}

// Export the client (could be null if env vars are missing)
export { supabase }

// Re-export types from types.ts
export type { Database } from './types'