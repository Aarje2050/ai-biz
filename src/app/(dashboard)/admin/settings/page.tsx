/**
 * File: src/app/(dashboard)/admin/settings/page.tsx
 * 
 * Admin settings page for managing users and roles
 */
import { Suspense } from 'react'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'
import { RoleManagement } from '@/components/admin/role-management'
import { GeneralSettings } from '@/components/admin/general-settings'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Settings, Users, Shield, Cog } from 'lucide-react'

export default async function AdminSettingsPage() {
  // Check admin permissions
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    redirect('/dashboard')
  }

  const supabase = createServerSupabaseClient()

  // Get current user to check if they're super admin
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: currentUserProfile } = await supabase
    .from('profiles')
    .select('is_admin, is_super_admin')
    .eq('id', user?.id)
    .single()

  const isSuperAdmin = currentUserProfile?.is_super_admin || false

  return (
    <div className="space-y-8 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Admin Settings
          </h1>
          <p className="text-muted-foreground">
            Manage users, roles, and system settings
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Shield className="h-4 w-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="general">
            <Cog className="h-4 w-4 mr-2" />
            General Settings
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage admin users and their permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<UserManagementSkeleton />}>
                  <UserManagement isSuperAdmin={isSuperAdmin} />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Roles Management Tab */}
        <TabsContent value="roles">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Definitions</CardTitle>
                <CardDescription>
                  Configure permissions for different user roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading roles...</div>}>
                  <RoleManagement />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <div className="grid gap-6">
            <GeneralSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function UserManagementSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
          <div className="h-12 w-12 bg-muted animate-pulse rounded-full" />
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
  title: 'Admin Settings | Admin Dashboard',
  description: 'Manage users, roles, and system settings',
}