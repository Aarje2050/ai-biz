/**
 * File: src/components/ui/pagination.tsx
 * 
 * Pagination component for admin lists
 */
'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams?: Record<string, string | undefined>
}

export function Pagination({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationProps) {
  const searchParamsObj = useSearchParams()
  
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams()
    
    // Add existing search params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== 'page') {
        params.set(key, value)
      }
    })
    
    // Add page parameter
    if (page > 1) {
      params.set('page', page.toString())
    }
    
    const queryString = params.toString()
    return `${baseUrl}${queryString ? `?${queryString}` : ''}`
  }

  const getVisiblePages = () => {
    const delta = 2 // Number of pages to show around current page
    const range = []
    
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    
    if (currentPage - delta > 2) {
      range.unshift('...')
    }
    if (currentPage + delta < totalPages - 1) {
      range.push('...')
    }
    
    range.unshift(1)
    if (totalPages > 1) {
      range.push(totalPages)
    }
    
    return range
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage === 1}
      >
        <Link href={createPageUrl(currentPage - 1)}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Link>
      </Button>

      {/* Page Numbers */}
      {getVisiblePages().map((page, index) => (
        page === '...' ? (
          <span key={`dots-${index}`} className="px-3 py-2">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            asChild
          >
            <Link href={createPageUrl(page as number)}>
              {page}
            </Link>
          </Button>
        )
      ))}

      {/* Next Button */}
      <Button
        variant="outline"
        size="sm"
        asChild
        disabled={currentPage === totalPages}
      >
        <Link href={createPageUrl(currentPage + 1)}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  )
}