import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { MapPin, Phone, Mail, Globe, Clock, Star, MessageCircle } from 'lucide-react'
import { notFound } from 'next/navigation'
import { formatPhoneNumber, formatBusinessHours } from '@/lib/utils'
import type { Metadata } from 'next'
import Image from 'next/image'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  
  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, city, state')
    .eq('slug', params.slug)
    .eq('verified', true)
    .single()

  if (!business) {
    return {
      title: 'Business Not Found',
    }
  }

  return {
    title: `${business.name} - AI Business Directory`,
    description: business.description || `Find ${business.name} in ${business.city}, ${business.state}`,
    // openGraph: {
    //   title: business.name,
    //   description: business.description || '',
    //   type: 'business.business',
    // },
  }
}

export default async function BusinessPage({ params }: Props) {
  const supabase = createServerSupabaseClient()
  
  // Fetch the business
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .eq('verified', true) // Only show verified businesses
    .single()

  if (error || !business) {
    notFound() // Call the function, don't import it as a component
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": business.name,
    "description": business.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": business.address,
      "addressLocality": business.city,
      "addressRegion": business.state,
      "postalCode": business.zip_code,
    },
    "telephone": business.phone,
    "email": business.email,
    "url": business.website,
    "openingHours": business.hours ? Object.entries(business.hours).map(([day, hours]) => {
      if (!hours) return null
      const [open, close] = (hours as string).split('-')
      return `${day.charAt(0).toUpperCase() + day.slice(1)} ${open}-${close}`
    }).filter(Boolean) : [],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
        {/* Hero Section */}
        <div className="bg-primary/5 border-b">
          <div className="container py-12">
            <div className="flex items-start gap-6">
              {business.logo_url && (
                <Image
                  src={business.logo_url}
                  alt={`${business.name} logo`}
                  width={80}
                  height={80}
                  className="rounded-lg border"
                />
              )}
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
                <p className="text-xl text-muted-foreground mb-4">{business.category}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {business.city && business.state && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {business.city}, {business.state}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Verified Business
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              {business.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {business.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* AI Assistant Section */}
              {business.ai_enabled && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-primary" />
                      Ask Our AI Assistant
                    </CardTitle>
                    <CardDescription>
                      Get instant answers about our services, hours, and more
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-primary/5 rounded-lg text-center">
                      <MessageCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">
                        AI Assistant coming soon! Our intelligent assistant will be able to 
                        answer your questions about our business in real-time.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {business.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${business.phone}`} className="hover:text-primary">
                        {formatPhoneNumber(business.phone)}
                      </a>
                    </div>
                  )}
                  
                  {business.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${business.email}`} className="hover:text-primary">
                        {business.email}
                      </a>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                  
                  {(business.address || business.city || business.state) && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        {business.address && <div>{business.address}</div>}
                        <div>
                          {business.city && business.state && `${business.city}, ${business.state}`}
                          {business.zip_code && ` ${business.zip_code}`}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {business.hours ? (
                    <div className="space-y-2">
                      {Object.entries(business.hours as Record<string, string>).map(([day, hours]) => (
                        <div key={day} className="flex justify-between">
                          <span className="capitalize font-medium">{day}</span>
                          <span className="text-muted-foreground">
                            {hours || 'Closed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Hours not specified
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}