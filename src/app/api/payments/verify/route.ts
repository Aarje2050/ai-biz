import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  verifyPaymentSignature,
  getRazorpayPayment,
  handleRazorpayError
} from '@/lib/payments/razorpay'
import type { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    const {
      payment_id,
      order_id,
      signature,
      subscription_id
    } = await request.json()

    if (!payment_id || !order_id || !signature || !subscription_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify payment signature
    const isSignatureValid = verifyPaymentSignature({
      payment_id,
      order_id,
      signature
    })

    if (!isSignatureValid) {
      // Update payment as failed
      await supabase
        .from('payments')
        .update({
          status: 'failed',
          failure_reason: 'Invalid signature',
          failed_at: new Date().toISOString()
        })
        .eq('gateway_order_id', order_id)

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      )
    }

    // Get payment details from Razorpay
    let razorpayPayment
    try {
      razorpayPayment = await getRazorpayPayment(payment_id)
    } catch (error: any) {
      return NextResponse.json(
        { error: handleRazorpayError(error) },
        { status: 400 }
      )
    }

    // Get subscription details
    const { data: subscription, error: subscriptionError } = await supabase
      .from('business_subscriptions')
      .select(`
        *,
        plan:plans(*),
        business:businesses(owner_id, name)
      `)
      .eq('id', subscription_id)
      .single()

    if (subscriptionError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (subscription.business.owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Update payment record
    const { data: payment, error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        gateway_payment_id: payment_id,
        status: 'completed',
        payment_method: razorpayPayment.method || 'upi',
        paid_at: new Date().toISOString(),
        gateway_response: razorpayPayment
      })
      .eq('gateway_order_id', order_id)
      .select()
      .single()

    if (paymentUpdateError) {
      console.error('Failed to update payment:', paymentUpdateError)
      return NextResponse.json(
        { error: 'Failed to update payment' },
        { status: 500 }
      )
    }

    console.log('✅ Payment updated successfully:', payment.id);

    // Update subscription status to active
    const currentDate = new Date()
    const expiresAt = subscription.plan.price_yearly > 0 && subscription.billing_cycle === 'yearly'
      ? new Date(currentDate.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)

    const { error: subscriptionUpdateError } = await supabase
      .from('business_subscriptions')
      .update({
        status: 'active',
        started_at: currentDate.toISOString(),
        expires_at: expiresAt.toISOString()
      })
      .eq('id', subscription_id)

    if (subscriptionUpdateError) {
      console.error('Failed to update subscription:', subscriptionUpdateError)
      return NextResponse.json(
        { error: 'Failed to activate subscription' },
        { status: 500 }
      )
    }

    // Generate invoice (optional)
    const { error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        subscription_id,
        payment_id: payment.id, // Use our payment record ID, not Razorpay payment ID
        invoice_number: `INV-${Date.now()}`,
        amount: razorpayPayment.amount / 100, // Convert paise to rupees
        tax_amount: 0,
        total_amount: razorpayPayment.amount / 100,
        currency: razorpayPayment.currency,
        billing_period_start: currentDate.toISOString().split('T')[0],
        billing_period_end: expiresAt.toISOString().split('T')[0],
        status: 'paid',
        paid_at: new Date().toISOString(),
        due_date: expiresAt.toISOString().split('T')[0]
      })

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError)
      // Non-critical error, continue
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and subscription activated!',
      subscription_status: 'active',
      expires_at: expiresAt.toISOString()
    })

  } catch (error: any) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}