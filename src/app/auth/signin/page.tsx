'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { AuthForms } from '@/components/forms/auth-forms'
import { Loader2 } from 'lucide-react'

export default function SignInPage() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, loading, router])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Don't render anything if user is authenticated (prevents flash)
  if (isAuthenticated) {
    return null
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">     
  <div className="w-full max-w-md">
        {/* <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Business Directory
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Connect with businesses powered by AI
          </p>
        </div> */}
        <AuthForms view="sign_in" redirectTo="/dashboard" />
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <a 
              href="/auth/signup" 
              className="font-medium text-primary hover:underline"
            >
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
    
  )
}