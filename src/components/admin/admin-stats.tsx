/**
 * File: src/components/admin/admin-stats.tsx
 * 
 * Admin dashboard statistics cards showing platform metrics
 */
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { 
  Building, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  Calendar,
  Eye
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  description: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>{description}</span>
          {trend && (
            <div className={`flex items-center ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-3 w-3 mr-1" />
              {trend.isPositive ? '+' : ''}{trend.value}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export async function AdminStats() {
  const supabase = createServerSupabaseClient()

  // Fetch all statistics in parallel for better performance
  const [
    totalBusinessesResult,
    pendingBusinessesResult,
    verifiedBusinessesResult,
    rejectedBusinessesResult,
    totalUsersResult,
    recentBusinessesResult
  ] = await Promise.all([
    // Total businesses
    supabase
      .from('businesses')
      .select('id', { count: 'exact' }),
    
    // Pending businesses
    supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('verified', false),
    
    // Verified businesses
    supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('verified', true),
    
    // Rejected businesses (you may need to add a 'rejected' field to your schema)
    supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('verified', false)
      .not('rejected_at', 'is', null),
    
    // Total users
    supabase
      .from('profiles')
      .select('id', { count: 'exact' }),
    
    // Businesses added in last 7 days (for trend calculation)
    supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ])

  // Calculate statistics
  const totalBusinesses = totalBusinessesResult.count || 0
  const pendingBusinesses = pendingBusinessesResult.count || 0
  const verifiedBusinesses = verifiedBusinessesResult.count || 0
  const rejectedBusinesses = rejectedBusinessesResult.count || 0
  const totalUsers = totalUsersResult.count || 0
  const recentBusinesses = recentBusinessesResult.count || 0

  // Calculate trends (simplified - in production you'd compare with previous periods)
  const businessTrend = {
    value: Math.round((recentBusinesses / Math.max(totalBusinesses, 1)) * 100),
    isPositive: recentBusinesses > 0
  }

  const verificationRate = totalBusinesses > 0 
    ? Math.round((verifiedBusinesses / totalBusinesses) * 100)
    : 0

  return (
    <>
      <StatCard
        title="Total Businesses"
        value={totalBusinesses}
        icon={Building}
        description="All registered businesses"
        trend={businessTrend}
      />
      
      <StatCard
        title="Pending Verification"
        value={pendingBusinesses}
        icon={Clock}
        description="Awaiting approval"
      />
      
      <StatCard
        title="Verified Businesses"
        value={verifiedBusinesses}
        icon={CheckCircle}
        description={`${verificationRate}% verification rate`}
      />
      
      <StatCard
        title="Total Users"
        value={totalUsers}
        icon={Users}
        description="Registered users"
      />
    </>
  )
}