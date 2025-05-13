/**
 * File: src/components/admin/verification-history.tsx
 * 
 * Display component for business verification history (FIXED)
 */
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  History, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Clock,
  FileText
} from 'lucide-react'
import { formatDistance, format } from 'date-fns'

interface VerificationHistoryProps {
  businessId: string
}

// Fixed interface to allow both null and string for admin
interface VerificationHistoryItem {
  id: string
  action: string
  timestamp: string
  admin: string | null  // This now allows both string and null
  notes: string
}

// Note: This is a simplified version. In a real implementation, you'd want to
// create a separate table to track verification history with admin actions
export async function VerificationHistory({ businessId }: VerificationHistoryProps) {
  const supabase = createServerSupabaseClient()

  // For now, we'll get the current business status
  // In production, you'd have a verification_history table
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single()

  if (error || !business) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Verification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No history available</p>
        </CardContent>
      </Card>
    )
  }

  // Mock history data based on current status
  const historyItems: VerificationHistoryItem[] = [
    {
      id: '1',
      action: 'created',
      timestamp: business.created_at,
      admin: null,
      notes: 'Business listing created'
    }
  ]

  if (business.verified) {
    historyItems.push({
      id: '2',
      action: 'verified',
      timestamp: business.updated_at,
      admin: 'Admin User',  // This now works with the updated interface
      notes: business.verification_notes || 'Business approved'
    })
  } else if (business.rejected_at) {
    historyItems.push({
      id: '2',
      action: 'rejected',
      timestamp: business.rejected_at,
      admin: 'Admin User',  // This now works with the updated interface
      notes: business.verification_notes || 'Business rejected'
    })
  }

  // Sort by timestamp descending
  historyItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  const getActionInfo = (action: string) => {
    switch (action) {
      case 'verified':
        return {
          icon: CheckCircle,
          label: 'Verified',
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      case 'rejected':
        return {
          icon: XCircle,
          label: 'Rejected',
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      case 'pending':
        return {
          icon: AlertCircle,
          label: 'Pending Review',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        }
      default:
        return {
          icon: Clock,
          label: 'Created',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100'
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Verification History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {historyItems.map((item, index) => {
            const actionInfo = getActionInfo(item.action)
            const ActionIcon = actionInfo.icon
            const isLatest = index === 0

            return (
              <div key={item.id} className="relative">
                {/* Timeline line */}
                {index < historyItems.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-0 w-px bg-border" />
                )}

                <div className="flex items-start gap-4">
                  {/* Action icon */}
                  <div className={`p-3 rounded-full ${actionInfo.bgColor} ${actionInfo.color}`}>
                    <ActionIcon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={isLatest ? 'default' : 'secondary'}>
                        {actionInfo.label}
                      </Badge>
                      {isLatest && (
                        <Badge variant="outline" className="text-xs">
                          Current Status
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <p className="font-medium">{item.notes}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(item.timestamp), 'PPP p')}
                        </div>
                        <div className="flex items-center gap-1">
                          <p>{formatDistance(new Date(item.timestamp), new Date(), { addSuffix: true })}</p>
                        </div>
                      </div>

                      {item.admin && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span>by {item.admin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Note about future implementation */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Note</p>
              <p>
                This is a simplified view. In production, you would implement a separate 
                verification history table to track all admin actions, timestamps, and notes.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}