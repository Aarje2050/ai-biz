'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import type { Profile } from '@/lib/supabase/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Create or update profile after authentication
  const createOrUpdateProfile = async (user: User) => {
    try {
      // First try to get existing profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (existingProfile) {
        // Update existing profile
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            email: user.email || '',
            full_name: user.user_metadata?.full_name || existingProfile.full_name,
            phone: user.user_metadata?.phone || existingProfile.phone,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating profile:', updateError)
          return existingProfile
        }
        return updatedProfile
      } else {
        // Create new profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
            is_admin: false,
            is_super_admin: false,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          return null
        }
        return newProfile
      }
    } catch (error) {
      console.error('Error in createOrUpdateProfile:', error)
      return null
    }
  }

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      if (!supabase) {
        console.error('Supabase client not available')
        if (mounted) {
          setLoading(false)
          setError('Authentication service unavailable')
        }
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          if (mounted) {
            setError('Failed to get session')
            setLoading(false)
          }
          return
        }

        if (mounted) {
          setUser(session?.user ?? null)
          setError(null)
        }
        
        // Get or create user profile if user exists
        if (session?.user && mounted) {
          const profile = await createOrUpdateProfile(session.user)
          if (mounted) {
            setProfile(profile)
          }
        }
      } catch (error) {
        console.error('Unexpected error in getInitialSession:', error)
        if (mounted) {
          setError('An unexpected error occurred')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase?.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (!mounted) return

        setUser(session?.user ?? null)
        setError(null)
        
        // Handle different auth events
        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const profile = await createOrUpdateProfile(session.user)
            if (mounted) {
              setProfile(profile)
            }
          } catch (error) {
            console.error('Error handling sign in:', error)
            if (mounted) {
              setError('Failed to load user profile')
            }
          }
        } else if (event === 'SIGNED_OUT') {
          if (mounted) {
            setProfile(null)
          }
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Optionally refetch profile on token refresh
          console.log('Token refreshed for user:', session.user.email)
        }
        
        if (mounted) {
          setLoading(false)
        }
      }
    ) || { subscription: { unsubscribe: () => {} } }

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
        setError('Failed to sign out')
      } else {
        setUser(null)
        setProfile(null)
        setError(null)
      }
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  // Refresh user data
  const refreshUser = async () => {
    if (!user) return

    try {
      setLoading(true)
      const profile = await createOrUpdateProfile(user)
      setProfile(profile)
      setError(null)
    } catch (error) {
      console.error('Error refreshing user data:', error)
      setError('Failed to refresh user data')
    } finally {
      setLoading(false)
    }
  }

  // Check if user has specific role
  const hasRole = (role: 'admin' | 'super_admin' | 'business_owner') => {
    if (!profile) return false
    
    switch (role) {
      case 'admin':
        return profile.is_admin || profile.is_super_admin
      case 'super_admin':
        return profile.is_super_admin
      case 'business_owner':
        // This would need to be implemented based on business ownership
        // For now, we'll just check if user has created any businesses
        return true // Placeholder - implement based on your business logic
      default:
        return false
    }
  }

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user && !!profile,
    isAdmin: hasRole('admin'),
    isSuperAdmin: hasRole('super_admin'),
    isBusinessOwner: hasRole('business_owner'),
    signOut,
    refreshUser,
    hasRole,
  }
}