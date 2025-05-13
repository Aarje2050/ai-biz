/**
 * File: src/app/business/[slug]/page.tsx
 * 
 * A modern, user-friendly business directory page with enhanced UI/UX
 */
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { AIAgent } from '@/components/business/ai-agent'
import { BusinessDetails } from '@/components/business/business-details'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Star,
  MessageCircle,
  Navigation,
  ExternalLink,
  Clock,
  CheckCircle,
  Share2,
  Bookmark,
  Eye,
  Calendar,
  Camera,
  Map,
  Users,
  ThumbsUp,
  Award,
  Shield,
  Info
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'

// Keep existing interfaces
interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  hours: any
  images: string[]
  logo_url: string | null
  verified: boolean
  ai_enabled: boolean
  ai_prompt: string | null
  created_at: string
  updated_at: string
}

export default async function BusinessPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = createServerSupabaseClient()
  
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .eq('verified', true)
    .single()
  
  if (error || !business) {
    console.error('Business not found:', error)
    notFound()
  }
  
  // Format business hours for display
  const formatHours = (hours: any) => {
    if (!hours) return null
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    
    return days.map((day, index) => ({
      day: dayNames[index],
      dayShort: dayNames[index].slice(0, 3),
      hours: hours[day] || 'Closed'
    }))
  }
  
  const businessHours = formatHours(business.hours)
  const fullAddress = [business.address, business.city, business.state, business.zip_code]
    .filter(Boolean)
    .join(', ')

  // Check if business is currently open
  const getCurrentStatus = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // e.g., 'mon', 'tue'
    const currentHours = business.hours?.[day];
    return currentHours && currentHours !== 'Closed' ? 'Open Now' : 'Closed';
  }
  

  const status = getCurrentStatus()
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* SEO Schema.org data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": business.name,
            "image": business.logo_url || business.images?.[0],
            "description": business.description,
            "address": {
              "@type": "PostalAddress",
              "streetAddress": business.address,
              "addressLocality": business.city,
              "addressRegion": business.state,
              "postalCode": business.zip_code
            },
            "telephone": business.phone,
            "email": business.email,
            "url": business.website,
            "category": business.category
          })
        }}
      />
      
      {/* Modern Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background border-b border-border/50">
        <div className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column - Business Info */}
            <div className="flex-1 space-y-6">
              <div className="flex items-start gap-6">
                {/* Logo */}
                <Avatar className="w-24 h-24 rounded-xl border-4 border-white shadow-xl">
                  <AvatarImage src={business.logo_url || ''} alt={business.name} />
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {business.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Business Identity */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{business.name}</h1>
                    {business.verified && (
                      <Badge className="bg-green-500/10 text-green-600 border-green-200">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge 
                      variant="outline" 
                      className={status === 'Open Now' ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'}
                    >
                      {status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge variant="secondary" className="text-primary">
                      {business.category}
                    </Badge>
                    {fullAddress && (
                      <span className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {business.city}, {business.state}
                      </span>
                    )}
                  </div>

                  {business.description && (
                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                      {business.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {business.phone && (
                  <Button size="lg" className="flex-1 sm:flex-none">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                )}
                
                {business.website && (
                  <Button variant="outline" size="lg" className="flex-1 sm:flex-none" asChild>
                    <a href={business.website} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
                
                {fullAddress && (
                  <Button variant="outline" size="lg" className="flex-1 sm:flex-none" asChild>
                    <a 
                      href={`https://maps.google.com?q=${encodeURIComponent(fullAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                )}
                
                <Button variant="secondary" size="lg" className="flex-1 sm:flex-none">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Right Column - Quick Info */}
            <div className="lg:w-96">
              <Card className="shadow-lg border-primary/10">
                <CardContent className="p-6 space-y-6">
                  {/* Contact Info */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Quick Information
                    </h3>
                    <div className="space-y-3">
                      {business.phone && (
                        <a 
                          href={`tel:${business.phone}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Phone className="w-4 h-4 text-primary" />
                          <span>{business.phone}</span>
                        </a>
                      )}
                      {business.email && (
                        <a 
                          href={`mailto:${business.email}`}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <Mail className="w-4 h-4 text-primary" />
                          <span>{business.email}</span>
                        </a>
                      )}
                      {fullAddress && (
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <MapPin className="w-4 h-4 text-primary mt-1" />
                          <address className="not-italic text-sm">
                            {fullAddress}
                          </address>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Today's Hours */}
                  {businessHours && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Today's Hours
                      </h3>
                      <div className="bg-muted/50 rounded-lg p-3">
                        {businessHours[new Date().getDay()].hours}
                      </div>
                    </div>
                  )}

                  {/* AI Assistant CTA */}
                  {business.ai_enabled && (
                    <div className="pt-2">
                      <Button className="w-full" size="lg">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat with AI Assistant
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="hours">Hours</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              {/* About Tab */}
              <TabsContent value="about" className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-primary" />
                      About {business.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="prose prose-sm max-w-none">
                    {business.description ? (
                      <div dangerouslySetInnerHTML={{ __html: business.description }} />
                    ) : (
                      <p className="text-muted-foreground italic">
                        This business hasn't added a description yet.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Features/Highlights */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Features & Highlights
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {business.verified && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Shield className="w-5 h-5 text-primary" />
                          <span>Verified Business</span>
                        </div>
                      )}
                      {business.ai_enabled && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <MessageCircle className="w-5 h-5 text-primary" />
                          <span>AI Assistant</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                        <Award className="w-5 h-5 text-primary" />
                        <span>{business.category}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Photos Tab */}
              <TabsContent value="photos">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-primary" />
                      Photo Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {business.images && business.images.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {business.images.map((image: string, index: number) => (
                          <div 
                            key={index}
                            className="group aspect-square relative overflow-hidden rounded-xl"
                          >
                            <Image
                              src={image}
                              alt={`${business.name} photo ${index + 1}`}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No photos available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Hours Tab */}
              <TabsContent value="hours">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Business Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {businessHours ? (
                      <div className="space-y-2">
                        {businessHours.map(({ day, hours }) => (
                          <div 
                            key={day}
                            className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                          >
                            <span className="font-medium">{day}</span>
                            <span 
                              className={hours === 'Closed' ? 'text-red-500' : 'text-green-600'}
                            >
                              {hours}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        Business hours not available
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Tab */}
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                      <p className="text-muted-foreground mb-6">
                        Be the first to review {business.name}
                      </p>
                      <Button>
                        <Star className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Assistant */}
            {business.ai_enabled && (
              <div className="lg:sticky lg:top-4">
                <AIAgent 
                  business={business}
                  className="shadow-xl"
                />
              </div>
            )}

            {/* Map Card */}
            {fullAddress && (
              <Card className="shadow-lg overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center p-6">
                      <Map className="w-10 h-10 mx-auto mb-3 text-primary/50" />
                      <Button asChild variant="secondary" size="sm">
                        <a 
                          href={`https://maps.google.com?q=${encodeURIComponent(fullAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Get Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">
                    {fullAddress}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Business Details Component */}
            <BusinessDetails
              businessId={business.id}
              businessHours={businessHours}
              verified={business.verified}
              aiEnabled={business.ai_enabled}
              category={business.category}
              businessName={business.name}
            />
          </div>
        </div>
      </section>

      {/* Mobile AI Assistant */}
      {business.ai_enabled && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <AIAgent
            business={business}
            isFloating={true}
          />
        </div>
      )}
    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  
  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, category, images, logo_url, city, state')
    .eq('slug', params.slug)
    .single()
  
  if (!business) {
    return {
      title: 'Business Not Found | AI Business Directory',
      description: 'The requested business could not be found.',
    }
  }
  
  const title = `${business.name} - ${business.category} ${business.city ? `in ${business.city}, ${business.state}` : ''} | AI Business Directory`
  const description = business.description || `Visit ${business.name} for ${business.category} services in ${business.city}, ${business.state}. Chat with our AI assistant for instant answers and information.`
  
  return {
    title,
    description,
    keywords: [`${business.name}`, `${business.category}`, `${business.city}`, `${business.state}`, 'AI assistant', 'business directory'],
    openGraph: {
      title: business.name,
      description,
      type: 'website',
      images: [
        {
          url: business.logo_url || business.images?.[0] || '/default-business-image.jpg',
          width: 1200,
          height: 630,
          alt: business.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: business.name,
      description,
      images: [business.logo_url || business.images?.[0] || '/default-business-image.jpg'],
    },
    alternates: {
      canonical: `/business/${params.slug}`,
    },
  }
}