/**
 * File: src/components/admin/business-detail-header.tsx
 * 
 * Header component for business detail page with status and quick actions
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  ArrowLeft, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { formatDistance } from 'date-fns'

interface Business {
  id: string
  name: string
  slug: string
  category: string
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  verified: boolean
  rejected_at?: string | null
  created_at: string
  updated_at: string
}

interface BusinessDetailHeaderProps {
  business: Business
}

export function BusinessDetailHeader({ business }: BusinessDetailHeaderProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusInfo = () => {
    if (business.verified) {
      return {
        icon: CheckCircle,
        label: 'Verified',
        variant: 'success' as const,
        className: 'text-green-600'
      }
    } else if (business.rejected_at) {
      return {
        icon: XCircle,
        label: 'Rejected',
        variant: 'destructive' as const,
        className: 'text-red-600'
      }
    } else {
      return {
        icon: AlertCircle,
        label: 'Pending Review',
        variant: 'warning' as const,
        className: 'text-yellow-600'
      }
    }
  }

  const status = getStatusInfo()
  const StatusIcon = status.icon

  const handleQuickAction = async (action: 'approve' | 'reject') => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/businesses/${business.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes: `Quick ${action} from header`,
        }),
      })

      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Quick action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="border-b bg-card p-6">
      <div className="flex items-start justify-between">
        {/* Left Side - Business Info */}
        <div className="flex items-start gap-4">
          {/* Back Button */}
          <Link href="/admin/businesses/pending">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>

          {/* Business Avatar */}
          <Avatar className="h-16 w-16">
            <AvatarImage src={business.logo_url || ''} alt={business.name} />
            <AvatarFallback className="text-lg">
              {business.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* Business Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{business.name}</h1>
              <Badge variant={status.variant}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {status.label}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Badge variant="outline">{business.category}</Badge>
              </div>
              {business.city && business.state && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {business.city}, {business.state}
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Created {formatDistance(new Date(business.created_at), new Date(), { addSuffix: true })}
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex items-center gap-4 text-sm">
              {business.phone && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {business.phone}
                </div>
              )}
              {business.email && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {business.email}
                </div>
              )}
              {business.website && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary"
                  >
                    Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Quick Actions for Pending Businesses */}
          {!business.verified && !business.rejected_at && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:bg-green-50"
                onClick={() => handleQuickAction('approve')}
                disabled={isLoading}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Quick Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleQuickAction('reject')}
                disabled={isLoading}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Quick Reject
              </Button>
            </>
          )}

          {/* View Public Page */}
          <Link href={`/business/${business.slug}`} target="_blank">
            <Button size="sm" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Public Page
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/businesses/${business.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Business
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/businesses/${business.id}/history`}>
                  <Calendar className="h-4 w-4 mr-2" />
                  View History
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}