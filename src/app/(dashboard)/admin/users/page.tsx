/**
 * File: src/app/(dashboard)/admin/users/page.tsx
 * 
 * Users management page - view and manage all users
 */
import { Suspense } from 'react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Badge } from '@/components/ui'
import { UserActionsMenu } from '@/components/admin/user-actions-menu'
import { InviteUserDialog } from '@/components/admin/invite-user-dialog'
import { 
  Users, 
  UserPlus, 
  Shield, 
  UserCheck, 
  Calendar,
  Mail,
  Building
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = createServerSupabaseClient()

  // Get current user to check if super admin
  const { data: { user } } = await supabase.auth.getUser()
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('is_super_admin')
    .eq('id', user?.id)
    .single()

  const isSuperAdmin = currentProfile?.is_super_admin || false

  // Fetch profiles without the join first
const { data: profiles, error } = await supabase
.from('profiles')
.select('*')
.order('created_at', { ascending: false })

if (error) {
console.error('Error fetching users:', error)
return (
  <div className="p-6">
    <div className="text-center py-8 text-muted-foreground">
      <p>Error loading users: {error.message}</p>
    </div>
  </div>
)
}

// Fetch business counts separately
let users: any[] = []
if (profiles && profiles.length > 0) {
// Get business counts for each user
const userIds = profiles.map(p => p.id)

const { data: businessCounts } = await supabase
  .from('businesses')
  .select('user_id')
  .in('user_id', userIds)

// Count businesses per user
const businessCountMap = new Map()
businessCounts?.forEach(business => {
  const count = businessCountMap.get(business.user_id) || 0
  businessCountMap.set(business.user_id, count + 1)
})

// Add business counts to users
users = profiles.map(profile => ({
  ...profile,
  businesses: [{ count: businessCountMap.get(profile.id) || 0 }]
}))
} else {
users = []
}

  // Get role label for user
  const getRoleInfo = (user: any) => {
    if (user.is_super_admin) {
      return {
        label: 'Super Admin',
        variant: 'destructive' as const,
        icon: Shield
      }
    } else if (user.is_admin) {
      return {
        label: 'Admin',
        variant: 'default' as const,
        icon: UserCheck
      }
    } else {
      return {
        label: 'User',
        variant: 'secondary' as const,
        icon: Users
      }
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions
          </p>
        </div>
        
        {isSuperAdmin && (
          <InviteUserDialog>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </InviteUserDialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.is_admin || u.is_super_admin).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Business Owners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.businesses && u.businesses.length > 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => {
              const roleInfo = getRoleInfo(user)
              const RoleIcon = roleInfo.icon
              const businessCount = user.businesses?.[0]?.count || 0

              return (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                  {/* User Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar_url || ''} alt={user.full_name || user.email} />
                    <AvatarFallback>
                      {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">
                        {user.full_name || 'No name'}
                      </h4>
                      <Badge variant={roleInfo.variant}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {roleInfo.label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {user.is_active !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </div>
                      {businessCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {businessCount} business{businessCount !== 1 ? 'es' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isSuperAdmin && user.id !== user?.id && (
                      <UserActionsMenu user={user} />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {(!users || users.length === 0) && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Users will appear here once they join the platform
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export const metadata = {
  title: 'Users | Admin Dashboard',
  description: 'Manage users and their roles',
}