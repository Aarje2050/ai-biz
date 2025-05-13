/**
 * File: src/app/(dashboard)/admin/businesses/pending/page.tsx
 * 
 * Admin page showing all pending business verifications
 */
import { Suspense } from 'react'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { PendingBusinessesList } from '@/components/admin/pending-businesses-list'
import { Clock, ArrowLeft, Filter } from 'lucide-react'

export default async function PendingBusinessesPage() {
  // Check admin permissions
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    redirect('/dashboard')
  }

  const supabase = createServerSupabaseClient()

  // Get count of pending businesses
  const { count: pendingCount } = await supabase
    .from('businesses')
    .select('*', { count: 'exact', head: true })
    .eq('verified', false)
    .is('rejected_at', null)

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              Pending Verifications
            </h1>
            <p className="text-muted-foreground">
              {pendingCount} {pendingCount === 1 ? 'business' : 'businesses'} awaiting review
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Businesses waiting for approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Review Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.5 days</div>
            <p className="text-xs text-muted-foreground">
              Time to complete review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              New submissions this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Businesses List */}
      <Card>
        <CardHeader>
          <CardTitle>Businesses Awaiting Review</CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<PendingBusinessesListSkeleton />}>
            <PendingBusinessesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

function PendingBusinessesListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <div className="h-12 w-12 bg-muted animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}

export const metadata = {
  title: 'Pending Verifications | Admin Dashboard',
  description: 'Review and approve pending business verifications',
}