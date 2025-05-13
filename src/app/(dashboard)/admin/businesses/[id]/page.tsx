/**
 * File: src/app/(dashboard)/admin/businesses/[id]/page.tsx (FIXED)
 * 
 * Admin page for reviewing and verifying individual businesses - Fixed foreign key issue
 */
import { notFound } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessVerificationForm } from '@/components/admin/business-verification-form'
import { BusinessDetailHeader } from '@/components/admin/business-detail-header'
import { BusinessInformation } from '@/components/admin/business-information'
import { BusinessImages } from '@/components/admin/business-images'
import { VerificationHistory } from '@/components/admin/verification-history'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'

// Force dynamic rendering
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
  rejected_at: string | null
  ai_enabled: boolean
  ai_prompt: string | null
  created_at: string
  updated_at: string
  user_id: string
  profiles?: {
    full_name: string | null
    email: string
  }
}

export default async function AdminBusinessDetailPage({
  params
}: {
  params: { id: string }
}) {
  // Check admin permissions
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    redirect('/dashboard')
  }

  const supabase = createServerSupabaseClient()

  // Fetch business details first (without profiles to avoid foreign key issue)
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !business) {
    console.error('Error fetching business:', error)
    notFound()
  }

  // Fetch the profile separately using the user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', business.user_id)
    .single()

  // Combine the data
  const businessWithProfile: Business = {
    ...business,
    profiles: profile || { full_name: null, email: 'Unknown' }
  }

  return (
    <div className="space-y-8 p-6">
      {/* Business Header with Actions */}
      <BusinessDetailHeader business={businessWithProfile} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 lg:grid-cols-2">
            <BusinessInformation business={businessWithProfile} />
            
            <Card>
              <CardHeader>
                <CardTitle>Owner Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Owner Name
                  </label>
                  <p className="font-medium">
                    {businessWithProfile.profiles?.full_name || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <p className="font-medium">{businessWithProfile.profiles?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Business Phone
                  </label>
                  <p className="font-medium">{business.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Business Email
                  </label>
                  <p className="font-medium">{business.email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Registration Date
                  </label>
                  <p className="font-medium">
                    {new Date(business.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Images Tab */}
        <TabsContent value="images">
          <BusinessImages business={businessWithProfile} />
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <VerificationHistory businessId={business.id} />
        </TabsContent>

        {/* Verification Tab */}
        <TabsContent value="verification">
          <BusinessVerificationForm business={businessWithProfile} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', params.id)
    .single()

  return {
    title: business?.name ? `Review: ${business.name}` : 'Business Review',
    description: 'Admin review page for business verification',
  }
}