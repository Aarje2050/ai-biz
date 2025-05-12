import { isAdmin } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side admin check
  // This ensures only admin users can access any admin routes
  const adminCheck = await isAdmin()
  
  if (!adminCheck) {
    // Redirect non-admin users to main dashboard
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* Sidebar Navigation */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <AdminSidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header with mobile menu */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 px-4 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}

/**
 * Metadata for admin pages
 * Applied to all admin routes
 */
export const metadata = {
  title: 'Admin Dashboard | AI Business Directory',
  description: 'Administrative interface for managing businesses and users',
  robots: 'noindex, nofollow', // Prevent indexing of admin pages
}