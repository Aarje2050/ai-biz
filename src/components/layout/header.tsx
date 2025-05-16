/**
 * FILE: /src/components/layout/header.tsx
 * PURPOSE: Header with sticky search bar (appears on scroll)
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Search, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function Header() {
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  
  // Show search bar when scrolled down on homepage
  useEffect(() => {
    if (pathname !== '/') return
    
    const handleScroll = () => {
      const scrolled = window.scrollY > 300 // Show after hero section
      setShowSearch(scrolled)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    setSearchQuery('')
  }

  const isSearchPage = pathname === '/search'
  const isHomePage = pathname === '/'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              AI Business Directory
            </span>
          </Link>

          {/* Sticky Search Bar (Homepage only, when scrolled) */}
          {isHomePage && showSearch && (
            <div className="flex-1 max-w-lg mx-8">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search businesses..."
                    className="pl-10 h-10 border-gray-300 rounded-full"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/browse" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Browse
            </Link>
            <Link 
              href="/categories" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Categories
            </Link>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard/businesses/new">
                List Business
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}