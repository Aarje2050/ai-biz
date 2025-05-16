import { Suspense } from 'react'
import { isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { AdminStats } from '@/components/admin/admin-stats'
import { PendingBusinesses } from '@/components/admin/pending-businesses'
import { RecentVerifications } from '@/components/admin/recent-verifications'
import { Button } from '@/components/ui'
import Link from 'next/link'
import { Shield, Users, Building, Clock } from 'lucide-react'

/**
 * Admin Dashboard Main Page
 * 
 * This page serves as the central hub for admin activities including:
 * - Viewing business verification requests
 * - Monitoring platform statistics
 * - Managing verified businesses
 * 
 * Security: Only accessible by users with admin privileges
 */
export default async function AdminDashboardPage() {
  
  // Check if the current user has admin privileges
  const adminCheck = await isAdmin()
  
  if (!adminCheck) {
    redirect('/dashboard')
  }


  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage business listings and platform operations
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link href="/admin/businesses">
            <Button variant="outline">
              <Building className="h-4 w-4 mr-2" />
              All Businesses
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Admin Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          <AdminStats />
        </Suspense>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Business Verifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Pending Verifications
            </CardTitle>
            <CardDescription>
              Businesses waiting for verification approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<BusinessListSkeleton />}>
              <PendingBusinesses />
            </Suspense>
          </CardContent>
        </Card>

        {/* Recent Verification Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest verification decisions and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ActivityListSkeleton />}>
              <RecentVerifications />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/**
 * Loading Skeletons for better UX
 * These show while data is being fetched
 */
function StatsCardSkeleton() {
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-0 pb-2">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-12 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

function BusinessListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
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

function ActivityListSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}