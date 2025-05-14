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
  
  console.log('Looking for business with slug:', params.slug);
  
// In src/app/business/[slug]/page.tsx
const { data: business, error } = await supabase
  .from('businesses')
  .select(`
    *,
    rating,
    review_count
  `)
  .eq('slug', params.slug)
  .eq('verified', true)
  .single()
  
  console.log('Query result:', { business, error });
  
  if (error) {
    console.error('Database error:', error);
    console.error('Error details:', error.details, error.message, error.code);
  }
  
  if (!business) {
    console.log('No business found with slug:', params.slug);
    console.log('Available businesses (for debugging):');
    
    // Debug query - check what businesses exist
    const { data: allBusinesses } = await supabase
      .from('businesses')
      .select('slug, name, verified')
      .limit(5);
    
    console.log('Sample businesses:', allBusinesses);
  }
  
  if (error || !business) {
    notFound()
  }
  
  return <BusinessProfile business={business} />
}