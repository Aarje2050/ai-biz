import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import {
  createRazorpayOrder,
  generateReceiptId,
  calculateAmountInPaise
} from '@/lib/payments/razorpay'
import type { Database } from '@/lib/supabase/types'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Create order API called');
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    const { business_id, plan_id, billing_cycle = 'monthly' } = body;

    if (!business_id || !plan_id) {
      console.log('❌ Missing required fields:', { business_id, plan_id });
      return NextResponse.json(
        { error: 'Missing required fields', details: { business_id: !!business_id, plan_id: !!plan_id } },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    console.log('🔌 Initializing Supabase client');
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    // Get current user
    console.log('👤 Getting current user');
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log('❌ User error:', userError);
      return NextResponse.json(
        { error: 'Unauthorized', details: userError },
        { status: 401 }
      )
    }
    console.log('✅ User found:', user.id);

    // Verify business ownership
    console.log('🏢 Verifying business ownership');
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, owner_id, name')
      .eq('id', business_id)
      .eq('owner_id', user.id)
      .single()

    if (businessError || !business) {
      console.log('❌ Business error:', businessError);
      return NextResponse.json(
        { error: 'Business not found or unauthorized', details: businessError },
        { status: 403 }
      )
    }
    console.log('✅ Business found:', business.name);

    // Get plan details
    console.log('📋 Getting plan details');
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      console.log('❌ Plan error:', planError);
      return NextResponse.json(
        { error: 'Plan not found', details: planError },
        { status: 404 }
      )
    }
    console.log('✅ Plan found:', plan.name, 'Trial days:', plan.trial_days);

    // Rest of the function continues...
    // Check for existing active subscription
    console.log('🔍 Checking for existing subscription');
    const { data: existingSubscription } = await supabase
      .from('business_subscriptions')
      .select('*')
      .eq('business_id', business_id)
      .in('status', ['trial', 'active'])
      .single()

    if (existingSubscription) {
      console.log('❌ Existing subscription found:', existingSubscription.status);
      return NextResponse.json(
        { error: 'Business already has an active subscription' },
        { status: 400 }
      )
    }

    // Check trial eligibility
    console.log('🎯 Checking trial eligibility');
    const { data: trialCheck } = await supabase
      .from('business_subscriptions')
      .select('id')
      .eq('business_id', business_id)
      .eq('plan_id', plan_id)
      .eq('is_trial', true)
      .single()

    const isTrialEligible = !trialCheck && plan.trial_days > 0
    console.log('✅ Trial eligible:', isTrialEligible, 'Plan trial days:', plan.trial_days);

    // If free plan or trial eligible, create subscription without payment
    if (plan.name === 'free' || isTrialEligible) {
      console.log('🆓 Creating free/trial subscription');
      const subscriptionData = {
        business_id,
        plan_id,
        status: plan.name === 'free' ? 'active' : 'trial',
        billing_cycle,
        is_trial: isTrialEligible,
        trial_start_date: isTrialEligible ? new Date().toISOString() : null,
        trial_end_date: isTrialEligible 
          ? new Date(Date.now() + plan.trial_days * 24 * 60 * 60 * 1000).toISOString()
          : null,
        auto_renew: true
      }

      const { data: subscription, error: subscriptionError } = await supabase
        .from('business_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (subscriptionError) {
        console.log('❌ Free/trial subscription error:', subscriptionError);
        return NextResponse.json(
          { error: 'Failed to create subscription', details: subscriptionError },
          { status: 500 }
        )
      }

      console.log('✅ Free/trial subscription created:', subscription.id);
      return NextResponse.json({
        success: true,
        subscription,
        trial: isTrialEligible,
        message: isTrialEligible 
          ? `${plan.trial_days}-day trial started successfully!`
          : 'Free plan activated successfully!'
      })
    }

    // For paid plans, create Razorpay order
    console.log('💳 Creating paid subscription with Razorpay');
    const amount = billing_cycle === 'yearly' ? plan.price_yearly : plan.price_monthly
    const amountInPaise = calculateAmountInPaise(amount)
    
    console.log('💰 Amount:', amount, 'Paise:', amountInPaise);
    
    const receiptId = generateReceiptId(business_id, plan.name)
    console.log('🧾 Receipt ID:', receiptId);
    
    let razorpayOrder;
    try {
      razorpayOrder = await createRazorpayOrder({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          business_id,
          plan_id,
          billing_cycle,
          business_name: business.name
        }
      })
      console.log('✅ Razorpay order created:', razorpayOrder.id);
    } catch (razorpayError: any) {
      console.log('❌ Razorpay error:', razorpayError);
      return NextResponse.json(
        { error: 'Failed to create payment order', details: razorpayError.message },
        { status: 500 }
      )
    }

    // Create subscription in pending state
    console.log('📝 Creating pending subscription');
    const subscriptionData = {
      business_id,
      plan_id,
      status: 'pending' as const,
      billing_cycle,
      is_trial: false,
      auto_renew: true
    }

    const { data: subscription, error: subscriptionError } = await supabase
      .from('business_subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (subscriptionError) {
      console.log('❌ Pending subscription error:', subscriptionError);
      return NextResponse.json(
        { error: 'Failed to create subscription', details: subscriptionError },
        { status: 500 }
      )
    }

    console.log('✅ Pending subscription created:', subscription.id);

    // Create payment record
    console.log('💾 Creating payment record');
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        subscription_id: subscription.id,
        gateway: 'razorpay' as const,
        gateway_order_id: razorpayOrder.id,
        amount,
        currency: 'INR',
        status: 'pending' as const
      })
      .select()
      .single()

    if (paymentError) {
      console.log('❌ Payment record error:', paymentError);
      return NextResponse.json(
        { error: 'Failed to create payment record', details: paymentError },
        { status: 500 }
      )
    }

    console.log('✅ Payment record created:', payment.id);

    return NextResponse.json({
      success: true,
      order_id: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      business_name: business.name,
      plan_name: plan.display_name,
      subscription_id: subscription.id,
      payment_id: payment.id
    })

  } catch (error: any) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}