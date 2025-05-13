/**
 * File: src/components/admin/quick-action-buttons.tsx
 * 
 * Fixed quick action buttons that work properly
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface QuickActionButtonsProps {
  businessId: string
  businessName: string
}

export function QuickActionButtons({ businessId, businessName }: QuickActionButtonsProps) {
  const [isLoading, setIsLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleQuickAction = async (action: 'approve' | 'reject') => {
    setIsLoading(action)
    
    try {
      const response = await fetch(`/api/admin/businesses/${businessId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes: action === 'approve' 
            ? `Quick approve for ${businessName}`
            : `Quick reject - needs review`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update business')
      }

      const result = await response.json()
      
      toast({
        title: 'Success',
        description: `Business ${action}ed successfully`,
      })

      // Refresh the page to show updated status
      router.refresh()
    } catch (error) {
      console.error('Quick action error:', error)
      toast({
        title: 'Error',
        description: `Failed to ${action} business`,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <>
      <Button 
        onClick={() => handleQuickAction('approve')}
        disabled={isLoading !== null}
        size="sm" 
        variant="outline" 
        className="text-green-600 hover:bg-green-50"
      >
        {isLoading === 'approve' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
      </Button>
      
      <Button 
        onClick={() => handleQuickAction('reject')}
        disabled={isLoading !== null}
        size="sm" 
        variant="outline" 
        className="text-red-600 hover:bg-red-50"
      >
        {isLoading === 'reject' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
      </Button>
    </>
  )
}