/**
 * File: src/app/api/admin/users/[id]/deactivate/route.ts
 * 
 * API route for deactivating users
 */
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is super admin (only super admins can deactivate users)
    const supabase = createRouteHandlerSupabaseClient(cookies())
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', currentUser.id)
      .single()

    if (!currentUserProfile?.is_super_admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      )
    }

    // Prevent users from deactivating themselves
    if (params.id === currentUser.id) {
      return NextResponse.json(
        { error: 'Cannot deactivate your own account' },
        { status: 403 }
      )
    }

    // Get user to deactivate
    const { data: userToDeactivate } = await supabase
      .from('profiles')
      .select('email, is_super_admin')
      .eq('id', params.id)
      .single()

    if (!userToDeactivate) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user to remove admin privileges and mark as inactive
    const { error } = await supabase
      .from('profiles')
      .update({
        is_admin: false,
        is_super_admin: false,
        is_active: false,
        deactivated_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)

    if (error) {
      console.error('Error deactivating user:', error)
      return NextResponse.json(
        { error: 'Failed to deactivate user' },
        { status: 500 }
      )
    }

    // TODO: You might also want to:
    // 1. Terminate all active sessions for this user
    // 2. Send notification email
    // 3. Log the action in an audit trail

    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })

  } catch (error) {
    console.error('Deactivate user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}