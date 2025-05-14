/**
 * ================================================================
 * FILE: /src/hooks/use-reviews.ts
 * PURPOSE: Custom hooks for review system operations
 * STATUS: ✅ Complete
 * ================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import { 
  Review, 
  ReviewStats, 
  CreateReviewData, 
  UpdateReviewData,
  CreateReplyData,
  UpdateReplyData,
  ReviewFilters,
  ReviewsResponse 
} from '@/types/reviews';

// Hook for fetching reviews for a business
export function useBusinessReviews(businessId: string, filters?: ReviewFilters) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchReviews = useCallback(async (reset = false) => {
    if (!businessId) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      
      // Build query parameters
      const params = new URLSearchParams({
        business_id: businessId,
        page: currentPage.toString(),
        limit: '20'
      });

      // Add filters to params
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(`/api/reviews?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data: ReviewsResponse = await response.json();

      if (reset) {
        setReviews(data.reviews);
        setPage(1);
      } else {
        setReviews(prev => [...prev, ...data.reviews]);
      }

      setHasMore(data.hasMore);
      setPage(currentPage + 1);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [businessId, filters, page]);

  const fetchStats = useCallback(async () => {
    if (!businessId) return;

    try {
      const response = await fetch(`/api/reviews/stats?business_id=${businessId}`);
      
      if (response.ok) {
        const data: ReviewStats = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching review stats:', err);
    }
  }, [businessId]);

  useEffect(() => {
    fetchReviews(true);
    fetchStats();
  }, [businessId, filters]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchReviews(false);
    }
  }, [loading, hasMore, fetchReviews]);

  const refresh = useCallback(() => {
    fetchReviews(true);
    fetchStats();
  }, [fetchReviews, fetchStats]);

  return {
    reviews,
    stats,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
}

// Hook for managing a single review
export function useReview(reviewId?: string) {
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReview = useCallback(async () => {
    if (!reviewId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews/${reviewId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch review');
      }

      const data: Review = await response.json();
      setReview(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching review:', err);
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    if (reviewId) {
      fetchReview();
    }
  }, [reviewId, fetchReview]);

  return {
    review,
    loading,
    error,
    refresh: fetchReview
  };
}

// Hook for review operations (create, update, delete)
export function useReviewOperations() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReview = useCallback(async (data: CreateReviewData): Promise<Review | null> => {
    if (!user) {
      setError('You must be logged in to leave a review');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create review');
      }

      const review: Review = await response.json();
      return review;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating review:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateReview = useCallback(async (
    reviewId: string, 
    data: UpdateReviewData
  ): Promise<Review | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update review');
      }

      const review: Review = await response.json();
      return review;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating review:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete review');
      }

      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting review:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const voteOnReview = useCallback(async (
    reviewId: string, 
    isHelpful: boolean
  ): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to vote on reviews');
      return false;
    }

    try {
      setError(null);

      const response = await fetch(`/api/reviews/${reviewId}/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_helpful: isHelpful }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to vote on review');
      }

      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error voting on review:', err);
      return false;
    }
  }, [user]);

  return {
    createReview,
    updateReview,
    deleteReview,
    voteOnReview,
    loading,
    error
  };
}

// Hook for review replies
export function useReviewReplies(reviewId: string) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReply = useCallback(async (data: CreateReplyData) => {
    if (!user) {
      setError('You must be logged in to reply to reviews');
      return null;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews/${reviewId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create reply');
      }

      const reply = await response.json();
      return reply;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error creating reply:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, reviewId]);

  const updateReply = useCallback(async (
    replyId: string, 
    data: UpdateReplyData
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews/${reviewId}/replies/${replyId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update reply');
      }

      const reply = await response.json();
      return reply;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error updating reply:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  const deleteReply = useCallback(async (replyId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/reviews/${reviewId}/replies/${replyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete reply');
      }

      return true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error deleting reply:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  return {
    createReply,
    updateReply,
    deleteReply,
    loading,
    error
  };
}

// Hook for user's own reviews
export function useUserReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserReviews = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reviews/my-reviews');
      
      if (!response.ok) {
        throw new Error('Failed to fetch your reviews');
      }

      const data: Review[] = await response.json();
      setReviews(data);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user, fetchUserReviews]);

  return {
    reviews,
    loading,
    error,
    refresh: fetchUserReviews
  };
}