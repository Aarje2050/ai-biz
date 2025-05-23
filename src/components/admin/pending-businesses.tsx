/**
 * File: src/components/admin/pending-businesses.tsx (FIXED)
 * 
 * Dashboard pending businesses component with working quick actions
 */
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Badge } from '@/components/ui'
import { QuickActionButtons } from './quick-action-buttons-dashboard'
import { 
  Eye, 
  Calendar,
  MapPin,
  Building
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Business {
  id: string
  name: string
  category: string
  city: string
  state: string
  created_at: string
  logo_url: string | null
  description: string | null
}

export async function PendingBusinesses() {
  const supabase = createServerSupabaseClient()

  console.log('PendingBusinesses: Attempting to fetch pending businesses...')

  // Fetch pending businesses (not verified and not rejected)
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      category,
      city,
      state,
      created_at,
      logo_url,
      description
    `)
    .eq('verified', false)
    .is('rejected_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  console.log('PendingBusinesses query result:', { businesses, error })

  if (error) {
    console.error('Error fetching pending businesses:', error)
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Error loading pending businesses: {error.message}</p>
        <pre className="text-xs mt-2 text-left">{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No businesses pending verification</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <div key={business.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
          {/* Business Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage src={business.logo_url || ''} alt={business.name} />
            <AvatarFallback>
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium truncate">{business.name}</h3>
              <Badge variant="secondary" className="text-xs">
                {business.category}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {business.city}, {business.state}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(business.created_at), { addSuffix: true })}
              </div>
            </div>

            {business.description && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {business.description}
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link href={`/admin/businesses/${business.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            </Link>
            
            {/* Quick Action Buttons Component */}
            <QuickActionButtons businessId={business.id} businessName={business.name} />
          </div>
        </div>
      ))}

      {/* View All Link */}
      {businesses.length >= 10 && (
        <div className="text-center pt-4">
          <Link href="/admin/businesses/pending">
            <Button variant="outline">
              View All Pending Businesses
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}