/**
 * File: src/components/admin/business-list.tsx (FIXED)
 * 
 * Business list component with proper TypeScript types
 */
// import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createSupabaseAdmin } from '@/lib/supabase/server'

import { Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { BusinessActionsMenu } from './business-actions-menu'
import { Pagination } from '@/components/ui/pagination'
import { 
  Building,
  MapPin,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Shield,
  Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface SearchParams {
  status?: 'all' | 'pending' | 'verified' | 'rejected'
  category?: string
  search?: string
  page?: string
  sort?: 'latest' | 'oldest' | 'name' | 'category'
}

interface Business {
  id: string
  name: string
  slug: string
  category: string
  city: string
  state: string
  verified: boolean
  rejected_at: string | null
  created_at: string
  updated_at: string
  logo_url: string | null
  description: string | null
  owner_id: string
  profiles: {
    email: string
    full_name: string | null
  }
}

export async function BusinessList({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createSupabaseAdmin()
  const page = parseInt(searchParams.page || '1')
  const pageSize = 20
  const offset = (page - 1) * pageSize
  
  // Build query based on filters
  let query = supabase
    .from('businesses')
    .select(`
      id,
      name,
      slug,
      category,
      city,
      state,
      verified,
      rejected_at,
      created_at,
      updated_at,
      logo_url,
      description,
      owner_id
    `)
  
  // Apply status filter
  if (searchParams.status && searchParams.status !== 'all') {
    switch (searchParams.status) {
     
      case 'pending':
        query = query.eq('verified', false).is('rejected_at', null)
        break
      case 'verified':
        query = query.eq('verified', true)
        break
        case 'rejected':
          query = query.eq('status', 'rejected')
          break
    }
  }
  
  // Apply category filter
  if (searchParams.category && searchParams.category !== 'all') {
    query = query.eq('category', searchParams.category)
  }
  
  // Apply search filter
  if (searchParams.search) {
    query = query.ilike('name', `%${searchParams.search}%`)
  }
  
  // Apply pagination and ordering
  let orderBy: string = 'created_at'
  let ascending = false
  
  // Handle sorting from search params
  if (searchParams.sort) {
    switch (searchParams.sort) {
      case 'oldest':
        orderBy = 'created_at'
        ascending = true
        break
      case 'name':
        orderBy = 'name'
        ascending = true
        break
      case 'category':
        orderBy = 'category'
        ascending = true
        break
      default: // 'latest'
        orderBy = 'created_at'
        ascending = false
    }
  }
  
  const { data: rawBusinesses, error, count } = await query
    .order(orderBy, { ascending })
    .range(offset, offset + pageSize - 1)
  
    if (error) {
      console.error('Error fetching businesses:', error)
      return (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>Error loading businesses</p>
              <p className="text-sm mt-2">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // If we got businesses, fetch their profiles
    let businesses: Business[] = []
    if (rawBusinesses && rawBusinesses.length > 0) {
      // Get all user IDs
      const userIds = rawBusinesses.map(business => business.owner_id)
      
      // Fetch profiles for these users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds)
      
      // Create a lookup map
      const profileLookup = new Map()
      profiles?.forEach(profile => {
        profileLookup.set(profile.id, profile)
      })
      
      // Combine businesses with profiles
      businesses = rawBusinesses.map(business => ({
        ...business,
        profiles: profileLookup.get(business.owner_id) || { email: '', full_name: null }
      }))
    } else {
      businesses = []
    }
  
  const totalPages = Math.ceil((count || 0) / pageSize)
  
  // Get status info for business
  const getStatusInfo = (business: Business) => {
    if (business.rejected_at) {
      return {
        label: 'Rejected',
        variant: 'destructive' as const,
        icon: XCircle
      }
    } else if (business.verified) {
      return {
        label: 'Verified',
        variant: 'success' as const,
        icon: CheckCircle
      }
    } else {
      return {
        label: 'Pending',
        variant: 'secondary' as const,
        icon: Clock
      }
    }
  }
  
  // Convert SearchParams to Record<string, string | undefined> for Pagination
  const searchParamsForPagination: Record<string, string | undefined> = {
    status: searchParams.status,
    category: searchParams.category,
    search: searchParams.search,
    sort: searchParams.sort
  }
  
  return (
    <div className="space-y-4">
      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {count} businesses found
        </p>
        {totalPages > 1 && (
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
        )}
      </div>
      
      {/* Business List */}
      <div className="space-y-4">
        {businesses && businesses.length > 0 ? (
          businesses.map((business) => {
            const statusInfo = getStatusInfo(business)
            const StatusIcon = statusInfo.icon
            
            return (
              <Card key={business.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Business Avatar */}
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={business.logo_url || ''} alt={business.name} />
                      <AvatarFallback>
                        {business.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold">{business.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {business.profiles.email}
                          </p>
                        </div>
                        
                        <Badge variant={statusInfo.variant} className="ml-4">
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {business.category}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {business.city}, {business.state}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(business.created_at), { addSuffix: true })}
                        </div>
                        {business.profiles.full_name && (
                          <div className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {business.profiles.full_name}
                          </div>
                        )}
                      </div>
                      
                      {business.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {business.description}
                        </p>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/businesses/${business.id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <BusinessActionsMenu business={business} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Building className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No businesses found</h3>
                <p>Try adjusting your filters or search criteria</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/businesses"
          searchParams={searchParamsForPagination}
        />
      )}
    </div>
  )
}