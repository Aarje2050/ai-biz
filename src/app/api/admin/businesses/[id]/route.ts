/**
 * File: src/app/api/admin/businesses/[id]/route.ts
 * 
 * API routes for individual business management
 */
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// PATCH - Update business information
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const updates = await request.json()
    const supabase = createRouteHandlerSupabaseClient(cookies())
    
    // Remove any fields that shouldn't be updated directly
    const { id, user_id, created_at, verified, rejected_at, ...allowedUpdates } = updates
    
    // Update the business
    const { data: business, error } = await supabase
      .from('businesses')
      .update({
        ...allowedUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating business:', error)
      return NextResponse.json(
        { error: 'Failed to update business' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Business updated successfully',
      business
    })

  } catch (error) {
    console.error('Update business error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a business (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const supabase = createRouteHandlerSupabaseClient(cookies())
    
    // Check if business exists
    const { data: business, error: fetchError } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('id', params.id)
      .single()

    if (fetchError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    // Delete the business
    const { error: deleteError } = await supabase
      .from('businesses')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting business:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete business' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Business "${business.name}" deleted successfully`
    })

  } catch (error) {
    console.error('Delete business error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get business details (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const supabase = createRouteHandlerSupabaseClient(cookies())
    
    // Fetch business with owner profile
    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        *,
        profiles!inner(id, email, full_name)
      `)
      .eq('id', params.id)
      .single()

    if (error || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(business)

  } catch (error) {
    console.error('Get business error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}