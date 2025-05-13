/**
 * File: src/app/(dashboard)/admin/businesses/page.tsx (FIXED)
 * 
 * All businesses page with filtering and management capabilities
 */
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { BusinessList } from '@/components/admin/business-list'
import { BusinessListSkeleton } from '@/components/admin/business-list-skeleton'
import { BusinessFilters } from '@/components/admin/business-filters'
import { Building, Search, Filter } from 'lucide-react'
import Link from 'next/link'

interface SearchParams {
  status?: 'all' | 'pending' | 'verified' | 'rejected'
  category?: string
  search?: string
  page?: string
  sort?: 'latest' | 'oldest' | 'name' | 'category'
}

export default async function AllBusinessesPage({ 
  searchParams 
}: {
  searchParams: SearchParams
}) {
  const supabase = createServerSupabaseClient()
  
  // Get unique categories for filter dropdown
  // Fixed: Remove distinct() and handle it in JavaScript
  const { data: categoriesData } = await supabase
    .from('businesses')
    .select('category')
  
  // Extract unique categories
  const uniqueCategories = [...new Set(
    categoriesData?.map(item => item.category).filter(Boolean) || []
  )] as string[]

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-primary" />
            All Businesses
          </h1>
          <p className="text-muted-foreground">
            Manage and moderate all business listings
          </p>
        </div>
        
        <Link href="/dashboard/businesses/new">
          <Button>
            <Building className="h-4 w-4 mr-2" />
            Add Business
          </Button>
        </Link>
      </div>

      {/* Filters Component */}
      <BusinessFilters 
  searchParams={searchParams as Record<string, string | undefined>}
  uniqueCategories={uniqueCategories}
/>
      {/* Business List */}
      <Suspense fallback={<BusinessListSkeleton />}>
        <BusinessList searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'All Businesses | Admin Dashboard',
  description: 'View and manage all business listings',
}