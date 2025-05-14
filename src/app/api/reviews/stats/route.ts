/**
 * ================================================================
 * FILE: /src/app/api/reviews/stats/route.ts
 * PURPOSE: Review statistics endpoint for businesses
 * STATUS: ✅ Complete
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ReviewStats } from '@/types/reviews';

// GET /api/reviews/stats - Get review statistics for a business
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    
    if (!businessId) {
      return NextResponse.json(
        { error: 'Business ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get review statistics
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, is_verified, images, created_at')
      .eq('business_id', businessId)
      .eq('is_approved', true);

    if (error) {
      console.error('Database error fetching review stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch review statistics' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
      : 0;

    // Rating distribution
    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // Verified reviews count
    const verifiedReviews = reviews.filter(review => review.is_verified).length;

    // Reviews with photos
    const withPhotos = reviews.filter(review => 
      review.images && review.images.length > 0
    ).length;

    // Recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentReviews = reviews.filter(review => 
      new Date(review.created_at) >= thirtyDaysAgo
    ).length;

    const stats: ReviewStats = {
      total_reviews: totalReviews,
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      rating_distribution: ratingDistribution,
      verified_reviews: verifiedReviews,
      with_photos: withPhotos,
      recent_reviews: recentReviews
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching review statistics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}