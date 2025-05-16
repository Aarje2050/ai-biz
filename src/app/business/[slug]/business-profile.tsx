'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { BusinessHeader } from '@/components/business/business-header'
import { AIAgent } from '@/components/business/ai-agent'
import { BusinessDetails } from '@/components/business/business-details'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { BusinessReviewsSection } from '@/app/business/[slug]/business-reviews-section';

import { Button } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Separator } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { 
    MapPin, 
    Phone, 
    Mail, 
    Globe, 
    Clock,
    Star,
    Camera,
    MessageCircle,
    Pencil,
    ExternalLink,
    Share2,
    CheckCircle,
    Navigation,
    Sparkles,
    Award,
    Map,         // Use this instead of MapIcon
    Users,
    Target,
    X
  
} from 'lucide-react'

interface BusinessProfileProps {
  business: {
    id: string
            user_id: string
            name: string
            slug: string
            description: string | null
            tagline: string | null  // Add this
            category: string
            phone: string | null
            email: string | null
            website: string | null
            address: string | null
            city: string | null
            state: string | null
            zip_code: string | null
            hours: any | null
            images: string[]
            logo_url: string | null
            verified: boolean
            ai_enabled: boolean
            ai_prompt: string | null
            social_media: any  // Add this
            whatsapp_enabled: boolean  // Add this
            status: string  // Add this
            created_at: string
            updated_at: string
            // Make these optional with default handling
    rating?: number
    review_count?: number
  }
}

const navigation = [
    { id: 'overview', label: 'Overview', href: '#overview' },
    { id: 'reviews', label: 'Reviews', href: '#reviews' },  // Add this line
    { id: 'gallery', label: 'Gallery', href: '#gallery' },
    { id: 'hours', label: 'Hours', href: '#hours' },
    { id: 'contact', label: 'Contact', href: '#contact' },
  ]

const ctaItems = [
  { id: 'call', label: 'Call Now', icon: Phone, variant: 'default' as const },
  { id: 'review', label: 'Write Review', icon: Pencil, variant: 'outline' as const },
]

// Add these state variables at the top of your BusinessProfile component





export function BusinessProfile({ business }: BusinessProfileProps) {
    const [showFloatingChat, setShowFloatingChat] = useState(false)
const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('overview')
  const [isScrolled, setIsScrolled] = useState(false)
  const sectionsRef = useRef<{ [key: string]: HTMLElement | null }>({})

  // Initialize floating chat after 2 seconds (add this useEffect)
useEffect(() => {
    if (business.ai_enabled) {
      const timer = setTimeout(() => {
        setShowFloatingChat(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [business.ai_enabled])

  // Format address
  const fullAddress = [business.address, business.city, business.state, business.zip_code]
    .filter(Boolean)
    .join(', ')

  // Check if currently open
  const getCurrentStatus = () => {
    const now = new Date()
    const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const currentHours = business.hours?.[day]
    return currentHours && currentHours !== 'Closed' ? 'Open Now' : 'Closed'
  }

  // Handle scroll spy for navigation
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 100)

      // Update active section based on scroll position
      const offset = 120
      for (const section of navigation) {
        const element = sectionsRef.current[section.id]
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= offset && rect.bottom >= offset) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Call once to set initial state
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle section navigation
  const handleNavigate = (sectionId: string) => {
    const element = sectionsRef.current[sectionId]
    if (element) {
      const offset = 100
      const top = element.offsetTop - offset
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  // Handle phone call
  const handleCall = () => {
    if (business.phone) {
      window.location.href = `tel:${business.phone}`
    }
  }

  // Handle review writing (placeholder)
  const handleWriteReview = () => {
    // Scroll to reviews section
    handleNavigate('reviews');
    
    // Optional: Trigger the review modal
    // You can pass a callback to BusinessReviewsSection to trigger the modal
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Business-specific Header */}
      <BusinessHeader 
        business={business}
        currentSection={activeSection}
        onSectionChange={handleNavigate}
        navigation={navigation}
        ctaItems={ctaItems}
        onCall={handleCall}
        onWriteReview={handleWriteReview}
        isScrolled={isScrolled}
      />

   {/* Replace your hero section with this cleaner, professional version */}
<section 
  id="overview" 
  ref={(el) => { sectionsRef.current.overview = el }}
  className="pt-24 pb-16 bg-white"
>
  <div className="container max-w-7xl mx-auto px-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Column - Content */}
      <div className="space-y-8">
        {/* Business Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                {business.tagline}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-grey-600 border-grey-200">
                  {business.category}
                </Badge>
                {business.verified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Verified</span>
                  </div>
                )}
                <Badge variant={getCurrentStatus() === 'Open Now' ? 'success' : 'destructive'}>
                  {getCurrentStatus()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Business Description */}
          <div className="space-y-4">
            <p className="text-lg text-gray-600 leading-relaxed">
              {business.description || `Professional ${business.category.toLowerCase()} services providing quality and excellence.`}
            </p>
            
            {/* Quick Info */}
            {/* // In business-profile.tsx, update the Quick Info section (around line 180) */}
<div className="flex flex-wrap gap-4 text-sm text-gray-600">
  {business.city && (
    <div className="flex items-center gap-1">
      <MapPin className="w-4 h-4 text-gray-400" />
      <span>{business.city}, {business.state}</span>
    </div>
  )}
  {business.ai_enabled && (
    <div className="flex items-center gap-1">
      <Sparkles className="w-4 h-4 text-blue-500" />
      <span>AI Assistant Available</span>
    </div>
  )}
  {/* Add review info with optional handling */}
  {(business.review_count || 0) > 0 && (
    <div className="flex items-center gap-1">
      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
      <span>{business.rating || 0} ({business.review_count || 0} reviews)</span>
    </div>
  )}
</div>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          {business.phone && (
            <Button 
              size="lg" 
              onClick={handleCall}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleWriteReview}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="w-5 h-5 mr-2" />
            Write Review
          </Button>
        </div>
      </div>

      {/* Right Column - Gallery Preview */}
      <div className="relative">
        {business.images && business.images.length > 0 ? (
          <div className="relative">
            {/* Main large image */}
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 shadow-lg">
              <Image
                src={business.images[0]}
                alt={`${business.name} main image`}
                fill
                className="object-cover"
              />
            </div>
            
            {/* Image count badge */}
            {business.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                +{business.images.length - 1} more photos
              </div>
            )}
            
            {/* Small overlay for see all photos */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 rounded-xl cursor-pointer group" 
                 onClick={() => handleNavigate('gallery')}>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 absolute inset-0 flex items-center justify-center">
                <Button variant="secondary" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  View Gallery
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder when no images */
          <div className="aspect-[4/3] rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
            <Camera className="w-16 h-16 mb-4" />
            <p className="text-lg font-medium">No photos available</p>
            <p className="text-sm">Check back soon for updates</p>
          </div>
        )}
      </div>
    </div>
  </div>
</section>

      {/* Gallery Section */}
      <section 
        id="gallery" 
        ref={(el) => { sectionsRef.current.gallery = el }}
        className="py-12 bg-gray-50"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Gallery</h2>
          {business.images && business.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {business.images.map((image: string, index: number) => (
                <div 
                  key={index}
                  className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer"
                >
                  <Image
                    src={image}
                    alt={`${business.name} photo ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
              ))}
            </div>
          ) : (
            <Card className="py-12">
              <CardContent className="text-center">
                <Camera className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No photos yet</h3>
                <p className="text-gray-600">This business hasn't added photos to their gallery.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Hours Section */}
      <section 
        id="hours" 
        ref={(el) => { sectionsRef.current.hours = el }}
        className="py-12 bg-white"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Business Hours</h2>
          <div className="max-w-2xl">
            <BusinessDetails
              businessId={business.id}
              businessHours={business.hours}
              verified={business.verified}
              aiEnabled={business.ai_enabled}
              category={business.category}
              businessName={business.name}
            />
          </div>
        </div>

      </section>

      {/* Contact Section */}
      <section 
        id="contact" 
        ref={(el) => { sectionsRef.current.contact = el }}
        className="py-12 bg-gray-50"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Get in Touch</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send a Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button className="w-full">
                  Send Message
                </Button>
              </CardContent>
            </Card>

            {/* Contact Details & Map */}
            <div className="space-y-6">
              {/* Contact Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.phone && (
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-sm text-gray-600">{business.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {business.email && (
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-sm text-gray-600">{business.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {fullAddress && (
                    <div className="flex items-start gap-4 p-4 bg-red-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600 mt-1" />
                      <div>
                        <p className="font-medium">Address</p>
                        <address className="not-italic text-sm text-gray-600">
                          {fullAddress}
                        </address>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>


              {/* Map Placeholder */}
              {fullAddress && (
                <Card className="overflow-hidden">
                  <div className="aspect-video relative bg-gray-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Button asChild variant="default">
                        <a 
                          href={`https://maps.google.com?q=${encodeURIComponent(fullAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          View on Google Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
      
              {/* Reviews Section */}

      <section 
  id="reviews" 
  ref={(el) => { sectionsRef.current.reviews = el }}
  className="py-12 bg-white"
>
  <div className="container max-w-7xl mx-auto px-4">
    <BusinessReviewsSection business={business} />
  </div>
</section>

      {/* Add this floating chat widget just before the closing div of your main component */}
{/* Floating AI Chat Widget */}
{business.ai_enabled && showFloatingChat && (
  <div className="fixed bottom-4 right-4 z-50">
    {!isChatOpen ? (
      <Button
        onClick={() => setIsChatOpen(true)}
        className="rounded-full w-16 h-16 bg-blue-600 hover:bg-blue-700 shadow-lg group relative"
        size="lg"
      >
        <MessageCircle className="w-7 h-7 transition-transform group-hover:scale-110" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
          <Sparkles className="w-3 h-3" />
        </div>
        {/* Tooltip */}
        <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Chat with AI Assistant
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900"></div>
        </div>
      </Button>
    ) : (
      <div className="w-80 h-96 bg-white rounded-lg shadow-2xl border relative">
        <AIAgent 
          business={business}
          isFloating={true}
          showHeader={true}
          className="w-full h-full"
        />
        <Button
          onClick={() => setIsChatOpen(false)}
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 w-8 h-8 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )}
  </div>
)}

{/* Powered by AI Footer Badge */}
<div className="fixed bottom-4 left-4 z-40">
  <div className="bg-white rounded-full px-4 py-2 shadow-lg border flex items-center gap-2">
    <Sparkles className="w-4 h-4 text-blue-600" />
    <span className="text-sm font-medium text-gray-700">AI-Powered Business</span>
  </div>
</div>

      {/* AI Chat Section */}
      {business.ai_enabled && (
        <section 
          id="chat" 
          ref={(el) => { sectionsRef.current.chat = el }}
          className="py-12 bg-white"
        >
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">AI Assistant</h2>
            <div className="max-w-4xl mx-auto">
              <AIAgent 
                business={business}
                showHeader={true}
                className="w-full h-[600px]"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  )
}