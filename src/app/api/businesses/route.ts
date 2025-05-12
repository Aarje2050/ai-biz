import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const category = searchParams.get('category')
    const city = searchParams.get('city')
    const verified = searchParams.get('verified')
    
    // Build query
    let query = supabase
      .from('businesses')
      .select('*', { count: 'exact' })
      .eq('verified', true) // Only show verified businesses publicly
      .order('created_at', { ascending: false })
    
    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (city) {
      query = query.eq('city', city)
    }
    
    if (verified === 'true') {
      query = query.eq('verified', true)
    }
    
    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)
    
    const { data: businesses, error, count } = await query
    
    if (error) {
      console.error('Error fetching businesses:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch businesses' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: businesses,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        hasNextPage: count ? page * limit < count : false,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Name and category are required' },
        { status: 400 }
      )
    }
    
    // Create business
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        ...body,
        user_id: session.user.id,
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating business:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create business' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: business,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}