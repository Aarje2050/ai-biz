/**
 * File: src/components/admin/pending-businesses-list.tsx (DEBUG VERSION)
 * 
 * Add console logging to debug the issue
 */
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  Eye, 
  CheckCircle, 
  XCircle, 
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
  profiles?: {
    full_name: string | null
    email: string
  }
}

export async function PendingBusinessesList() {
  const supabase = createServerSupabaseClient()

  // Debug: Check if admin access is working
  console.log('PendingBusinessesList: Starting query...')

  // First, let's check if we can access the businesses table at all
  const { data: testConnection, error: testError } = await supabase
    .from('businesses')
    .select('count')
    .limit(1)

  console.log('Test connection result:', { testConnection, testError })

  if (testError) {
    console.error('Connection test failed:', testError)
    return (
      <div className="text-center py-8 text-red-500">
        <p>Database connection failed: {testError.message}</p>
        <pre className="text-xs mt-2 text-left">{JSON.stringify(testError, null, 2)}</pre>
      </div>
    )
  }

  // Now let's check if the required fields exist
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
      description,
      verified,
      rejected_at
    `)
    .eq('verified', false)
    .is('rejected_at', null)
    .order('created_at', { ascending: false })

  console.log('Main query result:', { businesses, error })

  if (error) {
    console.error('Error fetching pending businesses:', error)
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading pending businesses</p>
        <p className="text-sm mt-2">Error: {error.message}</p>
        <pre className="text-xs mt-2 text-left">{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  console.log('Businesses fetched:', businesses?.length || 0)

  // Let's also check if profiles table is accessible separately
  if (businesses && businesses.length > 0) {
    const { data: profileTest, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', businesses[0].id)
      .single()

    console.log('Profile test:', { profileTest, profileError })
  }

  if (!businesses || businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-medium mb-2">No Pending Businesses</h3>
        <p className="text-muted-foreground">
          All businesses have been reviewed. Great job!
        </p>
        
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business, index) => (
        <div 
          key={business.id} 
          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          {/* Business Avatar */}
          <Avatar className="h-14 w-14">
            <AvatarImage src={business.logo_url || ''} alt={business.name} />
            <AvatarFallback className="text-lg">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg truncate">{business.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {business.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {business.city}, {business.state}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {business.description && (
              <p className="text-sm text-muted-foreground truncate mb-2">
                {business.description}
              </p>
            )}

            {/* Owner & Date Info - Removed profile reference for debugging */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Owner:</span> Not loaded (debugging)
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(business.created_at), { addSuffix: true })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link href={`/admin/businesses/${business.id}`}>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}