/**
 * File: src/app/auth/error/page.tsx
 * 
 * Auth error page for handling authentication errors
 */
'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { AlertTriangle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function ErrorMessage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'access_denied':
        return 'Access was denied. You may have cancelled the sign-in process.'
      case 'server_error':
        return 'A server error occurred. Please try again later.'
      case 'temporarily_unavailable':
        return 'The service is temporarily unavailable. Please try again later.'
      default:
        return error || 'An unknown error occurred during authentication.'
    }
  }

  return (
    <p className="text-center text-muted-foreground">
      {getErrorMessage(error)}
    </p>
  )
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Authentication Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Suspense fallback={<div className="text-center text-muted-foreground">Loading...</div>}>
            <ErrorMessage />
          </Suspense>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/auth/signin">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}