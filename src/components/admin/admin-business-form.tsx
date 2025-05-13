/**
 * File: src/components/admin/admin-business-form.tsx
 * 
 * Form for admins to edit business information
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui'
import { Label } from '@/components/ui'
import { Textarea } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { Switch } from '@/components/ui'
import { Separator } from '@/components/ui'
import { 
  ArrowLeft,
  Save,
  Loader2,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { BusinessCategory } from '@/lib/supabase/types'

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
  zip_code: string | null
  hours: any
  ai_enabled: boolean
  ai_prompt: string | null
  profiles?: {
    full_name: string | null
    email: string
  }
}

interface AdminBusinessFormProps {
  business: Business
}

export function AdminBusinessForm({ business }: AdminBusinessFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: business.name || '',
    description: business.description || '',
    category: business.category || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || '',
    address: business.address || '',
    city: business.city || '',
    state: business.state || '',
    zip_code: business.zip_code || '',
    ai_enabled: business.ai_enabled || false,
    ai_prompt: business.ai_prompt || '',
    hours: business.hours || {}
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/admin/businesses/${business.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          updated_at: new Date().toISOString()
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update business')
      }

      toast({
        title: 'Business Updated',
        description: 'Business information has been updated successfully',
      })

      router.push(`/admin/businesses/${business.id}`)
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update business',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href={`/admin/businesses/${business.id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Business Details
        </Button>
      </Link>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(BusinessCategory).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the business..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) => handleInputChange('zip_code', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {daysOfWeek.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4">
                <Label className="w-24 text-sm font-medium">{label}</Label>
                <Input
                  value={formData.hours[key] || ''}
                  onChange={(e) => handleHoursChange(key, e.target.value)}
                  placeholder="e.g., 9:00 AM - 5:00 PM or Closed"
                  className="flex-1"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Assistant Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="ai_enabled">Enable AI Assistant</Label>
                <p className="text-sm text-muted-foreground">
                  Allow customers to chat with an AI assistant for this business
                </p>
              </div>
              <Switch
                id="ai_enabled"
                checked={formData.ai_enabled}
                onCheckedChange={(checked) => handleInputChange('ai_enabled', checked)}
              />
            </div>

            {formData.ai_enabled && (
              <div className="space-y-2">
                <Label htmlFor="ai_prompt">Custom AI Prompt (Optional)</Label>
                <Textarea
                  id="ai_prompt"
                  value={formData.ai_prompt}
                  onChange={(e) => handleInputChange('ai_prompt', e.target.value)}
                  placeholder="Enter a custom prompt to personalize the AI assistant for this business..."
                  className="min-h-[100px]"
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty to use the default prompt based on the business category.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>

          <Link href={`/admin/businesses/${business.id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}