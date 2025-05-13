/**
 * File: src/app/(dashboard)/admin/businesses/verified/page.tsx
 * 
 * Verified businesses page - shows only approved businesses
 */
import { Suspense } from 'react'
import { BusinessList } from '@/components/admin/business-list'
import { BusinessListSkeleton } from '@/components/admin/business-list-skeleton'
import { CheckCircle, Shield } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function VerifiedBusinessesPage({ 
  searchParams 
}: {
  searchParams: any
}) {
  // Force status to 'verified' for this page
  const verifiedSearchParams = {
    ...searchParams,
    status: 'verified'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CheckCircle className="h-8 w-8 text-green-600" />
            Verified Businesses
          </h1>
          <p className="text-muted-foreground">
            All approved and verified business listings
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
          <Shield className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Verified Status
          </span>
        </div>
      </div>

      {/* Business List */}
      <Suspense fallback={<BusinessListSkeleton />}>
        <BusinessList searchParams={verifiedSearchParams} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Verified Businesses | Admin Dashboard',
  description: 'View and manage verified business listings',
}