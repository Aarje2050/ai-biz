/**
 * File: src/app/business/[slug]/page.tsx
 * 
 * A professional single-page business profile with integrated AI assistant
 */
import { notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BusinessProfile } from './business-profile'

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic'

interface Business {
  id: string
  name: string
  slug: string
  description: string | null
  category: string
  phone: string | null
  email: string | null
  website: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  hours: any
  images: string[]
  logo_url: string | null
  verified: boolean
  ai_enabled: boolean
  ai_prompt: string | null
  created_at: string
  updated_at: string
}

export default async function BusinessPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = createServerSupabaseClient()
  
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', params.slug)
    .eq('verified', true)
    .single()
  
  if (error || !business) {
    console.error('Business not found:', error)
    notFound()
  }
  
  return <BusinessProfile business={business} />
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  // ... (keep existing metadata generation code)
}