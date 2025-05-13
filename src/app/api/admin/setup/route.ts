// File: src/app/api/admin/setup/route.ts
// API route to manually set up super admin

import { NextRequest, NextResponse } from 'next/server'
import { makeUserSuperAdmin } from '@/lib/utils/admin-setup'

export async function POST(request: NextRequest) {
  try {
    const { email, adminKey } = await request.json()
    
    // Simple admin setup key check (you can make this more sophisticated)
    const expectedKey = process.env.ADMIN_SETUP_KEY || 'super-admin-setup-key'
    
    if (adminKey !== expectedKey) {
      return NextResponse.json(
        { error: 'Invalid admin setup key' },
        { status: 403 }
      )
    }
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    console.log('Attempting to make user super admin:', email)
    const result = await makeUserSuperAdmin(email)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Admin setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}