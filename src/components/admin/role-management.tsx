/**
 * File: src/components/admin/role-management.tsx
 * 
 * Component for managing roles and permissions
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Shield, UserCheck, Users, CheckCircle, XCircle } from 'lucide-react'

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  icon: any
  color: string
}

const roles: Role[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full system access with user management capabilities',
    permissions: [
      'Manage all users and roles',
      'View all business listings',
      'Approve/reject businesses',
      'Access system settings',
      'View analytics',
      'Invite new admin users',
      'Delete users and content'
    ],
    icon: Shield,
    color: 'text-red-600'
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Can manage business listings and moderate content',
    permissions: [
      'View all business listings',
      'Approve/reject businesses',
      'View analytics',
      'Moderate content'
    ],
    icon: UserCheck,
    color: 'text-blue-600'
  },
  {
    id: 'user',
    name: 'User',
    description: 'Standard user with basic access',
    permissions: [
      'Create business listings',
      'Edit own business listings',
      'View public content'
    ],
    icon: Users,
    color: 'text-green-600'
  }
]

export function RoleManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Role Definitions</h3>
        <p className="text-sm text-muted-foreground">
          Current roles and their permissions in the system
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => {
          const RoleIcon = role.icon

          return (
            <Card key={role.id} className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RoleIcon className={`h-5 w-5 ${role.color}`} />
                  {role.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {role.description}
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Permissions:</h4>
                  <ul className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{permission}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Permission</th>
                  <th className="text-center py-2">Super Admin</th>
                  <th className="text-center py-2">Admin</th>
                  <th className="text-center py-2">User</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">User Management</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Business Verification</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Create Business</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">View Analytics</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">System Settings</td>
                  <td className="text-center"><CheckCircle className="h-4 w-4 text-green-600 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                  <td className="text-center"><XCircle className="h-4 w-4 text-red-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}