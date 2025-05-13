'use client'
/**
 * File: src/components/business/business-details.tsx
 * 
 * Client component for business details with interactive features
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { Button } from '@/components/ui'
import { Separator } from '@/components/ui'
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Share2
} from 'lucide-react'

interface BusinessHours {
  day: string
  dayShort: string
  hours: string
}

interface BusinessDetailsProps {
  businessId: string
  businessHours: BusinessHours[] | null
  verified: boolean
  aiEnabled: boolean
  category: string
  businessName: string
}

export function BusinessDetails({ 
  businessId, 
  businessHours, 
  verified, 
  aiEnabled, 
  category,
  businessName 
}: BusinessDetailsProps) {
  const [currentlyOpen, setCurrentlyOpen] = useState<boolean | null>(null)
  
  // Check if currently open
  useEffect(() => {
    if (!businessHours) {
      setCurrentlyOpen(null)
      return
    }
    
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    
    // Adjust for Monday = 0, Sunday = 6 format
    const dayIndex = currentDay === 0 ? 6 : currentDay - 1
    const todayHours = businessHours[dayIndex]?.hours
    
    if (!todayHours || todayHours === 'Closed') {
      setCurrentlyOpen(false)
      return
    }
    
    // Parse hours (assumes format like "9:00 AM - 5:00 PM")
    const hoursRegex = /(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i
    const match = todayHours.match(hoursRegex)
    
    if (!match) {
      setCurrentlyOpen(null)
      return
    }
    
    const [, openHour, openMin, openPeriod, closeHour, closeMin, closePeriod] = match
    
    let openTime = parseInt(openHour) * 100 + parseInt(openMin)
    let closeTime = parseInt(closeHour) * 100 + parseInt(closeMin)
    
    if (openPeriod.toUpperCase() === 'PM' && parseInt(openHour) !== 12) openTime += 1200
    if (closePeriod.toUpperCase() === 'PM' && parseInt(closeHour) !== 12) closeTime += 1200
    if (openPeriod.toUpperCase() === 'AM' && parseInt(openHour) === 12) openTime -= 1200
    if (closePeriod.toUpperCase() === 'AM' && parseInt(closeHour) === 12) closeTime -= 1200
    
    setCurrentlyOpen(currentTime >= openTime && currentTime <= closeTime)
  }, [businessHours])
  
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: businessName,
          text: `Check out ${businessName}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback to copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        // You could show a toast here
        console.log('Link copied to clipboard')
      } catch (err) {
        console.log('Error copying to clipboard:', err)
      }
    }
  }
  
  return (
    <div className="space-y-6">
      {/* Business Hours */}
      {businessHours && businessHours.some(h => h.hours !== 'Closed') && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Hours
              </CardTitle>
              {currentlyOpen !== null && (
                <Badge 
                  variant={currentlyOpen ? "success" : "destructive"}
                  className="text-white"
                >
                  {currentlyOpen ? 'Open Now' : 'Closed'}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {businessHours.map(({ day, dayShort, hours }, index) => {
                const today = new Date().getDay()
                const dayIndex = index === 6 ? 0 : index + 1
                const isToday = dayIndex === today
                
                return (
                  <div 
                    key={day} 
                    className={`flex justify-between items-center p-3 rounded-lg ${
                      isToday ? 'bg-primary/10 border-2 border-primary/20' : 'bg-muted/50'
                    }`}
                  >
                    <span className={`font-medium ${isToday ? 'text-primary' : ''}`}>
                      {day}
                      {isToday && <span className="ml-2 text-xs">(Today)</span>}
                    </span>
                    <span className={`${
                      hours === 'Closed' 
                        ? 'text-red-500' 
                        : isToday 
                          ? 'text-primary font-medium' 
                          : 'text-foreground'
                    }`}>
                      {hours}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Business Stats */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge 
              variant={verified ? "success" : "secondary"}
              className="ml-2"
            >
              {verified ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending
                </>
              )}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">AI Chat</span>
            <Badge 
              variant={aiEnabled ? "default" : "outline"}
              className="ml-2"
            >
              {aiEnabled ? 'Available' : 'Not Available'}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Category</span>
            <Badge variant="outline" className="ml-2">
              {category}
            </Badge>
          </div>
          
          <Separator />
          
          <Button
            onClick={handleShare}
            variant="outline"
            className="w-full justify-center"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Business
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}