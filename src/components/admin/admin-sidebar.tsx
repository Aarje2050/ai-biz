/**
 * File: src/components/admin/admin-sidebar.tsx
 * 
 * Admin sidebar navigation component with menu items
 * and active state management
 */
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui'
import {
  ShieldCheck,
  Building,
  Users,
  BarChart3,
  Settings,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Home
} from 'lucide-react'

interface NavItem {
  title: string
  href: string
  icon: any
  description: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    description: 'Overview and stats'
  },
  {
    title: 'Pending Verification',
    href: '/admin/businesses/pending',
    icon: Clock,
    description: 'Businesses waiting approval'
  },
  {
    title: 'All Businesses',
    href: '/admin/businesses',
    icon: Building,
    description: 'Manage all business listings'
  },
  {
    title: 'Verified Businesses',
    href: '/admin/businesses/verified',
    icon: CheckCircle,
    description: 'Approved business listings'
  },
  {
    title: 'Rejected Businesses',
    href: '/admin/businesses/rejected',
    icon: XCircle,
    description: 'Declined business listings'
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    description: 'Manage user accounts'
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform statistics'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Admin settings and config'
  }
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col bg-card border-r">
      {/* Logo/Brand */}
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center gap-3">
          <ShieldCheck className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Business Directory</p>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start h-auto p-3',
                  isActive && 'bg-primary/10 font-medium'
                )}
              >
                <Icon className={cn(
                  'h-5 w-5 mr-3',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )} />
                <div className="text-left">
                  <div className="text-sm">{item.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4">
        <Link href="/dashboard">
          <Button variant="outline" className="w-full">
            <Home className="h-4 w-4 mr-2" />
            Back to Main Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}