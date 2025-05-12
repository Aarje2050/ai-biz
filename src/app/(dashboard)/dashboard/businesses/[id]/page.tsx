import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from '@/components/ui'
import { Edit, ExternalLink, MapPin, Phone, Mail, Globe, Clock, Bot } from 'lucide-react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { formatPhoneNumber, formatBusinessHours } from '@/lib/utils'

interface Props {
  params: { id: string }
}

export default async function BusinessDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient()
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch the business
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id) // Ensure user owns this business
    .single()

  if (error || !business) {
    notFound() // Call the function, don't import it as a component
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <p className="text-muted-foreground">
            {business.category} • {business.city}, {business.state}
          </p>
        </div>
        <Link href={`/dashboard/businesses/${business.id}/edit`}>
          <Button>
            <Edit className="mr-2 h-4 w-4" />
            Edit Business
          </Button>
        </Link>
      </div>

      {/* Business Status */}
      <Card>
        <CardHeader>
          <CardTitle>Business Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`h-3 w-3 rounded-full ${business.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm">
                {business.verified ? 'Verified' : 'Pending Verification'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Bot className={`h-4 w-4 ${business.ai_enabled ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-sm">
                AI Assistant {business.ai_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {business.description && (
              <div>
                <h4 className="font-semibold">Description</h4>
                <p className="text-muted-foreground">{business.description}</p>
              </div>
            )}
            
            {business.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formatPhoneNumber(business.phone)}</span>
              </div>
            )}
            
            {business.email && (
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{business.email}</span>
              </div>
            )}
            
            {business.website && (
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {business.website}
                  <ExternalLink className="ml-1 h-3 w-3 inline" />
                </a>
              </div>
            )}
            
            {(business.address || business.city || business.state) && (
              <div className="flex items-start space-x-2">
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
            <CardTitle>Business Hours</CardTitle>
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
              <p className="text-muted-foreground">No hours specified</p>
            )}
          </CardContent>
        </Card>

        {/* AI Assistant Configuration */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Assistant Configuration</CardTitle>
            <CardDescription>
              Configure how your AI assistant responds to customer inquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            {business.ai_prompt ? (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Current Instructions:</h4>
                <p className="text-sm text-muted-foreground">{business.ai_prompt}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                No AI assistant instructions configured. Your AI assistant will use default responses.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href={`/business/${business.slug}`} target="_blank">
                <Button variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Public Page
                </Button>
              </Link>
              <Link href={`/dashboard/businesses/${business.id}/ai`}>
                <Button variant="outline">
                  <Bot className="mr-2 h-4 w-4" />
                  Configure AI Assistant
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}