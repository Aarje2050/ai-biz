/**
 * ================================================================
 * FILE: /src/types/payments.ts
 * PURPOSE: Complete payment system type definitions
 * ================================================================
 */

// Plan types
export interface Plan {
    id: string
    name: 'free' | 'premium'
    display_name: string
    description: string
    price_monthly: number
    price_yearly: number
    trial_days: number
    features: PlanFeatures
    limits: PlanLimits
    is_active: boolean
    sort_order: number
    created_at: string
    updated_at: string
  }
  
  export interface PlanFeatures {
    basic_listing: boolean
    contact_info: boolean
    business_hours: boolean
    photos: { max: number }
    videos?: { max: number }
    ai_agent: boolean
    custom_design: boolean
    custom_domain?: boolean
    analytics: boolean
    priority_support: boolean
    job_postings?: boolean
    product_listings?: boolean
    appointment_booking?: boolean
    review_management?: boolean
  }
  
  export interface PlanLimits {
    max_photos: number
    max_videos?: number
    max_products: number
    max_jobs: number
    monthly_views: number | 'unlimited'
  }
  
  // Subscription types
  export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled' | 'suspended'
  export type BillingCycle = 'monthly' | 'yearly'
  
  export interface BusinessSubscription {
    id: string
    business_id: string
    plan_id: string
    status: SubscriptionStatus
    billing_cycle: BillingCycle
    
    // Trial tracking
    trial_start_date?: string
    trial_end_date?: string
    is_trial: boolean
    
    // Subscription dates
    started_at: string
    expires_at?: string
    cancelled_at?: string
    
    // Auto-renewal
    auto_renew: boolean
    
    created_at: string
    updated_at: string
    
    // Joined data
    plan?: Plan
  }
  
  // Payment types
  export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  export type PaymentGateway = 'razorpay'
  export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'wallet'
  
  export interface Payment {
    id: string
    subscription_id: string
    
    // Gateway details
    gateway: PaymentGateway
    gateway_payment_id?: string
    gateway_order_id?: string
    
    // Amount and currency
    amount: number
    currency: string
    
    // Payment status
    status: PaymentStatus
    payment_method?: PaymentMethod
    
    // Dates
    paid_at?: string
    failed_at?: string
    
    // Metadata
    gateway_response?: any
    failure_reason?: string
    notes?: string
    
    created_at: string
    updated_at: string
  }
  
  // Razorpay specific types
  export interface RazorpayOrderOptions {
    amount: number // in paise (₹1 = 100 paise)
    currency: string
    receipt: string
    notes?: Record<string, string>
    payment_capture?: boolean
  }
  
  export interface RazorpayOrder {
    id: string
    entity: 'order'
    amount: number
    amount_paid: number
    amount_due: number
    currency: string
    receipt: string
    offer_id?: string
    status: 'created' | 'attempted' | 'paid'
    attempts: number
    notes: Record<string, string>
    created_at: number
  }
  
  export interface RazorpayPaymentOptions {
    key: string
    amount: number
    currency: string
    order_id: string
    name: string
    description: string
    image?: string
    prefill?: {
      name?: string
      email?: string
      contact?: string
    }
    notes?: Record<string, string>
    theme?: {
      color?: string
    }
    modal?: {
      ondismiss?: () => void
    }
    handler: (response: RazorpayPaymentResponse) => void
  }
  
  export interface RazorpayPaymentResponse {
    razorpay_payment_id: string
    razorpay_order_id: string
    razorpay_signature: string
  }
  
  // Payment creation inputs
  export interface CreatePaymentInput {
    subscription_id: string
    amount: number
    currency?: string
    payment_method?: PaymentMethod
    notes?: string
  }
  
  export interface CreateSubscriptionInput {
    business_id: string
    plan_id: string
    billing_cycle: BillingCycle
    start_trial?: boolean
  }
  
  // Payment verification
  export interface PaymentVerificationInput {
    payment_id: string
    order_id: string
    signature: string
  }
  
  // Invoice types
  export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled'
  
  export interface Invoice {
    id: string
    subscription_id: string
    payment_id?: string
    
    // Invoice details
    invoice_number: string
    amount: number
    tax_amount: number
    total_amount: number
    currency: string
    
    // Billing period
    billing_period_start: string
    billing_period_end: string
    
    // Status and dates
    status: InvoiceStatus
    issued_at: string
    due_date: string
    paid_at?: string
    
    // File
    pdf_url?: string
    
    created_at: string
    updated_at: string
  }
  
  // API Response types
  export interface PaymentResponse {
    success: boolean
    data?: Payment
    error?: string
    order_id?: string
  }
  
  export interface SubscriptionResponse {
    success: boolean
    data?: BusinessSubscription
    error?: string
  }
  
  export interface PlanResponse {
    success: boolean
    data?: Plan[]
    error?: string
  }
  
  // Webhook types
  export interface RazorpayWebhookEvent {
    entity: string
    account_id: string
    event: string
    contains: string[]
    payload: {
      payment?: {
        entity: RazorpayPaymentEntity
      }
      order?: {
        entity: RazorpayOrder
      }
    }
    created_at: number
  }
  
  export interface RazorpayPaymentEntity {
    id: string
    entity: 'payment'
    amount: number
    currency: string
    status: 'created' | 'authorized' | 'captured' | 'refunded' | 'failed'
    order_id: string
    invoice_id?: string
    international: boolean
    method: PaymentMethod
    amount_refunded: number
    refund_status?: string
    captured: boolean
    description?: string
    card_id?: string
    bank?: string
    wallet?: string
    vpa?: string
    email: string
    contact: string
    notes: Record<string, string>
    fee?: number
    tax?: number
    error_code?: string
    error_description?: string
    error_source?: string
    error_step?: string
    error_reason?: string
    acquirer_data?: Record<string, any>
    created_at: number
  }
  
  // Plan selection types
  export interface PlanComparisonFeature {
    name: string
    description?: string
    free: boolean | string | number
    premium: boolean | string | number
    highlight?: boolean
  }
  
  export interface TrialInfo {
    eligible: boolean
    days: number
    message: string
  }
  
  export default {};