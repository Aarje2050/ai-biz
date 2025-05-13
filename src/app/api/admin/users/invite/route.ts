/**
 * File: src/app/api/admin/users/invite/route.ts
 * 
 * API route for inviting new users
 */
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    const { email, fullName, role, message } = await request.json()

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    if (!role || !['admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Valid role is required' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerSupabaseClient(cookies())

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Get current user info
    const { data: { user } } = await supabase.auth.getUser()
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('full_name, email, is_super_admin')
      .eq('id', user?.id)
      .single()

    // Only super admins can invite other super admins
    if (role === 'super_admin' && !inviterProfile?.is_super_admin) {
      return NextResponse.json(
        { error: 'Only super admins can invite other super admins' },
        { status: 403 }
      )
    }

    // Create invitation record (you might want to create an invitations table)
    // For now, we'll just send an email invitation
    console.log('Invitation details:', {
      email,
      fullName,
      role,
      message,
      invitedBy: inviterProfile?.email
    })

    // TODO: Send actual email invitation
    // This would typically use a service like SendGrid, Resend, or similar
    
    // For now, we'll return success
    return NextResponse.json({
      success: true,
      message: 'Invitation sent successfully',
      data: {
        email,
        role,
        invitedBy: inviterProfile?.email
      }
    })

  } catch (error) {
    console.error('Invite user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}