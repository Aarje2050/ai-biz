/**
 * File: src/components/admin/recent-verifications.tsx
 * 
 * Display recent verification activities (approvals/rejections)
 */
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  CheckCircle, 
  XCircle, 
  Shield,
  Clock,
  User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface VerificationActivity {
  id: string
  business_name: string
  business_logo: string | null
  admin_email: string
  action: 'verified' | 'rejected'
  created_at: string
  updated_at: string
}

export async function RecentVerifications() {
  const supabase = createServerSupabaseClient()

  // Query for recently verified or rejected businesses
  // Note: We'll need to modify the businesses table to track who verified/rejected
  const { data: verifications, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      logo_url,
      verified,
      updated_at,
      created_at
    `)
    .or('verified.eq.true,rejected_at.not.is.null')
    .order('updated_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error fetching recent verifications:', error)
    return (
      <div className="text-muted-foreground">
        Error loading recent activity
      </div>
    )
  }

  if (!verifications || verifications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No recent verification activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {verifications.map((verification) => {
        const isVerified = verification.verified
        const timeAgo = formatDistanceToNow(new Date(verification.updated_at), { addSuffix: true })
        
        return (
          <div key={verification.id} className="flex items-start gap-4 p-4 rounded-lg border">
            {/* Action Icon */}
            <div className={`p-2 rounded-full ${
              isVerified ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}>
              {isVerified ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={verification.logo_url || ''} alt={verification.name} />
                  <AvatarFallback className="text-xs">
                    {verification.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium truncate">{verification.name}</span>
                <Badge variant={isVerified ? 'default' : 'destructive'} className="text-xs">
                  {isVerified ? 'Verified' : 'Rejected'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Business was {isVerified ? 'approved' : 'rejected'} {timeAgo}
              </p>
              
              {/* Admin info (placeholder - you might want to track this in the DB) */}
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <User className="h-3 w-3" />
                <span>Admin action</span>
              </div>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </div>
          </div>
        )
      })}
    </div>
  )
}