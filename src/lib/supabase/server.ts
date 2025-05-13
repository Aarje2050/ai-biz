import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './types'

/**
 * Create a Supabase client for server components
 * This is used in React Server Components
 */
export function createServerSupabaseClient(cookieStore = cookies()) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in server context')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!supabaseAnonKey)
    throw new Error('Missing required Supabase environment variables')
  }

  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

/**
 * Create a Supabase client for API routes
 * This is used in API route handlers
 */
export function createRouteHandlerSupabaseClient(cookieStore = cookies()) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in route handler')
    throw new Error('Missing required Supabase environment variables')
  }

  return createRouteHandlerClient<Database>({ cookies: () => cookieStore })
}

/**
 * Create a Supabase admin client with service role key
 * Use this for operations that require elevated permissions
 * ONLY use in server-side code and API routes
 */
export function createSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
  }
  if (!serviceRoleKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient<Database>(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/**
 * Get the current user from server context
 */
export async function getServerUser() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user ?? null
}

// File: src/lib/supabase/server.ts
// Updated isAdmin function with better error handling and profile creation

/**
 * Check if the current user is an admin
 * Uses admin client to bypass RLS and avoid recursion
 */
export async function isAdmin() {
  try {
    // First get the current user from the regular client
    const supabase = createServerSupabaseClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    console.log('Debug - Current user:', user?.id, user?.email)
    
    if (userError || !user) {
      console.log('Debug - No user or error:', userError)
      return false
    }

    // Use admin client to query profiles (bypasses RLS)
    const adminClient = createSupabaseAdmin()
    
    // Check if profile exists using admin client
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('is_admin, is_super_admin')
      .eq('id', user.id)
      .single()
    
    console.log('Debug - Profile data:', profile)
    console.log('Debug - Profile error:', profileError)
    
    // If profile doesn't exist, create one
    if (profileError && profileError.code === 'PGRST116') {
      console.log('Debug - Profile not found, creating new profile')
      
      const { data: newProfile, error: createError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          is_admin: false,
          is_super_admin: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('is_admin, is_super_admin')
        .single()
      
      if (createError) {
        console.error('Debug - Error creating profile:', createError)
        return false
      }
      
      console.log('Debug - New profile created:', newProfile)
      return newProfile?.is_admin || newProfile?.is_super_admin || false
    }
    
    if (profileError) {
      console.log('Debug - Profile error (not missing):', profileError)
      return false
    }
    
    if (!profile) {
      console.log('Debug - No profile found')
      return false
    }

    const isAdminUser = profile.is_admin || profile.is_super_admin
    console.log('Debug - Is admin check result:', isAdminUser)
    
    return isAdminUser
  } catch (error) {
    console.error('Debug - isAdmin function error:', error)
    return false
  }
}
/**
 * Verify that a user owns a business
 */
export async function verifyBusinessOwnership(businessId: string, userId?: string) {
  const user = userId || (await getServerUser())?.id
  if (!user) return false

  const supabase = createServerSupabaseClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('user_id')
    .eq('id', businessId)
    .single()

  return business?.user_id === user
}