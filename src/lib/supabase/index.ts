// Export all Supabase clients and utilities from a single entry point

// Re-export client functions and supabase client for client components
export { supabase, createSupabaseClient } from './client'

// Re-export types - these are safe to import in both client and server components
export * from './types'

// NOTE: Server functions (from server.ts) should be imported directly 
// from '@/lib/supabase/server' in server components, not from this index file
// This prevents "next/headers" from being imported in client components