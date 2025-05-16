import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { generateSlug } from '@/lib/utils'
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

// Helper function to generate unique slug
async function generateUniqueSlug(supabase: any, baseName: string, excludeId?: string): Promise<string> {
  let slug = generateSlug(baseName);
  let counter = 0;
  
  while (true) {
    const testSlug = counter === 0 ? slug : `${slug}-${counter}`;
    
    // Check if slug exists (exclude current business if updating)
    let query = supabase
      .from('businesses')
      .select('id')
      .eq('slug', testSlug);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data } = await query.single();
    
    // If no existing business found, this slug is available
    if (!data) {
      return testSlug;
    }
    
    counter++;
    
    // Safety check to prevent infinite loop
    if (counter > 100) {
      return `${slug}-${Date.now()}`;
    }
  }
}

// Replace the POST function in /api/businesses/route.ts:

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
    
    // Generate unique slug
    const uniqueSlug = await generateUniqueSlug(supabase, body.name);
    
    // Create business with unique slug
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        ...body,
        owner_id: session.user.id,
        slug: uniqueSlug,
        // Use the status from body, default to pending if not provided
        status: body.status || 'pending',
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating business:', error)
      
      // If still a slug conflict, try again with timestamp
      if (error.code === '23505' && error.message.includes('businesses_slug_key')) {
        const timestampSlug = `${generateSlug(body.name)}-${Date.now()}`;
        
        const { data: retryBusiness, error: retryError } = await supabase
          .from('businesses')
          .insert({
            ...body,
            owner_id: session.user.id,
            slug: timestampSlug,
            status: body.status || 'pending',
          })
          .select()
          .single()
          
        if (retryError) {
          return NextResponse.json(
            { success: false, error: 'Failed to create business' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          data: retryBusiness,
        })
      }
      
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