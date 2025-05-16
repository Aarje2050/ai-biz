/**
 * ================================================================
 * FILE: /src/app/api/reviews/route.ts
 * PURPOSE: Reviews API using PROFILES table (after DB fix)
 * STATUS: ✅ Ready for Profiles Setup
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateCreateReview } from '@/lib/schemas/review-schema';

// GET /api/reviews - Fetch reviews using profiles table
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
    
    // After DB fix: reviews.user_id now references profiles.id
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url),
        business:businesses(name, logo_url)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reviews: reviews || [],
      total: reviews?.length || 0,
      hasMore: false
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received review data:', body);
    
    const validation = validateCreateReview(body);
    if (!validation.success) {
      console.error('Validation failed:', validation.error);
      return NextResponse.json(
        { error: 'Invalid review data', details: validation.error },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get current user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user exists in profiles (should exist due to trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Profile not found:', profileError);
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Rest of the logic remains the same...
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .eq('id', validation.data.business_id)
      .single();

    if (businessError || !business) {
      console.error('Business error:', businessError);
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    // Check if user already reviewed this business
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('business_id', validation.data.business_id)
      .eq('user_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this business' },
        { status: 400 }
      );
    }

    // Check if user owns the business
    if (business.owner_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot review your own business' },
        { status: 400 }
      );
    }

    // Create the review
    const reviewData = {
      business_id: validation.data.business_id,
      user_id: user.id, // This now references profiles.id
      rating: validation.data.rating,
      title: validation.data.title || null,
      content: validation.data.content,
      images: validation.data.images || [],
      is_verified: false,
      is_flagged: false,
      is_approved: true,
      helpful_count: 0,
      not_helpful_count: 0,
      reply_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Creating review with data:', reviewData);

    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url),
        business:businesses(name, logo_url)
      `)
      .single();

    if (reviewError) {
      console.error('Database error creating review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to create review', details: reviewError.message },
        { status: 500 }
      );
    }

    console.log('Review created successfully:', review);

    // Update business statistics
    await updateBusinessStats(supabase, validation.data.business_id);

    return NextResponse.json(review, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update business statistics
async function updateBusinessStats(supabase: any, businessId: string) {
  try {
    const { data: reviews, error }: { data: Array<{rating: number}> | null, error: any } = await supabase
      .from('reviews')
      .select('rating')
      .eq('business_id', businessId)
      .eq('is_approved', true);

    if (error || !reviews || reviews.length === 0) {
      console.error('Error fetching reviews for stats:', error);
      return;
    }

    const reviewCount = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount;

    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        rating: Math.round(averageRating * 10) / 10,
        review_count: reviewCount,
        updated_at: new Date().toISOString()
      })
      .eq('id', businessId);

    if (updateError) {
      console.error('Error updating business stats:', updateError);
    } else {
      console.log(`Updated business ${businessId} - Rating: ${averageRating}, Count: ${reviewCount}`);
    }

  } catch (error) {
    console.error('Error updating business stats:', error);
  }
}