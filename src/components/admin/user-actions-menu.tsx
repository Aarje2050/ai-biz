/**
 * File: src/components/admin/user-actions-menu.tsx
 * 
 * Actions menu for managing individual users
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Label } from '@/components/ui'
import { MoreHorizontal, UserX, Shield, UserCheck, Edit3, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserActionsMenuProps {
  user: {
    id: string
    email: string
    full_name: string | null
    is_admin: boolean
    is_super_admin: boolean
  }
}

export function UserActionsMenu({ user }: UserActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showRoleDialog, setShowRoleDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState(
    user.is_super_admin ? 'super_admin' : user.is_admin ? 'admin' : 'user'
  )
  const router = useRouter()
  const { toast } = useToast()

  const handleRoleChange = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      toast({
        title: 'Role Updated',
        description: `${user.email}'s role has been updated to ${selectedRole.replace('_', ' ')}`,
      })

      setShowRoleDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Role update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update role',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${user.id}/deactivate`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to deactivate user')
      }

      toast({
        title: 'User Deactivated',
        description: `${user.email} has been deactivated`,
      })

      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Deactivate error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to deactivate user',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => setShowRoleDialog(true)}>
            <Edit3 className="h-4 w-4 mr-2" />
            Change Role
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <UserX className="h-4 w-4 mr-2" />
            Deactivate User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Change Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Changing role for: <strong>{user.email}</strong>
              </p>
            </div>
            
            <div>
              <Label htmlFor="role">New Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      User (No admin access)
                    </div>
                  </SelectItem>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="super_admin">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Super Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Role'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Deactivate User
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>
              Are you sure you want to deactivate <strong>{user.email}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This will remove their admin access and prevent them from logging in. 
              This action can be reversed later.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeactivate} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}