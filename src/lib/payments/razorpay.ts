/**
 * ================================================================
 * FILE: /src/lib/payments/razorpay.ts
 * PURPOSE: Razorpay integration for UPI payments
 * ================================================================
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'
import type {
  RazorpayOrderOptions,
  RazorpayOrder,
  RazorpayPaymentOptions,
  PaymentVerificationInput,
  CreatePaymentInput,
  Payment
} from '@/types/payments'

// Environment variables with better error handling
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

// Debug log for troubleshooting
if (typeof window === 'undefined') {
  console.log('Razorpay Key ID:', razorpayKeyId ? 'Present' : 'Missing')
  console.log('Razorpay Key Secret:', razorpayKeySecret ? 'Present' : 'Missing')
}

if (!razorpayKeyId) {
  throw new Error('Missing NEXT_PUBLIC_RAZORPAY_KEY_ID in environment variables')
}

if (!razorpayKeySecret && typeof window === 'undefined') {
  throw new Error('Missing RAZORPAY_KEY_SECRET in environment variables')
}

// Lazy initialization of Razorpay instance
let razorpayInstance: Razorpay | null = null

const getRazorpayInstance = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Razorpay instance should only be created on server-side')
  }
  
  if (!razorpayInstance) {
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error(`Missing Razorpay credentials: KeyID=${razorpayKeyId ? 'present' : 'missing'}, KeySecret=${razorpayKeySecret ? 'present' : 'missing'}`)
    }
    
    razorpayInstance = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })
  }
  
  return razorpayInstance
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(options: RazorpayOrderOptions): Promise<RazorpayOrder> {
  const instance = getRazorpayInstance()

  try {
    const order = await instance.orders.create({
      amount: options.amount, // amount in paise
      currency: options.currency || 'INR',
      receipt: options.receipt,
      notes: options.notes || {},
      payment_capture: options.payment_capture ?? true,
    })

    // Cast to our type to resolve type mismatch
    return order as RazorpayOrder
  } catch (error: any) {
    console.error('Failed to create Razorpay order:', error)
    throw new Error(error.message || 'Failed to create payment order')
  }
}

/**
 * Verify payment signature
 */
export function verifyPaymentSignature(params: PaymentVerificationInput): boolean {
  try {
    const { payment_id, order_id, signature } = params
    
    // Check if secret is available
    if (!razorpayKeySecret) {
      console.error('Razorpay key secret not found')
      return false
    }
    
    // Create signature string
    const signatureString = `${order_id}|${payment_id}`
    
    // Generate HMAC signature with proper type checking
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(signatureString)
      .digest('hex')
    
    // Compare signatures
    return generatedSignature === signature
  } catch (error) {
    console.error('Error verifying payment signature:', error)
    return false
  }
}

/**
 * Get payment details from Razorpay
 */
export async function getRazorpayPayment(paymentId: string): Promise<any> {
  const instance = getRazorpayInstance()

  try {
    const payment = await instance.payments.fetch(paymentId)
    return payment
  } catch (error: any) {
    console.error('Failed to fetch payment details:', error)
    throw new Error(error.message || 'Failed to fetch payment details')
  }
}

/**
 * Initialize Razorpay payment (client-side)
 */
export function initializeRazorpayPayment(options: RazorpayPaymentOptions): void {
  if (typeof window === 'undefined') {
    throw new Error('Razorpay can only be initialized on the client side')
  }

  // Load Razorpay script if not already loaded
  if (!window.Razorpay) {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => {
      const rzp = new window.Razorpay(options)
      rzp.open()
    }
    script.onerror = () => {
      throw new Error('Failed to load Razorpay script')
    }
    document.body.appendChild(script)
  } else {
    const rzp = new window.Razorpay(options)
    rzp.open()
  }
}

/**
 * Calculate amount in paise (₹1 = 100 paise)
 */
export function calculateAmountInPaise(amountInRupees: number): number {
  return Math.round(amountInRupees * 100)
}

/**
 * Calculate amount in rupees from paise
 */
export function calculateAmountInRupees(amountInPaise: number): number {
  return amountInPaise / 100
}

/**
 * Generate receipt ID for orders
 */
export function generateReceiptId(businessId: string, planName: string): string {
  const timestamp = Date.now()
  const shortBusinessId = businessId.slice(-6)
  return `${planName}_${shortBusinessId}_${timestamp}`
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Razorpay payment configuration for UPI preference
 */
export function createUpiPaymentConfig(options: RazorpayPaymentOptions): RazorpayPaymentOptions {
  return {
    ...options,
    theme: {
      color: '#3B82F6', // Blue color for UPI
      ...options.theme,
    },
    prefill: {
      method: 'upi',
      ...options.prefill,
    },
    config: {
      display: {
        blocks: {
          banks: {
            name: 'Pay via UPI',
            instruments: [
              {
                method: 'upi',
              },
            ],
          },
        },
        sequence: ['block.banks'],
        preferences: {
          show_default_blocks: false,
        },
      },
    },
  } as any
}

/**
 * Webhook signature verification
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Check if secret is provided
    if (!secret) {
      console.error('Webhook secret not provided')
      return false
    }
    
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    
    return generatedSignature === signature
  } catch (error) {
    console.error('Error verifying webhook signature:', error)
    return false
  }
}

/**
 * Error handling for Razorpay errors
 */
export function handleRazorpayError(error: any): string {
  if (error.code) {
    switch (error.code) {
      case 'BAD_REQUEST_ERROR':
        return 'Invalid payment request. Please try again.'
      case 'GATEWAY_ERROR':
        return 'Payment gateway error. Please try again.'
      case 'NETWORK_ERROR':
        return 'Network error. Please check your connection.'
      case 'SERVER_ERROR':
        return 'Server error. Please try again later.'
      default:
        return error.description || 'Payment failed. Please try again.'
    }
  }
  
  return 'An unexpected error occurred. Please try again.'
}

/**
 * Payment retry logic
 */
export async function retryPayment(
  paymentId: string,
  maxRetries: number = 3
): Promise<any> {
  let attempt = 0
  let lastError: any

  while (attempt < maxRetries) {
    try {
      attempt++
      const payment = await getRazorpayPayment(paymentId)
      
      if (payment.status === 'captured' || payment.status === 'authorized') {
        return payment
      }
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    } catch (error) {
      lastError = error
      if (attempt >= maxRetries) {
        throw error
      }
    }
  }
  
  throw lastError || new Error('Payment verification failed after retries')
}

// Export for global usage
declare global {
  interface Window {
    Razorpay: any
  }
}

export default {
  createOrder: createRazorpayOrder,
  verifySignature: verifyPaymentSignature,
  getPayment: getRazorpayPayment,
  initializePayment: initializeRazorpayPayment,
  calculateAmountInPaise,
  calculateAmountInRupees,
  generateReceiptId,
  formatCurrency,
  createUpiPaymentConfig,
  verifyWebhookSignature,
  handleRazorpayError,
  retryPayment,
}