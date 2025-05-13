/**
 * File: src/app/(dashboard)/admin/page.tsx
 * 
 * Main admin dashboard page - Fixed for deployment
 */
import AdminDashboardPage from '@/components/admin/admin-dashboard-page'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

/**
 * Admin Dashboard Route
 * 
 * This page serves as the main entry point for admin functionality.
 * It automatically checks admin privileges and redirects if necessary.
 */
export default function AdminPage() {
  return <AdminDashboardPage />
}

/**
 * Page metadata for SEO and browser tabs
 */
export const metadata = {
  title: 'Admin Dashboard',
  description: 'Administrative interface for managing businesses and users',
}