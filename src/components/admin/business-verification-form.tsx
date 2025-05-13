/**
 * File: src/components/admin/business-verification-form.tsx
 * 
 * Form component for approving or rejecting business verifications
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Label } from '@/components/ui'
import { RadioGroup, RadioGroupItem } from '@/components/ui'
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Business {
  id: string
  name: string
  verified: boolean
  rejected_at?: string | null
  verification_notes?: string | null
}

interface VerificationFormProps {
  business: Business
}

type VerificationAction = 'approve' | 'reject' | 'pending'

export function BusinessVerificationForm({ business }: VerificationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [action, setAction] = useState<VerificationAction>(
    business.verified ? 'approve' : business.rejected_at ? 'reject' : 'pending'
  )
  const [notes, setNotes] = useState(business.verification_notes || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/businesses/${business.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update verification status')
      }

      toast({
        title: 'Success',
        description: `Business ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'updated'} successfully`,
      })

      router.refresh()
    } catch (error) {
      console.error('Verification error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Verification Decision
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Status */}
          <div className="rounded-lg border p-4 bg-muted/50">
            <h3 className="font-medium mb-2">Current Status</h3>
            <div className="flex items-center gap-2">
              {business.verified ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-600 font-medium">Verified</span>
                </>
              ) : business.rejected_at ? (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">Rejected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-yellow-600 font-medium">Pending Review</span>
                </>
              )}
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-4">
            <Label htmlFor="action">Select Action</Label>
            <RadioGroup value={action} onValueChange={(value: VerificationAction) => setAction(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="approve" id="approve" />
                <Label htmlFor="approve" className="flex items-center gap-2 cursor-pointer">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Approve Business</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reject" id="reject" />
                <Label htmlFor="reject" className="flex items-center gap-2 cursor-pointer">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Reject Business</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending" className="flex items-center gap-2 cursor-pointer">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span>Keep as Pending</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Verification Notes
              {action === 'reject' && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                action === 'approve'
                  ? 'Optional: Add any notes about the verification...'
                  : action === 'reject'
                  ? 'Required: Explain why this business is being rejected...'
                  : 'Optional: Add any review notes...'
              }
              className="min-h-[100px]"
              required={action === 'reject'}
            />
            <p className="text-sm text-muted-foreground">
              {action === 'reject' 
                ? 'Please provide a clear reason for rejection. This will help the business owner understand what needs to be corrected.'
                : 'These notes will be saved for internal reference and may be shown to the business owner.'
              }
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || (action === 'reject' && !notes.trim())}
              className={
                action === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : action === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : ''
              }
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {action === 'approve' && <CheckCircle className="h-4 w-4 mr-2" />}
                  {action === 'reject' && <XCircle className="h-4 w-4 mr-2" />}
                  {action === 'pending' && <AlertCircle className="h-4 w-4 mr-2" />}
                  {action === 'approve' ? 'Approve Business' : 
                   action === 'reject' ? 'Reject Business' : 
                   'Update Status'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}