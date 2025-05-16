import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/types'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const { searchParams } = requestUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(new URL('/auth/error?message=Authentication failed', request.url))
      }
      
      if (data.session) {
        // Successful authentication - redirect to dashboard or specified next URL
        return NextResponse.redirect(new URL(next, request.url))
      }
    } catch (error) {
      console.error('Unexpected error during auth callback:', error)
      return NextResponse.redirect(new URL('/auth/error?message=Unexpected error occurred', request.url))
    }
  }

  // If no code or authentication failed, redirect to sign in
  return NextResponse.redirect(new URL('/auth/signin', request.url))
}