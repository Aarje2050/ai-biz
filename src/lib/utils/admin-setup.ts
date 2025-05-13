// File: src/lib/utils/admin-setup.ts
// Utility function to manually set up super admin

import { createSupabaseAdmin } from '@/lib/supabase/server'

/**
 * Manually set a user as super admin
 * This should be used as a one-time setup script
 */
export async function makeUserSuperAdmin(userEmail: string) {
  try {
    // Use admin client with service role key
    const adminClient = createSupabaseAdmin()
    
    // Get the user by email
    const { data: users, error: listError } = await adminClient.auth.admin.listUsers()
    
    if (listError) {
      console.error('Error listing users:', listError)
      return { success: false, error: listError.message }
    }
    
    const user = users.users.find(u => u.email === userEmail)
    
    if (!user) {
      console.error('User not found:', userEmail)
      return { success: false, error: 'User not found' }
    }
    
    console.log('Found user:', user.id, user.email)
    
    // Check if profile exists
    const { data: existingProfile, error: profileCheckError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (profileCheckError && profileCheckError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      console.log('Creating new profile for user...')
      const { error: createError } = await adminClient
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          is_admin: true,
          is_super_admin: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      
      if (createError) {
        console.error('Error creating profile:', createError)
        return { success: false, error: createError.message }
      }
      
      console.log('Profile created successfully!')
    } else if (existingProfile) {
      // Profile exists, update it
      console.log('Updating existing profile...')
      const { error: updateError } = await adminClient
        .from('profiles')
        .update({
          is_admin: true,
          is_super_admin: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (updateError) {
        console.error('Error updating profile:', updateError)
        return { success: false, error: updateError.message }
      }
      
      console.log('Profile updated successfully!')
    }
    
    return { success: true, message: `User ${userEmail} is now a super admin` }
  } catch (error) {
    console.error('Error in makeUserSuperAdmin:', error)
    return { success: false, error: (error as Error).message }
  }
}