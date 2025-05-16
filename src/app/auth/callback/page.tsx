'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCallback() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Auth callback error:', sessionError)
          setError(sessionError.message)
          setLoading(false)
          return
        }

        if (session) {
          setSuccess(true)
          setLoading(false)
          
          // Delay redirect to show success message
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        } else {
          setError('No session found. Please try signing in again.')
          setLoading(false)
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setError('An unexpected error occurred. Please try again.')
        setLoading(false)
      }
    }

    handleAuthCallback()
  }, [router])

  return (
<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">      
    <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>
            {loading && 'Completing Sign In...'}
            {success && 'Sign In Successful!'}
            {error && 'Sign In Failed'}
          </CardTitle>
          <CardDescription>
            {loading && 'Please wait while we complete your authentication.'}
            {success && 'You will be redirected to your dashboard shortly.'}
            {error && 'There was an issue with your authentication.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {loading && (
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          
          {success && (
            <div className="flex justify-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          )}
          
          {error && (
            <div className="flex justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          {error && (
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full"
            >
              Back to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}