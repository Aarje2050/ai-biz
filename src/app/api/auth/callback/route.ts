/**
 * File: src/app/api/auth/callback/route.ts
 * 
 * Auth callback handler for Supabase authentication
 */
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=${encodeURIComponent(error.message)}`)
      }

      // If user signs in successfully, create or update their profile
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        // If profile doesn't exist, create one
        if (profileError && profileError.code === 'PGRST116') {
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name || null,
              is_admin: false,
              is_super_admin: false,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
        }
      }

      // Redirect to dashboard or home page
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } catch (error) {
      console.error('Unexpected auth callback error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?error=unexpected_error`)
    }
  }

  // If no code parameter, redirect to sign in
  return NextResponse.redirect(`${requestUrl.origin}/auth/signin`)
}