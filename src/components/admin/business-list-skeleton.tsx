/**
 * File: src/components/admin/business-list-skeleton.tsx
 * 
 * Loading skeleton for business list
 */
import { Card, CardContent } from '@/components/ui'

export function BusinessListSkeleton() {
  return (
    <div className="space-y-4">
      {/* Results summary skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>
      
      {/* Business cards skeleton */}
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Avatar skeleton */}
                <div className="h-16 w-16 bg-muted animate-pulse rounded-full" />
                
                {/* Business info skeleton */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                    </div>
                    <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-40 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-36 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-28 bg-muted animate-pulse rounded" />
                  </div>
                  
                  <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                </div>
                
                {/* Actions skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-8 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex items-center justify-center space-x-2">
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        <div className="h-8 w-20 bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}