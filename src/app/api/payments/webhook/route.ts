import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { verifyWebhookSignature } from '@/lib/payments/razorpay'
import type { Database } from '@/lib/supabase/types'
import type { RazorpayWebhookEvent } from '@/types/payments'

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature
    const signature = request.headers.get('x-razorpay-signature')
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing webhook signature' },
        { status: 400 }
      )
    }

    // Get request body
    const body = await request.text()
    
    // Verify webhook signature
    const isSignatureValid = verifyWebhookSignature(body, signature, webhookSecret)
    if (!isSignatureValid) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // Parse webhook event
    const event: RazorpayWebhookEvent = JSON.parse(body)
    
    // Initialize Supabase client
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    console.log('Webhook event received:', event.event)

    // Handle payment events
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment?.entity
      if (!payment) {
        return NextResponse.json({ error: 'No payment data' }, { status: 400 })
      }

      // Update payment status
      await supabase
        .from('payments')
        .update({
          gateway_payment_id: payment.id,
          status: 'completed',
          payment_method: payment.method,
          paid_at: new Date(payment.created_at * 1000).toISOString(),
          gateway_response: payment
        })
        .eq('gateway_order_id', payment.order_id)

      // Get subscription and activate it
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('subscription_id')
        .eq('gateway_order_id', payment.order_id)
        .single()

      if (paymentRecord) {
        const currentDate = new Date()
        const expiresAt = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000)

        await supabase
          .from('business_subscriptions')
          .update({
            status: 'active',
            started_at: currentDate.toISOString(),
            expires_at: expiresAt.toISOString()
          })
          .eq('id', paymentRecord.subscription_id)
      }
    }

    // Handle payment failures
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment?.entity
      if (!payment) {
        return NextResponse.json({ error: 'No payment data' }, { status: 400 })
      }

      await supabase
        .from('payments')
        .update({
          gateway_payment_id: payment.id,
          status: 'failed',
          failure_reason: payment.error_description || payment.error_code,
          failed_at: new Date(payment.created_at * 1000).toISOString(),
          gateway_response: payment
        })
        .eq('gateway_order_id', payment.order_id)

      // Update subscription status to cancelled
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('subscription_id')
        .eq('gateway_order_id', payment.order_id)
        .single()

      if (paymentRecord) {
        await supabase
          .from('business_subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('id', paymentRecord.subscription_id)
      }
    }

    // Handle order payment attempts
    if (event.event === 'order.paid') {
      const order = event.payload.order?.entity
      if (!order) {
        return NextResponse.json({ error: 'No order data' }, { status: 400 })
      }

      console.log('Order paid:', order.id)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully'
    })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}