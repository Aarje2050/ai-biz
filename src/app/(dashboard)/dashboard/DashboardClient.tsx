'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge, Input } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Building2, MessageSquare, Star, TrendingUp, Clock, AlertCircle, CheckCircle, XCircle, Search, Filter, Eye, Edit } from 'lucide-react'
import Link from 'next/link'
import type { BusinessStatus, PlanType } from '@/types/business'

interface DashboardProps {
  initialData: {
    businesses: any[]
    user: any
  }
}

export default function DashboardClient({ initialData }: DashboardProps) {
  const [businesses, setBusinesses] = useState(initialData.businesses)
  const [filteredBusinesses, setFilteredBusinesses] = useState(initialData.businesses)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | BusinessStatus>('all')
  const [planFilter, setPlanFilter] = useState<'all' | PlanType>('all')

  // Filter businesses based on search and filters
  useEffect(() => {
    let filtered = businesses

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(business =>
        business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        business.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(business => {
        if (statusFilter === 'draft') return business.status === 'draft'  // Add this line
        if (statusFilter === 'pending') return business.status === 'pending'
        if (statusFilter === 'active') return business.verified === true
        if (statusFilter === 'rejected') return business.status === 'rejected'
        if (statusFilter === 'suspended') return business.status === 'suspended'
        return true
      })
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(business => {
        const subscription = business.business_subscriptions?.[0]
        if (!subscription && planFilter === 'free') return true
        return subscription?.plans?.name === planFilter
      })
    }

    setFilteredBusinesses(filtered)
  }, [businesses, searchQuery, statusFilter, planFilter])

  // Calculate stats
  const businessCount = businesses.length
  const draftCount = businesses.filter(b => b.status === 'draft').length // Add this
  const verifiedCount = businesses.filter(b => b.verified).length
  const pendingCount = businesses.filter(b => b.status === 'pending').length
  const rejectedCount = businesses.filter(b => b.status === 'rejected').length

  const getStatusBadge = (business: any) => {
    if (business.status === 'draft') {
      return { label: 'Draft', variant: 'outline', icon: CheckCircle }  
    }
    if (business.verified) {
      return { label: 'Live', variant: 'success', icon: CheckCircle }
    }
    switch (business.status) {
      case 'pending':
        return { label: 'Under Review', variant: 'warning', icon: Clock }
      case 'rejected':
        return { label: 'Rejected', variant: 'destructive', icon: XCircle }
      case 'suspended':
        return { label: 'Suspended', variant: 'secondary', icon: AlertCircle }
      default:
        return { label: 'Draft', variant: 'outline', icon: AlertCircle }
    }
  }

  const getSubscriptionInfo = (business: any) => {
    const subscription = business.business_subscriptions?.[0]
    if (!subscription) return { label: 'Free', variant: 'outline' }
    
    const plan = subscription.plans
    if (subscription.is_trial && subscription.trial_end_date) {
      const daysLeft = Math.max(0, Math.ceil((new Date(subscription.trial_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
      return { label: `Premium Trial (${daysLeft}d)`, variant: 'secondary' }
    }
    
    return { label: plan?.display_name || 'Premium', variant: 'default' }
  }

  const getFilterCounts = () => ({
    all: businessCount,
    draft: draftCount,
    pending: pendingCount,
    active: verifiedCount,
    rejected: rejectedCount,
    suspended: businesses.filter(b => b.status === 'suspended').length
  })

  const counts = getFilterCounts()

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your business listings</p>
        </div>
        <Link href="/dashboard/businesses/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Add Business
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{verifiedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
            <Star className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {businesses.filter(b => b.business_subscriptions?.[0]?.plans?.name === 'premium').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={planFilter === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlanFilter(planFilter === 'free' ? 'all' : 'free')}
              >
                Free
              </Button>
              <Button
                variant={planFilter === 'premium' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPlanFilter(planFilter === 'premium' ? 'all' : 'premium')}
              >
                Premium
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business List with Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" onValueChange={(value) => setStatusFilter(value as any)}>
            <div className="border-b px-6 pt-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                <TabsTrigger value="draft">Drafts ({counts.draft})</TabsTrigger> {/* Add this */}
                <TabsTrigger value="active">Live ({counts.active})</TabsTrigger>
                <TabsTrigger value="pending">Under Review ({counts.pending})</TabsTrigger>
                <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
                <TabsTrigger value="suspended">Suspended ({counts.suspended})</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="p-6 pt-4">
              <BusinessList businesses={filteredBusinesses} getStatusBadge={getStatusBadge} getSubscriptionInfo={getSubscriptionInfo} />
            </TabsContent>
            <TabsContent value="active" className="p-6 pt-4">
              <BusinessList businesses={filteredBusinesses} getStatusBadge={getStatusBadge} getSubscriptionInfo={getSubscriptionInfo} />
            </TabsContent>
            <TabsContent value="pending" className="p-6 pt-4">
              <BusinessList businesses={filteredBusinesses} getStatusBadge={getStatusBadge} getSubscriptionInfo={getSubscriptionInfo} />
            </TabsContent>
            <TabsContent value="rejected" className="p-6 pt-4">
              <BusinessList businesses={filteredBusinesses} getStatusBadge={getStatusBadge} getSubscriptionInfo={getSubscriptionInfo} />
            </TabsContent>
            <TabsContent value="suspended" className="p-6 pt-4">
              <BusinessList businesses={filteredBusinesses} getStatusBadge={getStatusBadge} getSubscriptionInfo={getSubscriptionInfo} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function BusinessList({ businesses, getStatusBadge, getSubscriptionInfo }: any) {
  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or create a new business.</p>
        <Link href="/dashboard/businesses/new">
          <Button className="mt-4">Add Your First Business</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {businesses.map((business: any) => {
        const statusBadge = getStatusBadge(business)
        const subscriptionInfo = getSubscriptionInfo(business)
        const StatusIcon = statusBadge.icon
        
        return (
          <div key={business.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-4 flex-1">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold truncate">{business.name}</h3>
                  <Badge variant={statusBadge.variant as any} className="flex items-center gap-1 shrink-0">
                    <StatusIcon className="h-3 w-3" />
                    {statusBadge.label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {business.category} • {business.city}, {business.state}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={subscriptionInfo.variant as any} className="text-xs">
                    {subscriptionInfo.label}
                  </Badge>
                  {business.ai_agent_enabled && (
                    <Badge variant="outline" className="text-xs">AI Assistant</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {business.verified && (
                <Link href={`/business/${business.slug}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              )}
              <Link href={`/dashboard/businesses/${business.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}