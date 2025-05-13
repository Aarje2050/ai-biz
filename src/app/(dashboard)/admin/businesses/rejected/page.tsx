/**
 * File: src/app/(dashboard)/admin/businesses/rejected/page.tsx
 * 
 * Rejected businesses page - shows only rejected businesses
 */
import { Suspense } from 'react'
import { BusinessList } from '@/components/admin/business-list'
import { BusinessListSkeleton } from '@/components/admin/business-list-skeleton'
import { XCircle, AlertTriangle } from 'lucide-react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function RejectedBusinessesPage({ 
  searchParams 
}: {
  searchParams: any
}) {
  // Force status to 'rejected' for this page
  const rejectedSearchParams = {
    ...searchParams,
    status: 'rejected'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <XCircle className="h-8 w-8 text-red-600" />
            Rejected Businesses
          </h1>
          <p className="text-muted-foreground">
            Business listings that have been rejected or declined
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-300">
            Rejected Status
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">Review Rejected Businesses</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              These businesses have been rejected. You can review the rejection reasons and potentially
              reverse the decision if needed. Rejected businesses cannot be seen by public users.
            </p>
          </div>
        </div>
      </div>

      {/* Business List */}
      <Suspense fallback={<BusinessListSkeleton />}>
        <BusinessList searchParams={rejectedSearchParams} />
      </Suspense>
    </div>
  )
}

export const metadata = {
  title: 'Rejected Businesses | Admin Dashboard',
  description: 'View and manage rejected business listings',
}