/**
 * ================================================================
 * FILE: /src/components/reviews/review-list.tsx - Missing Imports Fix
 * PURPOSE: Fix missing imports for review list component
 * STATUS: ✅ Complete
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import { Star, Filter, SortAsc, Search } from 'lucide-react';
import { Review, ReviewFilters, ReviewStats } from '@/types/reviews';
import { useBusinessReviews } from '@/hooks/use-reviews';
import { ReviewCard } from './review-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ReviewListProps {
  businessId: string;
  businessName?: string;
  showFilters?: boolean;
  initialFilters?: ReviewFilters;
  onReviewUpdate?: (review: Review) => void;
  onReviewDelete?: (reviewId: string) => void;
  isBusinessOwner?: boolean; // Add this prop
}

export function ReviewList({ 
  businessId, 
  businessName,
  showFilters = true,
  initialFilters,
  onReviewUpdate,
  onReviewDelete,
  isBusinessOwner = false // Default to false
}: ReviewListProps) {
  const [filters, setFilters] = useState<ReviewFilters>(initialFilters || {});
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const {
    reviews,
    stats,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  } = useBusinessReviews(businessId, filters);

  // Update filters when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: searchQuery || undefined
      }));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleFilterChange = (newFilters: Partial<ReviewFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  const renderReviewStats = () => {
    if (!stats) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Review Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.total_reviews}</div>
              <div className="text-sm text-gray-600">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="text-2xl font-bold">{stats.average_rating}</span>
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.verified_reviews}</div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.with_photos}</div>
              <div className="text-sm text-gray-600">With Photos</div>
            </div>
          </div>

          {/* Rating distribution */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Rating Distribution</h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.rating_distribution[rating] || 0;
                const percentage = stats.total_reviews > 0 
                  ? (count / stats.total_reviews) * 100 
                  : 0;

                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="w-8 text-sm">{rating}</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-sm text-gray-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderFilters = () => {
    if (!showFilters) return null;

    const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

    return (
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <Select
          value={filters.sort_by || 'newest'}
          onValueChange={(value) => handleFilterChange({ sort_by: value as ReviewFilters['sort_by'] })}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="rating_high">Highest Rating</SelectItem>
            <SelectItem value="rating_low">Lowest Rating</SelectItem>
            <SelectItem value="helpful">Most Helpful</SelectItem>
          </SelectContent>
        </Select>

        {/* Filter Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="relative">
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Reviews</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Rating Filter */}
              <div>
                <h4 className="font-medium mb-2">Rating</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const isSelected = filters.rating?.includes(rating) || false;
                    return (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={isSelected}
                          onCheckedChange={(checked: boolean) => {
                            const currentRatings = filters.rating || [];
                            if (checked) {
                              handleFilterChange({ 
                                rating: [...currentRatings, rating] 
                              });
                            } else {
                              handleFilterChange({ 
                                rating: currentRatings.filter(r => r !== rating) 
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1">
                          {rating}
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          & above
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              {/* Other Filters */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="verified-only"
                    checked={filters.verified_only || false}
                    onCheckedChange={(checked: boolean) => 
                      handleFilterChange({ verified_only: checked || undefined })
                    }
                  />
                  <Label htmlFor="verified-only">Verified reviews only</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="with-photos"
                    checked={filters.with_photos || false}
                    onCheckedChange={(checked: boolean) => 
                      handleFilterChange({ with_photos: checked || undefined })
                    }
                  />
                  <Label htmlFor="with-photos">Reviews with photos</Label>
                </div>
              </div>

              <Separator />

              {/* Date Range */}
              <div>
                <h4 className="font-medium mb-2">Date Range</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="date-from" className="text-xs">From</Label>
                    <Input
                      id="date-from"
                      type="date"
                      value={filters.date_from || ''}
                      onChange={(e) => handleFilterChange({ date_from: e.target.value || undefined })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="date-to" className="text-xs">To</Label>
                    <Input
                      id="date-to"
                      type="date"
                      value={filters.date_to || ''}
                      onChange={(e) => handleFilterChange({ date_to: e.target.value || undefined })}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  className="flex-1"
                >
                  Clear All
                </Button>
                <Button 
                  onClick={() => setIsFilterDialogOpen(false)}
                  className="flex-1"
                >
                  Apply
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">
            <p>Error loading reviews: {error}</p>
            <Button onClick={refresh} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {renderReviewStats()}
      {renderFilters()}

      {/* Reviews */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          // Loading skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onUpdate={onReviewUpdate}
                onDelete={onReviewDelete}
                businessId={businessId}
                isBusinessOwner={isBusinessOwner}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  onClick={loadMore} 
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? 'Loading...' : 'Load More Reviews'}
                </Button>
              </div>
            )}
          </>
        ) : (
          // No reviews
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-gray-600">
                <Star className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <h3 className="font-medium">No reviews yet</h3>
                <p className="text-sm">
                  {businessName} hasn't received any reviews yet. Be the first to share your experience!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}