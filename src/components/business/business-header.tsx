/**
 * File: src/components/business/business-header.tsx
 * 
 * Business-specific header that replaces the main header on business pages
 */
'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  Phone, 
  Mail, 
  Globe, 
  MapPin,
  Star,
  Menu,
  X,
  Clock,
  MessageCircle,
  Share2,
  BookOpen,
  Calendar,
  Camera,
  Info
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

interface BusinessHeaderProps {
  business: Business
  currentSection?: string
}

export function BusinessHeader({ business, currentSection = 'overview' }: BusinessHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Info, href: '#overview' },
    { id: 'hours', label: 'Hours', icon: Clock, href: '#hours' },
    { id: 'contact', label: 'Contact', icon: Phone, href: '#contact' },
    { id: 'gallery', label: 'Gallery', icon: Camera, href: '#gallery' },
    { id: 'chat', label: 'Chat', icon: MessageCircle, href: '#chat', badge: business.ai_enabled },
  ]
  
  // Get current status (open/closed)
  const isCurrentlyOpen = () => {
    // Simplified check - you can expand this logic
    const now = new Date()
    const currentHour = now.getHours()
    return currentHour >= 9 && currentHour <= 18 // Basic 9-6 check
  }
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      {/* Top bar */}
      <div className="bg-muted/30 py-2">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {business.verified && (
              <div className="flex items-center gap-1 text-green-600">
                <Star className="w-3 h-3" />
                <span>Verified Business</span>
              </div>
            )}
            {isCurrentlyOpen() ? (
              <Badge className="bg-green-500 text-white">Open Now</Badge>
            ) : (
              <Badge variant="outline">Closed</Badge>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-primary">
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">{business.phone}</span>
              </a>
            )}
            <Button size="sm" variant="ghost">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Share</span>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Business branding */}
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 md:w-16 md:h-16">
              <AvatarImage src={business.logo_url || ''} alt={business.name} />
              <AvatarFallback className="text-lg font-bold">
                {business.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h1 className="text-xl md:text-2xl font-bold">{business.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{business.category}</Badge>
                {business.city && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {business.city}, {business.state}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Primary actions - desktop */}
          <div className="hidden md:flex items-center gap-2">
            {business.phone && (
              <Button size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            )}
            {business.ai_enabled && (
              <Button variant="outline" size="lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat Now
              </Button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
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
      
      {/* Navigation */}
      <div className="border-t bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 border-transparent transition-colors whitespace-nowrap',
                  currentSection === item.id 
                    ? 'text-primary border-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {item.badge && <div className="w-2 h-2 bg-primary rounded-full" />}
              </Link>
            ))}
          </nav>
          
          {/* Mobile navigation */}
          {isMobileMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              <div className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-medium transition-colors',
                      currentSection === item.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {item.badge && <Badge className="text-xs px-2 py-1">New</Badge>}
                  </Link>
                ))}
              </div>
              
              {/* Quick actions in mobile menu */}
              <div className="pt-4 mt-4 border-t space-y-2">
                {business.phone && (
                  <Button className="w-full" size="lg">
                    <Phone className="w-4 h-4 mr-2" />
                    Call {business.name}
                  </Button>
                )}
                {business.ai_enabled && (
                  <Button variant="outline" className="w-full" size="lg">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                )}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}