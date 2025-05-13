/**
 * File: src/components/business/business-layout.tsx
 * 
 * Note: This component is now deprecated as we're using a single-page design
 * The BusinessProfile component directly renders everything including the header
 */
'use client'

import { Footer } from '@/components/layout/footer'

interface Business {
  id: string
  name: string
  slug: string
  category: string
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  logo_url: string | null
  verified: boolean
  ai_enabled: boolean
  hours: any
}

interface BusinessLayoutProps {
  business: Business
  children: React.ReactNode
}

export function BusinessLayout({ business, children }: BusinessLayoutProps) {
  // This component is now simplified since BusinessProfile handles its own header
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}