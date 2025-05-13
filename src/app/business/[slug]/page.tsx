/**
 * File: src/app/business/[slug]/page.tsx
 * 
 * Professional business directory page with conversion-focused design
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
  Shield
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'

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
  
  // Fetch business by slug
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .eq('verified', true) // Only show verified businesses
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
  
  // Get first 3 images for gallery preview
  const galleryPreview = business.images?.slice(0, 3) || []
  const remainingImages = (business.images?.length || 0) - 3
  
  // Format full address for maps
  const fullAddress = [business.address, business.city, business.state, business.zip_code]
    .filter(Boolean)
    .join(', ')
  
  return (
    <div className="min-h-screen bg-background">
      {/* Schema.org structured data for SEO */}
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
            "category": business.category,
            "openingHours": businessHours?.map(h => h.hours !== 'Closed' ? `${h.day.slice(0, 2)} ${h.hours}` : null).filter(Boolean)
          })
        }}
      />
      
      {/* Hero Section - Above the fold */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 py-8">
          {/* Business Identity */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <div className="flex gap-4">
              <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                <AvatarImage src={business.logo_url || ''} alt={business.name} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {business.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{business.name}</h1>
                  {business.verified && (
                    <Badge className="bg-green-500 text-white">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground mb-3">
                  <Badge variant="outline" className="text-primary border-primary">
                    {business.category}
                  </Badge>
                  
                  {business.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{business.city}, {business.state}</span>
                    </div>
                  )}
                </div>
                
                {business.description && (
                  <p className="text-muted-foreground text-lg mb-4 max-w-2xl">
                    {business.description}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Primary Action Buttons - Key CTAs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {business.phone && (
              <Button size="lg" className="h-14 text-base font-medium">
                <Phone className="w-5 h-5 mr-2" />
                <div className="text-left">
                  <div>Call Now</div>
                  <div className="text-xs font-normal opacity-90">{business.phone}</div>
                </div>
              </Button>
            )}
            
            {business.website && (
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="h-14 text-base font-medium"
              >
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-5 h-5 mr-2" />
                  <div>Visit Website</div>
                </a>
              </Button>
            )}
            
            {fullAddress && (
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="h-14 text-base font-medium"
              >
                <a 
                  href={`https://maps.google.com?q=${encodeURIComponent(fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation className="w-5 h-5 mr-2" />
                  <div>Get Directions</div>
                </a>
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="lg" 
              className="h-14 text-base font-medium"
            >
              <Share2 className="w-5 h-5 mr-2" />
              <div>Share</div>
            </Button>
          </div>
          
          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hours Card */}
            {businessHours && (
              <Card className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Hours</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    {businessHours.slice(0, 2).map(({ day, hours }) => (
                      <div key={day} className="flex justify-between">
                        <span>{day}</span>
                        <span className={hours === 'Closed' ? 'text-red-500' : 'text-green-600'}>
                          {hours}
                        </span>
                      </div>
                    ))}
                    <Link href="#hours" className="text-primary text-xs hover:underline">
                      View all hours →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Contact Card */}
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Contact</h3>
                </div>
                <div className="space-y-1 text-sm">
                  {business.phone && (
                    <div>📞 {business.phone}</div>
                  )}
                  {business.email && (
                    <div>✉️ {business.email}</div>
                  )}
                  {fullAddress && (
                    <div className="text-muted-foreground">📍 {fullAddress}</div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* AI Chat Card */}
            {business.ai_enabled && (
              <Card className="shadow-sm border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">AI Assistant</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get instant answers about {business.name}
                  </p>
                  <Button size="sm" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs for organized content */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                {/* About Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {business.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {business.description ? (
                      <p className="text-muted-foreground leading-relaxed">
                        {business.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        This business hasn't added a description yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
                
                {/* Services/Categories */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Services & Categories
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-base py-2 px-4">
                        {business.category}
                      </Badge>
                      {/* Add more categories/services if available */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="gallery">
                {business.images && business.images.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Gallery ({business.images.length} photos)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {business.images.map((image: string, index: number) => (
                          <div 
                            key={index} 
                            className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer"
                          >
                            <Image
                              src={image}
                              alt={`${business.name} image ${index + 1}`}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No photos available</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="contact" id="hours">
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Contact Details */}
                    <div className="grid gap-4">
                      {business.phone && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Phone className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Phone</p>
                            <a href={`tel:${business.phone}`} className="text-primary hover:underline">
                              {business.phone}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {business.email && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Email</p>
                            <a href={`mailto:${business.email}`} className="text-primary hover:underline">
                              {business.email}
                            </a>
                          </div>
                        </div>
                      )}
                      
                      {fullAddress && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                          <MapPin className="w-5 h-5 text-primary" />
                          <div>
                            <p className="font-medium">Address</p>
                            <address className="not-italic text-muted-foreground">
                              {fullAddress}
                            </address>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Business Hours */}
                    {businessHours && (
                      <div>
                        <h3 className="font-semibold mb-4 text-lg">Business Hours</h3>
                        <div className="grid gap-2">
                          {businessHours.map(({ day, hours }) => (
                            <div key={day} className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                              <span className="font-medium">{day}</span>
                              <span className={hours === 'Closed' ? 'text-red-500' : 'text-green-600'}>
                                {hours}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">Reviews coming soon</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Chat - Higher on desktop */}
            {business.ai_enabled && (
              <div className="lg:sticky lg:top-4">
                <AIAgent 
                  business={business} 
                  className="shadow-lg"
                />
              </div>
            )}
            
            {/* Business Details */}
            <BusinessDetails
              businessId={business.id}
              businessHours={businessHours}
              verified={business.verified}
              aiEnabled={business.ai_enabled}
              category={business.category}
              businessName={business.name}
            />
            
            {/* Map Placeholder */}
            {fullAddress && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Map integration coming soon</p>
                      <Button asChild variant="outline" size="sm" className="mt-3">
                        <a 
                          href={`https://maps.google.com?q=${encodeURIComponent(fullAddress)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Google Maps
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Gallery Preview */}
            {galleryPreview.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Photos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {galleryPreview.map((image: string, index: number) => (
                      <div key={index} className="aspect-square relative overflow-hidden rounded-lg">
                        <Image
                          src={image}
                          alt={`${business.name} photo ${index + 1}`}
                          fill
                          className="object-cover hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                  {remainingImages > 0 && (
                    <Button variant="outline" className="w-full mt-3">
                      <Camera className="w-4 h-4 mr-2" />
                      View all {business.images.length} photos
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
      
      {/* Floating AI Agent for Mobile */}
      {business.ai_enabled && (
        <div className="lg:hidden">
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