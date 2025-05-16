'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireAdmin = false,
  redirectTo = '/auth/signin'
}: AuthGuardProps) {
  const { user, profile, loading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // If admin access is required but user is not admin
    if (requireAdmin && !isAdmin) {
      router.push('/dashboard') // Or show "access denied" page
      return
    }

   // If user is authenticated but trying to access auth pages, redirect to dashboard
if (isAuthenticated && (typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/'))) {
    router.push('/dashboard')
    return
  }
  }, [loading, isAuthenticated, isAdmin, requireAuth, requireAdmin, router, redirectTo])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is required but user is not authenticated, show nothing (will redirect)
  if (requireAuth && !isAuthenticated) {
    return null
  }

  // If admin is required but user is not admin, show nothing (will redirect)
  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean
    requireAdmin?: boolean
    redirectTo?: string
  } = {}
) {
  const WrappedComponent = (props: P) => (
    <AuthGuard {...options}>
      <Component {...props} />
    </AuthGuard>
  )

  WrappedComponent.displayName = `withAuthGuard(${Component.displayName || Component.name})`
  return WrappedComponent
}