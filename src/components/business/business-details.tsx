'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar
} from 'lucide-react'

interface BusinessHours {
  [key: string]: string
}

interface BusinessDetailsProps {
  businessId: string
  businessHours: BusinessHours | null
  verified: boolean
  aiEnabled: boolean
  category: string
  businessName: string
}

const daysOrder = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
]

export function BusinessDetails({ 
  businessId, 
  businessHours, 
  verified, 
  aiEnabled, 
  category,
  businessName 
}: BusinessDetailsProps) {
  const [currentlyOpen, setCurrentlyOpen] = useState<boolean | null>(null)
  const [nextOpenTime, setNextOpenTime] = useState<string | null>(null)
  
  // Check if currently open and get next open time
  useEffect(() => {
    if (!businessHours) {
      setCurrentlyOpen(null)
      return
    }
    
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 100 + now.getMinutes()
    
    // Convert Sunday (0) to our format (6)
    const dayIndex = currentDay === 0 ? 6 : currentDay - 1
    const today = daysOrder[dayIndex]
    const todayHours = businessHours[today.key]
    
    if (!todayHours || todayHours === 'Closed') {
      setCurrentlyOpen(false)
      
      // Find next open day
      for (let i = 1; i <= 7; i++) {
        const nextDayIndex = (dayIndex + i) % 7
        const nextDay = daysOrder[nextDayIndex]
        const nextDayHours = businessHours[nextDay.key]
        
        if (nextDayHours && nextDayHours !== 'Closed') {
          const dayName = i === 1 ? 'Tomorrow' : nextDay.label
          setNextOpenTime(`${dayName} ${nextDayHours.split(' - ')[0]}`)
          break
        }
      }
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
    
    const isOpen = currentTime >= openTime && currentTime <= closeTime
    setCurrentlyOpen(isOpen)
    
    if (!isOpen) {
      if (currentTime < openTime) {
        // Will open today
        setNextOpenTime(`Today at ${todayHours.split(' - ')[0]}`)
      } else {
        // Find next open day
        for (let i = 1; i <= 7; i++) {
          const nextDayIndex = (dayIndex + i) % 7
          const nextDay = daysOrder[nextDayIndex]
          const nextDayHours = businessHours[nextDay.key]
          
          if (nextDayHours && nextDayHours !== 'Closed') {
            const dayName = i === 1 ? 'Tomorrow' : nextDay.label
            setNextOpenTime(`${dayName} ${nextDayHours.split(' - ')[0]}`)
            break
          }
        }
      }
    }
  }, [businessHours])
  
  // Get today's index for highlighting
  const getTodayIndex = () => {
    const today = new Date().getDay()
    return today === 0 ? 6 : today - 1
  }
  
  const todayIndex = getTodayIndex()
  
  return (
    <div className="space-y-6">
      {/* Business Hours */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl text-gray-900">
              <Clock className="w-5 h-5 text-blue-600" />
              Business Hours
            </CardTitle>
            {currentlyOpen !== null && (
              <div className="text-right">
                <Badge 
                  variant={currentlyOpen ? "success" : "destructive"}
                  className="text-white font-medium"
                >
                  {currentlyOpen ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Open Now
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Closed
                    </>
                  )}
                </Badge>
                {!currentlyOpen && nextOpenTime && (
                  <p className="text-xs text-gray-600 mt-1">Opens {nextOpenTime}</p>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {businessHours && Object.keys(businessHours).length > 0 ? (
            <div className="space-y-2">
              {daysOrder.map((day, index) => {
                const hours = businessHours[day.key] || 'Closed'
                const isToday = index === todayIndex
                const isClosed = hours === 'Closed'
                
                return (
                  <div 
                    key={day.key} 
                    className={`flex justify-between items-center p-3 rounded-lg transition-all duration-200 ${
                      isToday 
                        ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-medium min-w-[80px] ${
                        isToday ? 'text-blue-900' : 'text-gray-700'
                      }`}>
                        {day.label}
                      </span>
                      {isToday && (
                        <Badge variant="outline" className="text-xs bg-white border-blue-300 text-blue-700">
                          Today
                        </Badge>
                      )}
                    </div>
                    <span className={`font-medium ${
                      isClosed 
                        ? 'text-red-600' 
                        : isToday 
                          ? 'text-blue-900' 
                          : 'text-gray-900'
                    }`}>
                      {hours}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Business hours not available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl text-gray-900">Business Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Verification Status</span>
              <Badge 
                variant={verified ? "success" : "outline"}
                className={verified ? "text-white" : ""}
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
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">AI Assistant</span>
              <Badge 
                variant={aiEnabled ? "default" : "outline"}
                className={aiEnabled ? "bg-purple-600 text-white" : ""}
              >
                {aiEnabled ? 'Available 24/7' : 'Not Available'}
              </Badge>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Category</span>
              <Badge variant="outline" className="border-blue-300 text-blue-700 bg-white">
                {category}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}