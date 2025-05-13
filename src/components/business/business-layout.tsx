/**
 * File: src/components/business/business-layout.tsx
 * 
 * Layout component for business pages with custom header
 */
'use client'

import { BusinessHeader } from './business-header'
import { Footer } from '@/components/layout/footer'
import { useEffect, useState } from 'react'

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
  const [currentSection, setCurrentSection] = useState('overview')
  
  // Detect current section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['overview', 'hours', 'contact', 'gallery', 'chat']
      const scrollPosition = window.scrollY + 200
      
      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setCurrentSection(section)
            break
          }
        }
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <BusinessHeader business={business} currentSection={currentSection} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}