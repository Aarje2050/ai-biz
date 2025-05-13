/**
 * File: src/app/(dashboard)/admin/businesses/[id]/edit/page.tsx
 * 
 * Admin page for editing business information
 */
import { notFound } from 'next/navigation'
import { createServerSupabaseClient, isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminBusinessForm } from '@/components/admin/admin-business-form'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default async function AdminEditBusinessPage({
  params
}: {
  params: { id: string }
}) {
  // Check admin permissions
  const adminCheck = await isAdmin()
  if (!adminCheck) {
    redirect('/dashboard')
  }

  const supabase = createServerSupabaseClient()

  // Fetch business details first (without profiles to avoid foreign key issue)
  const { data: business, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !business) {
    console.error('Error fetching business:', error)
    notFound()
  }

  // Fetch the profile separately using the user_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', business.user_id)
    .single()

  // Combine the data
  const businessWithProfile = {
    ...business,
    profiles: profile || { full_name: null, email: 'Unknown' }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Business</h1>
          <p className="text-muted-foreground">
            Make changes to {business.name} before verification
          </p>
        </div>
      </div>

      <AdminBusinessForm business={businessWithProfile} />
    </div>
  )
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient()
  
  const { data: business } = await supabase
    .from('businesses')
    .select('name')
    .eq('id', params.id)
    .single()

  return {
    title: business?.name ? `Edit: ${business.name}` : 'Edit Business',
    description: 'Admin edit page for business information',
  }
}