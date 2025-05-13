'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  Phone, 
  Mail, 
  Star,
  Menu,
  X,
  ChevronDown,
  ExternalLink,
  
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

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

interface NavigationItem {
  id: string
  label: string
  href: string
}

interface CTAItem {
  id: string
  label: string
  icon: any
  variant: 'default' | 'outline'
}

interface BusinessHeaderProps {
  business: Business
  currentSection: string
  onSectionChange: (section: string) => void
  navigation: NavigationItem[]
  ctaItems: CTAItem[]
  onCall: () => void
  onWriteReview: () => void
  isScrolled: boolean
}

export function BusinessHeader({ 
  business, 
  currentSection,
  onSectionChange,
  navigation,
  ctaItems,
  onCall,
  onWriteReview,
  isScrolled
}: BusinessHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Get current status (simplified)
  const isCurrentlyOpen = () => {
    const now = new Date()
    const currentHour = now.getHours()
    return currentHour >= 9 && currentHour <= 18
  }
  
  // Handle CTA actions
  const handleCTAClick = (itemId: string) => {
    switch (itemId) {
      case 'call':
        onCall()
        break
      case 'review':
        onWriteReview()
        break
      default:
        break
    }
  }
  
  // Close mobile menu when section changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentSection])
  
  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white border-b'
    )}>
      {/* Top quick info bar (hidden on scroll) */}
      <div className={cn(
        'bg-gray-50 transition-all duration-300 overflow-hidden',
        isScrolled ? 'h-0' : 'h-auto'
      )}>
        <div className="container max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {business.verified && (
                <div className="flex items-center gap-1 text-green-600">
                  <Star className="w-3 h-3" />
                  <span>Verified Business</span>
                </div>
              )}
              <Badge 
                variant={isCurrentlyOpen() ? 'default' : 'destructive'}
                className="text-white"
              >
                {isCurrentlyOpen() ? 'Open Now' : 'Closed'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {business.phone && (
                <a 
                  href={`tel:${business.phone}`} 
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span className="hidden sm:inline">{business.phone}</span>
                </a>
              )}
              {business.email && (
                <a 
                  href={`mailto:${business.email}`} 
                  className="flex items-center gap-1 hover:text-green-600 transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span className="hidden sm:inline">Email</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Business branding */}
          <div className="flex items-center gap-4">
            <Avatar className={cn(
              'transition-all duration-300',
              isScrolled ? 'w-10 h-10' : 'w-12 h-12'
            )}>
              <AvatarImage src={business.logo_url || ''} alt={business.name} />
              <AvatarFallback className="text-lg font-bold bg-blue-500 text-white">
                {business.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className={cn(
                'font-bold transition-all duration-300 text-gray-900',
                isScrolled ? 'text-lg' : 'text-xl'
              )}>
                {business.name}
              </h1>
              <div className={cn(
                'flex items-center gap-2 transition-all duration-300',
                isScrolled ? 'hidden' : 'block'
              )}>
                <Badge variant="outline" className="text-xs">{business.category}</Badge>
                {business.city && (
                  <span className="text-sm text-gray-600">
                    {business.city}, {business.state}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <div className="flex items-center gap-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    currentSection === item.id 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  {item.label}
                  {item.id === 'chat' && business.ai_enabled && (
                    <div className="inline-block w-2 h-2 bg-green-500 rounded-full ml-2" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-gray-300 mx-4" />
            
            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              {ctaItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleCTAClick(item.id)}
                  variant={item.variant}
                  size="sm"
                  className={cn(
                    'flex items-center gap-2',
                    item.variant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Quick CTA for mobile */}
            <Button
              onClick={onCall}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Phone className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-white/95 backdrop-blur-md shadow-lg">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-between',
                    currentSection === item.id 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  <span>{item.label}</span>
                  {item.id === 'chat' && business.ai_enabled && (
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
            
            {/* Mobile CTA Buttons */}
            <div className="pt-4 mt-4 border-t space-y-2">
              {ctaItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => handleCTAClick(item.id)}
                  variant={item.variant}
                  size="lg"
                  className={cn(
                    'w-full flex items-center justify-center gap-2',
                    item.variant === 'default' ? 'bg-blue-600 hover:bg-blue-700' : ''
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}