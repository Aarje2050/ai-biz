'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, X, Crown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Plan } from '@/types/payments'

interface PlanSelectionProps {
  businessId?: string
  onPlanSelect: (planId: string, planName: string) => void
  loading?: boolean
}

const PLAN_FEATURES = [
  {
    name: 'Business Listing',
    free: true,
    premium: true,
  },
  {
    name: 'Photos',
    free: '3 photos',
    premium: '20 photos + videos',
  },
  {
    name: 'AI Agent',
    free: false,
    premium: true,
    highlight: true,
  },
  {
    name: 'Custom Design',
    free: false,
    premium: true,
  },
  {
    name: 'Analytics',
    free: false,
    premium: true,
  },
  {
    name: 'Priority Support',
    free: false,
    premium: true,
  },
]

export function PlanSelection({ businessId, onPlanSelect, loading }: PlanSelectionProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('free')
  const [trialEligible, setTrialEligible] = useState(true)

  const handlePlanSelect = (planId: string, planName: string) => {
    setSelectedPlan(planId)
    onPlanSelect(planId, planName)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Choose Your Plan</h2>
        <p className="text-gray-600 mt-2">Start with our free plan or unlock all features with Premium</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={cn(
          "border-2 transition-all",
          selectedPlan === 'free' ? "border-blue-500 shadow-lg" : "border-gray-200"
        )}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Free Plan</CardTitle>
              <Badge variant="secondary">Basic</Badge>
            </div>
            <div className="text-3xl font-bold">₹0<span className="text-lg font-normal">/month</span></div>
            <p className="text-gray-600">Perfect for getting started</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {PLAN_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-center">
                  {feature.free ? (
                    <Check className="h-4 w-4 text-green-500 mr-3" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400 mr-3" />
                  )}
                  <span className={cn(
                    "text-sm",
                    feature.free ? "text-gray-900" : "text-gray-500"
                  )}>
                    {feature.name}: {typeof feature.free === 'string' ? feature.free : (feature.free ? 'Included' : 'Not included')}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              variant={selectedPlan === 'free' ? "default" : "outline"}
              className="w-full"
              type="button" // Add this to prevent form submission
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                handlePlanSelect('free', 'free');
              }}
              disabled={loading}
            >
              {selectedPlan === 'free' ? 'Selected' : 'Choose Free'}
            </Button>
          </CardContent>
        </Card>

        {/* Premium Plan */}
        <Card className={cn(
          "border-2 transition-all relative",
          selectedPlan === 'premium' ? "border-purple-500 shadow-lg" : "border-gray-200"
        )}>
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-purple-600 text-white px-4 py-1 rounded-full">
              <Crown className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Premium Plan</CardTitle>
              <Badge variant="default" className="bg-purple-100 text-purple-800">
                <Zap className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </div>
            <div className="text-3xl font-bold">
              ₹499<span className="text-lg font-normal">/month</span>
            </div>
            {trialEligible && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                <p className="text-green-800 text-sm font-medium">
                  🎉 108 days FREE trial! No payment required to start.
                </p>
              </div>
            )}
            <p className="text-gray-600">Everything you need to grow</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              {PLAN_FEATURES.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <Check className="h-4 w-4 text-green-500 mr-3" />
                  <span className={cn(
                    "text-sm",
                    feature.highlight ? "text-purple-700 font-medium" : "text-gray-900"
                  )}>
                    {feature.name}: {typeof feature.premium === 'string' ? feature.premium : 'Included'}
                    {feature.highlight && ' ✨'}
                  </span>
                </li>
              ))}
            </ul>
            <Button
              variant={selectedPlan === 'premium' ? "default" : "outline"}
              className="w-full bg-purple-600 hover:bg-purple-700"
              type="button" // Add this to prevent form submission
              onClick={(e) => {
                e.preventDefault(); // Prevent form submission
                handlePlanSelect('premium', 'premium');
              }}
              disabled={loading}
            >
              {selectedPlan === 'premium' ? 'Selected' : (trialEligible ? 'Start Free Trial' : 'Choose Premium')}
            </Button>
            <p className="text-xs text-gray-500 text-center mt-2">
              {trialEligible ? 'Start your free trial, cancel anytime' : 'Upgrade anytime from your dashboard'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">
          You can upgrade or downgrade your plan anytime from your business dashboard.
        </p>
      </div>
    </div>
  )
}