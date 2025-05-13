/**
 * File: src/app/api/admin/businesses/[id]/verify/route.ts
 * 
 * API route for business verification actions (approve/reject)
 */
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(
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

    // Parse request body
    const { action, notes } = await request.json()

    // Validate input
    if (!action || !['approve', 'reject', 'pending'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or pending' },
        { status: 400 }
      )
    }

    if (action === 'reject' && (!notes || !notes.trim())) {
      return NextResponse.json(
        { error: 'Notes are required when rejecting a business' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerSupabaseClient(cookies())

    // First, verify the business exists
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

    // Prepare update data
    let updateData: any = {
      updated_at: new Date().toISOString(),
      verification_notes: notes || null
    }

    switch (action) {
      case 'approve':
        updateData.verified = true
        updateData.rejected_at = null
        break
      case 'reject':
        updateData.verified = false
        updateData.rejected_at = new Date().toISOString()
        break
      case 'pending':
        updateData.verified = false
        updateData.rejected_at = null
        break
    }

    // Update the business
    const { error: updateError } = await supabase
      .from('businesses')
      .update(updateData)
      .eq('id', params.id)

    if (updateError) {
      console.error('Error updating business:', updateError)
      return NextResponse.json(
        { error: 'Failed to update business' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: `Business ${action}ed successfully`,
        data: {
          businessId: params.id,
          action,
          notes
        }
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Verification API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET method to fetch current verification status
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

    const { data: business, error } = await supabase
      .from('businesses')
      .select(`
        id,
        name,
        verified,
        rejected_at,
        verification_notes,
        updated_at
      `)
      .eq('id', params.id)
      .single()

    if (error || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: business
    })

  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}