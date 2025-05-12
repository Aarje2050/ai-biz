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

/**
 * Check if the current user is an admin
 */
export async function isAdmin() {
  const user = await getServerUser()
  if (!user) return false

  const supabase = createServerSupabaseClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  return profile?.is_admin === true
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