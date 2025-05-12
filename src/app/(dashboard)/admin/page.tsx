/**
 * File: src/app/(dashboard)/admin/page.tsx
 * 
 * Main admin dashboard page that imports the dashboard component
 */
import AdminDashboardPage from '@/components/admin/admin-dashboard-page'

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