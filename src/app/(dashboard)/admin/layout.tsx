/**
 * File: src/app/(dashboard)/admin/layout.tsx
 * 
 * Layout wrapper for all admin pages
 */
import AdminLayout from '@/components/admin/admin-layout'

/**
 * Admin Layout Wrapper
 * 
 * This layout is applied to all routes under /admin
 * It handles admin authentication checks and provides the admin navigation
 */
export default function AdminLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}