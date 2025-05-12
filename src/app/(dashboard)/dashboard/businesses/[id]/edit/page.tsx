import { createServerSupabaseClient } from '@/lib/supabase/server'
import { BusinessForm } from '@/components/forms/business-form'
import { notFound, redirect } from 'next/navigation'

interface Props {
  params: { id: string }
}

export default async function EditBusinessPage({ params }: Props) {
  const supabase = createServerSupabaseClient()
  
  // Get the current user
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Fetch the business
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', session.user.id) // Ensure user owns this business
    .single()

  if (error || !business) {
    notFound() // Call the function, don't import it as a component
  }

  return <BusinessForm business={business} />
}