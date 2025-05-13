/**
 * File: src/components/admin/admin-stats.tsx (DEBUG VERSION)
 * 
 * Admin dashboard statistics with better error handling
 */
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { 
  Building, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: any
  description: string
  error?: string
}

function StatCard({ title, value, icon: Icon, description, error }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${error ? 'text-red-500' : 'text-muted-foreground'}`} />
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="space-y-2">
            <div className="text-xl font-bold text-red-500">Error</div>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export async function AdminStats() {
  const supabase = createServerSupabaseClient()

  // Initialize results
  let totalBusinesses = 0
  let pendingBusinesses = 0
  let verifiedBusinesses = 0
  let totalUsers = 0
  let errors: Record<string, string> = {}

  // Test each query separately for better error isolation
  try {
    console.log('AdminStats: Testing total businesses...')
    const result = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
    
    if (result.error) {
      errors.totalBusinesses = result.error.message
      console.error('Total businesses error:', result.error)
    } else {
      totalBusinesses = result.count || 0
      console.log('Total businesses:', totalBusinesses)
    }
  } catch (error) {
    errors.totalBusinesses = 'Database connection failed'
    console.error('Total businesses error:', error)
  }

  try {
    console.log('AdminStats: Testing pending businesses...')
    const result = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('verified', false)
      .is('rejected_at', null)
    
    if (result.error) {
      errors.pendingBusinesses = result.error.message
      console.error('Pending businesses error:', result.error)
    } else {
      pendingBusinesses = result.count || 0
      console.log('Pending businesses:', pendingBusinesses)
    }
  } catch (error) {
    errors.pendingBusinesses = 'Query failed - check columns exist'
    console.error('Pending businesses error:', error)
  }

  try {
    console.log('AdminStats: Testing verified businesses...')
    const result = await supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('verified', true)
    
    if (result.error) {
      errors.verifiedBusinesses = result.error.message
      console.error('Verified businesses error:', result.error)
    } else {
      verifiedBusinesses = result.count || 0
      console.log('Verified businesses:', verifiedBusinesses)
    }
  } catch (error) {
    errors.verifiedBusinesses = 'Query failed - verified column missing?'
    console.error('Verified businesses error:', error)
  }

  try {
    console.log('AdminStats: Testing total users...')
    const result = await supabase
      .from('profiles')
      .select('id', { count: 'exact' })
    
    if (result.error) {
      errors.totalUsers = result.error.message
      console.error('Total users error:', result.error)
    } else {
      totalUsers = result.count || 0
      console.log('Total users:', totalUsers)
    }
  } catch (error) {
    errors.totalUsers = 'Profiles table access failed'
    console.error('Total users error:', error)
  }

  // Calculate verification rate
  const verificationRate = totalBusinesses > 0 
    ? Math.round((verifiedBusinesses / totalBusinesses) * 100)
    : 0

  return (
    <>
      <StatCard
        title="Total Businesses"
        value={errors.totalBusinesses ? 'Error' : totalBusinesses}
        icon={Building}
        description="All registered businesses"
        error={errors.totalBusinesses}
      />
      
      <StatCard
        title="Pending Verification"
        value={errors.pendingBusinesses ? 'Error' : pendingBusinesses}
        icon={Clock}
        description="Awaiting approval"
        error={errors.pendingBusinesses}
      />
      
      <StatCard
        title="Verified Businesses"
        value={errors.verifiedBusinesses ? 'Error' : verifiedBusinesses}
        icon={CheckCircle}
        description={`${verificationRate}% verification rate`}
        error={errors.verifiedBusinesses}
      />
      
      <StatCard
        title="Total Users"
        value={errors.totalUsers ? 'Error' : totalUsers}
        icon={Users}
        description="Registered users"
        error={errors.totalUsers}
      />
    </>
  )
}