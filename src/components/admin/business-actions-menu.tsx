/**
 * File: src/components/admin/business-actions-menu.tsx
 * 
 * Actions menu for individual businesses in admin panel
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { MoreHorizontal, CheckCircle, XCircle, Edit, Trash2, AlertTriangle, Loader2, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

interface BusinessActionsMenuProps {
  business: {
    id: string
    name: string
    verified: boolean
    rejected_at: string | null
  }
}

export function BusinessActionsMenu({ business }: BusinessActionsMenuProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'approve',
          notes: `Business verified by admin`
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve business')
      }

      toast({
        title: 'Business Approved',
        description: `${business.name} has been verified successfully`,
      })

      setShowApproveDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Approve error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve business',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          notes: rejectNotes || 'Business rejected by admin'
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject business')
      }

      toast({
        title: 'Business Rejected',
        description: `${business.name} has been rejected`,
      })

      setShowRejectDialog(false)
      setRejectNotes('')
      router.refresh()
    } catch (error) {
      console.error('Reject error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject business',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete business')
      }

      toast({
        title: 'Business Deleted',
        description: `${business.name} has been permanently deleted`,
      })

      setShowDeleteDialog(false)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete business',
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
          <DropdownMenuItem asChild>
            <Link href={`/business/${business.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Public Page
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuItem asChild>
            <Link href={`/admin/businesses/${business.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Business
            </Link>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {!business.verified && !business.rejected_at && (
            <>
              <DropdownMenuItem 
                onClick={() => setShowApproveDialog(true)}
                className="text-green-600 focus:text-green-600"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve Business
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => setShowRejectDialog(true)}
                className="text-red-600 focus:text-red-600"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Business
              </DropdownMenuItem>
            </>
          )}
          
          {business.verified && (
            <DropdownMenuItem 
              onClick={() => setShowRejectDialog(true)}
              className="text-red-600 focus:text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Revoke Verification
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Business
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Approve Confirmation Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Business</DialogTitle>
          </DialogHeader>
          
          <p>
            Are you sure you want to approve <strong>{business.name}</strong>?
          </p>
          <p className="text-sm text-muted-foreground">
            This will mark the business as verified and make it visible to all users.
          </p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Approving...
                </>
              ) : (
                'Approve Business'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Business</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>
              Are you sure you want to reject <strong>{business.name}</strong>?
            </p>
            
            <div>
              <label htmlFor="rejectNotes" className="text-sm font-medium">
                Reason for rejection (optional)
              </label>
              <Textarea
                id="rejectNotes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Please specify why this business is being rejected..."
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Business'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Business
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{business.name}</strong>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The business and all associated data will be permanently removed.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Business'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}