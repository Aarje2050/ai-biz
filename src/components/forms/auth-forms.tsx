'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Mail, Phone, Chrome } from 'lucide-react'
import Link from 'next/link'

interface AuthFormsProps {
  view?: 'sign_in' | 'sign_up'
  redirectTo?: string
  onSuccess?: () => void
}

export function AuthForms({ view = 'sign_in', redirectTo, onSuccess }: AuthFormsProps) {
    const [activeTab, setActiveTab] = useState<'sign_in' | 'sign_up'>(view)
    const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const clearMessage = useCallback(() => setMessage(null), [])

  // Email/Password Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acceptTerms) {
      setMessage({ type: 'error', text: 'Please accept the terms and conditions' })
      return
    }
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }

    setLoading(true)
    clearMessage()

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo ? `${window.location.origin}${redirectTo}` : `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else if (data.user) {
        setMessage({
          type: 'success',
          text: 'Check your email for the confirmation link. You can close this tab after confirming.'
        })
        // Reset form
        setEmail('')
        setPassword('')
        setConfirmPassword('')
        setFullName('')
        setPhone('')
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Email/Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    clearMessage()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({ type: 'success', text: 'Signed in successfully!' })
        onSuccess?.()
        // Add manual redirect if onSuccess is not provided
        if (!onSuccess) {
          window.location.href = redirectTo || '/dashboard'
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setLoading(true)
    clearMessage()

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo ? `${window.location.origin}${redirectTo}` : `${window.location.origin}/dashboard`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
        setLoading(false)
      }
      // Don't set loading to false here for OAuth as user will be redirected
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong with Google sign in.' })
      setLoading(false)
    }
  }

  // Magic Link (Passwordless)
  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    setLoading(true)
    clearMessage()

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo ? `${window.location.origin}${redirectTo}` : `${window.location.origin}/dashboard`,
        }
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setMessage({
          type: 'success',
          text: 'Check your email for the magic link! You can close this tab after clicking the link.'
        })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  // Phone OTP (for future implementation)
  const handlePhoneSignIn = async () => {
    if (!phone) {
      setMessage({ type: 'error', text: 'Please enter your phone number' })
      return
    }

    setLoading(true)
    clearMessage()

    try {
      // For now, show coming soon message
      // In production, you would implement:
      // const { error } = await supabase.auth.signInWithOtp({ phone })
      setMessage({ type: 'error', text: 'Phone authentication coming soon!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong with phone authentication.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome {activeTab === 'sign_up' ? 'to Our Directory' : 'Back'}
          </CardTitle>
          <CardDescription className="text-center">
            {activeTab === 'sign_up' 
              ? 'Create your account to get started' 
              : 'Sign in to your account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'sign_in' | 'sign_up')} className="w-full">            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sign_in" disabled={loading}>Sign In</TabsTrigger>
              <TabsTrigger value="sign_up" disabled={loading}>Sign Up</TabsTrigger>
            </TabsList>

            {/* Sign In Tab */}
            <TabsContent value="sign_in" className="space-y-4">
              {/* Quick Sign In Options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Enter your password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </form>

              {/* Magic Link Option */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleMagicLink}
                  disabled={loading || !email}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Send Magic Link
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Enter your email above, then click to receive a magic link
                </p>
              </div>

              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="sign_up" className="space-y-4">
              {/* Quick Sign Up Options */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="name"
                    disabled={loading}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    placeholder="Enter your email"
                    type="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={loading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input
                    id="phone"
                    placeholder="+91 9876543210"
                    type="tel"
                    autoComplete="tel"
                    disabled={loading}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      placeholder="Create a password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={loading}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={loading}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading || !acceptTerms}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Status Messages */}
          {message && (
            <Alert className={`mt-4 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
              <AlertDescription className={message.type === 'error' ? 'text-red-700' : 'text-green-700'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}