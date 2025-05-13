/**
 * File: src/components/admin/user-management.tsx (FIXED)
 * 
 * User management component for admin settings
 */
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { InviteUserDialog } from './invite-user-dialog'
import { UserActionsMenu } from './user-actions-menu'
import { 
  Users, 
  Shield, 
  UserCheck, 
  UserPlus,
  Calendar,
  Mail
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface UserManagementProps {
  isSuperAdmin: boolean
}

interface AdminUser {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_admin: boolean
  is_super_admin: boolean
  role: string
  created_at: string
  last_sign_in: string | null
  status: 'active' | 'invited' | 'suspended'
}

export async function UserManagement({ isSuperAdmin }: UserManagementProps) {
  const supabase = createServerSupabaseClient()

  // Get current user ID first
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  const currentUserId = currentUser?.id

  // Fetch all admin users
  const { data: adminUsers, error } = await supabase
    .from('profiles')
    .select('*')
    .or('is_admin.eq.true,is_super_admin.eq.true')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Error loading users</p>
      </div>
    )
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
    <div className="space-y-6">
      {/* Header with Add User Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            {adminUsers?.length || 0} admin users
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

      {/* Users List */}
      <div className="space-y-4">
        {adminUsers?.map((user) => {
          const roleInfo = getRoleInfo(user)
          const RoleIcon = roleInfo.icon

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
                    Active
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
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {isSuperAdmin && user.id !== currentUserId && (
                  <UserActionsMenu user={user} />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {(!adminUsers || adminUsers.length === 0) && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No admin users found</h3>
          <p className="text-muted-foreground">
            Invite team members to help manage the platform
          </p>
        </div>
      )}
    </div>
  )
}