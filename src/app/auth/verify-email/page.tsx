import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Mail } from 'lucide-react'
import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Mail className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent you a verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            We've sent a verification email to your address. Please click the link 
            in the email to verify your account and complete the registration process.
          </p>
          
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm">
              <strong>Didn't receive the email?</strong>
              <br />
              Check your spam folder or{' '}
              <Link 
                href="/auth/signin" 
                className="text-primary hover:underline"
              >
                try signing in
              </Link>
              {' '}if you already verified.
            </p>
          </div>

          <div className="pt-4">
            <Link 
              href="/auth/signin" 
              className="text-sm text-primary hover:underline"
            >
              ← Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}