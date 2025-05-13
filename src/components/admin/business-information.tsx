/**
 * File: src/components/admin/business-information.tsx
 * 
 * Display component for business information in admin review
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  Building, 
  Clock, 
  MapPin, 
  Bot,
  Calendar
} from 'lucide-react'
import { formatDistance } from 'date-fns'

interface BusinessHours {
  [key: string]: string
}

interface Business {
  id: string
  name: string
  description: string | null
  category: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  hours: BusinessHours | null
  ai_enabled: boolean
  ai_prompt: string | null
  created_at: string
  updated_at: string
}

interface BusinessInformationProps {
  business: Business
}

export function BusinessInformation({ business }: BusinessInformationProps) {
  const formatBusinessHours = (hours: BusinessHours | null) => {
    if (!hours) return null

    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const dayNames = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    }

    return daysOrder.map(day => {
      const dayHours = hours[day]
      if (!dayHours) return null

      return (
        <div key={day} className="flex justify-between py-1">
          <span className="font-medium">{dayNames[day as keyof typeof dayNames]}</span>
          <span className="text-muted-foreground">{dayHours}</span>
        </div>
      )
    }).filter(Boolean)
  }

  const fullAddress = [business.address, business.city, business.state, business.zip_code]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Business Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Business Name</label>
            <p className="font-medium">{business.name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <div className="mt-1">
              <Badge variant="outline">{business.category}</Badge>
            </div>
          </div>

          {business.description && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-sm mt-1 text-muted-foreground leading-relaxed">
                {business.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Created</label>
              <p className="text-sm">{formatDistance(new Date(business.created_at), new Date(), { addSuffix: true })}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
              <p className="text-sm">{formatDistance(new Date(business.updated_at), new Date(), { addSuffix: true })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      {fullAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">{business.address}</p>
              <p className="text-muted-foreground">
                {[business.city, business.state, business.zip_code].filter(Boolean).join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Hours */}
      {business.hours && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {formatBusinessHours(business.hours)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge variant={business.ai_enabled ? 'default' : 'secondary'}>
              {business.ai_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {business.ai_prompt && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Custom AI Prompt</label>
              <div className="mt-1 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{business.ai_prompt}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}