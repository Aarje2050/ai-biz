import DashboardClient from './DashboardClient';
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Wrapper for server component
export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()
  
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/auth/signin')

  const { data: businesses } = await supabase
    .from('businesses')
    .select(`
      *,
      business_subscriptions (
        id, status, plan_id, is_trial, trial_end_date, expires_at,
        plans (name, display_name)
      )
    `)
    .eq('owner_id', session.user.id)
    .order('created_at', { ascending: false })
    console.log('Fetched businesses:', businesses) // Add this for debugging

  return <DashboardClient initialData={{ businesses: businesses || [], user: session.user }} />
}