/**
 * File: src/components/admin/business-detail-header.tsx
 * 
 * Header component for business detail page with verification status and actions
 */
'use client'

import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { 
  Building,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  ArrowLeft
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { QuickActionButtons } from './quick-action-buttons'

interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  verified: boolean
  rejected_at: string | null
  logo_url: string | null
  created_at: string
  profiles?: {
    full_name: string | null
    email: string
  }
}

interface BusinessDetailHeaderProps {
  business: Business
}

export function BusinessDetailHeader({ business }: BusinessDetailHeaderProps) {
  // Get status info for business
  const getStatusInfo = () => {
    if (business.rejected_at) {
      return {
        label: 'Rejected',
        variant: 'destructive' as const,
        icon: XCircle,
        color: 'text-red-600'
      }
    } else if (business.verified) {
      return {
        label: 'Verified',
        variant: 'success' as const,
        icon: CheckCircle,
        color: 'text-green-600'
      }
    } else {
      return {
        label: 'Pending',
        variant: 'secondary' as const,
        icon: Clock,
        color: 'text-orange-600'
      }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/admin/businesses">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to All Businesses
        </Button>
      </Link>

      {/* Main Header */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-start gap-6">
          {/* Business Logo */}
          <Avatar className="h-24 w-24">
            <AvatarImage src={business.logo_url || ''} alt={business.name} />
            <AvatarFallback className="text-2xl">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">{business.name}</h1>
                <p className="text-muted-foreground">
                  {business.profiles?.email}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge variant={statusInfo.variant} className="text-sm">
                  <StatusIcon className="h-4 w-4 mr-2" />
                  {statusInfo.label}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                {business.category}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Created {formatDistanceToNow(new Date(business.created_at), { addSuffix: true })}
              </div>

              {business.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {business.phone}
                </div>
              )}

              {business.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {business.email}
                </div>
              )}

              {business.website && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}

              {(business.city || business.state) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {business.city}{business.city && business.state ? ', ' : ''}{business.state}
                </div>
              )}
            </div>

            {business.description && (
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">
                {business.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
          <Link href={`/admin/businesses/${business.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Business
            </Button>
          </Link>

          <Link href={`/business/${business.slug}`} target="_blank">
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              View Public Page
            </Button>
          </Link>

          {/* Quick Actions for pending businesses */}
          {!business.verified && !business.rejected_at && (
            <div className="flex gap-2 ml-auto">
              <QuickActionButtons 
                businessId={business.id} 
                businessName={business.name}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}