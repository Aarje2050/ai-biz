/**
 * File: src/app/(dashboard)/dashboard/businesses/[id]/edit/page.tsx (PROPERLY FIXED)
 * 
 * Fix the business edit page - handle the error properly
 */
import { notFound } from 'next/navigation'
import { createServerSupabaseClient, getServerUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BusinessForm } from '@/components/forms/business-form'
import { Database } from '@/lib/supabase/types'

type Business = Database['public']['Tables']['businesses']['Row']


export default async function EditBusinessPage({
  params
}: {
  params: { id: string }
}) {
  const user = await getServerUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
  .from('businesses')
  .select('*')
  .eq('id', params.id)
  .eq('user_id', user.id)
  .single()

const business = data as Business | null


  // Check for error first
  if (error) {
    console.error('Error fetching business:', error)
    notFound()
  }

  // Check if business exists (data could be null)
  if (!business) {
    console.error('Business not found')
    notFound()
  }

  // At this point, business is guaranteed to be the correct type
  // because we've handled the error cases above
  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Business</h1>
          <p className="text-muted-foreground">
            Update your business information
          </p>
        </div>
      </div>
      
      <BusinessForm business={business} />
    </div>
  )
}