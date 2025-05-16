'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { initializeRazorpayPayment, createUpiPaymentConfig, formatCurrency } from '@/lib/payments/razorpay'
import type { BusinessSubscription, Plan, RazorpayPaymentOptions } from '@/types/payments'

export function useSubscription(businessId?: string) {
  const [subscription, setSubscription] = useState<BusinessSubscription | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch current subscription
  const fetchSubscription = async () => {
    // Don't fetch if businessId is temporary or missing
    if (!businessId || businessId.startsWith('temp-')) {
      console.log('Skipping subscription fetch for temporary business ID')
      return
    }

    try {
      const { data, error } = await supabase
        .from('business_subscriptions')
        .select(`
          *,
          plan:plans(*)
        `)
        .eq('business_id', businessId)
        .in('status', ['trial', 'active'])
        .order('created_at', { ascending: false })
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error)
        return
      }

      setSubscription(data)
    } catch (err) {
      console.error('Error in fetchSubscription:', err)
    }
  }

  // Fetch available plans
  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')

      if (error) {
        console.error('Error fetching plans:', error)
        return
      }

      setPlans(data || [])
    } catch (err) {
      console.error('Error in fetchPlans:', err)
    }
  }

  // Check trial eligibility
  const checkTrialEligibility = async (planId: string): Promise<boolean> => {
    if (!businessId) return false

    try {
      const { data } = await supabase
        .from('business_subscriptions')
        .select('id')
        .eq('business_id', businessId)
        .eq('plan_id', planId)
        .eq('is_trial', true)
        .single()

      return !data // No previous trial = eligible
    } catch {
      return true // Error means no previous trial
    }
  }

  // Create subscription
  const createSubscription = async (planId: string, billingCycle: 'monthly' | 'yearly' = 'monthly') => {
    if (!businessId) throw new Error('Business ID required')

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_id: businessId,
          plan_id: planId,
          billing_cycle: billingCycle
        })
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to create subscription')
      }

      // If it's a free plan or trial, no payment needed
      if (result.trial || result.message?.includes('Free plan')) {
        await fetchSubscription()
        return { success: true, trial: result.trial, message: result.message }
      }

      // For paid plans, initiate Razorpay payment
      return new Promise((resolve, reject) => {
        const paymentOptions: RazorpayPaymentOptions = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: result.amount,
          currency: result.currency,
          order_id: result.order_id,
          name: 'AI Business Directory',
          description: `${result.plan_name} Plan - ${result.business_name}`,
          prefill: {
            name: result.business_name,
          },
          handler: async (response) => {
            try {
              await verifyPayment({
                payment_id: response.razorpay_payment_id,
                order_id: response.razorpay_order_id,
                signature: response.razorpay_signature,
                subscription_id: result.subscription_id
              })
              await fetchSubscription()
              resolve({ success: true, message: 'Payment successful!' })
            } catch (error: any) {
              reject(new Error(error.message || 'Payment verification failed'))
            }
          },
          modal: {
            ondismiss: () => {
              reject(new Error('Payment cancelled by user'))
            }
          }
        }

        // Configure for UPI preference
        const upiConfig = createUpiPaymentConfig(paymentOptions)
        initializeRazorpayPayment(upiConfig)
      })
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Verify payment
  const verifyPayment = async (params: {
    payment_id: string
    order_id: string
    signature: string
    subscription_id: string
  }) => {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Payment verification failed')
    }

    return result
  }

  // Cancel subscription
  const cancelSubscription = async () => {
    if (!subscription) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('business_subscriptions')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          auto_renew: false
        })
        .eq('id', subscription.id)

      if (error) throw error

      await fetchSubscription()
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Calculate days remaining
  const getDaysRemaining = (): number => {
    if (!subscription) return 0

    const endDate = subscription.trial_end_date || subscription.expires_at
    if (!endDate) return 0

    const now = new Date()
    const expiry = new Date(endDate)
    const diffTime = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return Math.max(0, diffDays)
  }

  // Get subscription status info
  const getStatusInfo = () => {
    if (!subscription) return { status: 'none', message: 'No active subscription' }

    const daysRemaining = getDaysRemaining()

    if (subscription.status === 'trial') {
      return {
        status: 'trial',
        message: `${daysRemaining} days left in trial`,
        daysRemaining
      }
    }

    if (subscription.status === 'active') {
      return {
        status: 'active',
        message: `Active until ${new Date(subscription.expires_at || '').toLocaleDateString()}`,
        daysRemaining
      }
    }

    return {
      status: subscription.status,
      message: `Subscription ${subscription.status}`,
      daysRemaining: 0
    }
  }

  // Initialize
  useEffect(() => {
    fetchPlans()
    // Only fetch subscription if we have a real business ID
    if (businessId && !businessId.startsWith('temp-')) {
      fetchSubscription()
    }
  }, [businessId])

  return {
    subscription,
    plans,
    loading,
    error,
    createSubscription,
    cancelSubscription,
    checkTrialEligibility,
    getDaysRemaining,
    getStatusInfo,
    refetchSubscription: fetchSubscription,
    formatCurrency
  }
}