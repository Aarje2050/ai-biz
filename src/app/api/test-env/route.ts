import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    public_key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 'Present' : 'Missing',
    secret_key: process.env.RAZORPAY_KEY_SECRET ? 'Present' : 'Missing'
  })
}