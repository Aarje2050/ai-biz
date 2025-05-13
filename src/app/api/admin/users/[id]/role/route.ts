/**
 * File: src/app/api/admin/users/[id]/role/route.ts
 * 
 * API route for updating user roles
 */
import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function PUT(
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

    const { role } = await request.json()

    // Validate role
    if (!role || !['user', 'admin', 'super_admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerSupabaseClient(cookies())

    // Get current user to check if they're super admin
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    const { data: currentUserProfile } = await supabase
      .from('profiles')
      .select('is_super_admin')
      .eq('id', currentUser?.id)
      .single()

    // Only super admins can assign super admin role
    if (role === 'super_admin' && !currentUserProfile?.is_super_admin) {
      return NextResponse.json(
        { error: 'Only super admins can assign super admin role' },
        { status: 403 }
      )
    }

    // Prevent users from modifying their own super admin status
    if (params.id === currentUser?.id && currentUserProfile?.is_super_admin && role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot remove your own super admin privileges' },
        { status: 403 }
      )
    }

    // Update user role
    const updateData: any = {
      is_admin: role === 'admin' || role === 'super_admin',
      is_super_admin: role === 'super_admin',
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', params.id)

    if (error) {
      console.error('Error updating user role:', error)
      return NextResponse.json(
        { error: 'Failed to update user role' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'User role updated successfully'
    })

  } catch (error) {
    console.error('Update user role error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}