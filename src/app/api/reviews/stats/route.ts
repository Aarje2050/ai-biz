/**
 * ================================================================
 * FILE: /src/app/api/reviews/stats/route.ts
 * PURPOSE: Fix review stats API
 * STATUS: ✅ Fixed
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

    // Get all reviews for this business
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, images, is_verified')
      .eq('business_id', businessId)
      .eq('is_approved', true);

    if (error) {
      console.error('Error fetching review stats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch review stats' },
        { status: 500 }
      );
    }

    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter(r => r.is_verified).length;
    const withPhotos = reviews.filter(r => r.images && r.images.length > 0).length;
    
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews 
      : 0;

    // Calculate rating distribution
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    const stats = {
      total_reviews: totalReviews,
      average_rating: Math.round(averageRating * 10) / 10,
      verified_reviews: verifiedReviews,
      with_photos: withPhotos,
      rating_distribution: ratingDistribution
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}