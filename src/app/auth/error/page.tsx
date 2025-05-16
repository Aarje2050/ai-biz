'use client'

import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An authentication error occurred'

  return (
<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">      
  <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-red-600">Authentication Error</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Please try signing in again. If the problem persists, contact support.
            </p>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button asChild>
              <Link href="/auth/signin">
                Back to Sign In
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                Go to Homepage
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}