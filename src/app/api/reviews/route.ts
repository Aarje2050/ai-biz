/**
 * ================================================================
 * FILE: /src/app/api/reviews/route.ts
 * PURPOSE: Main reviews API endpoint for CRUD operations
 * STATUS: ✅ Complete
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  validateCreateReview,
  validateReviewFilters,
  paginationSchema
} from '@/lib/schemas/review-schema';
import { Review, ReviewsResponse } from '@/types/reviews';

// GET /api/reviews - Fetch reviews with filters and pagination
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

    // Validate filters and pagination
    const filters = Object.fromEntries(searchParams);
    delete filters.business_id;
    delete filters.page;
    delete filters.limit;

    const filterValidation = validateReviewFilters(filters);
    if (!filterValidation.success) {
      return NextResponse.json(
        { error: 'Invalid filters', details: filterValidation.error },
        { status: 400 }
      );
    }

    const pageValidation = paginationSchema.safeParse({
      page: Number(searchParams.get('page')) || 1,
      limit: Number(searchParams.get('limit')) || 20
    });

    if (!pageValidation.success) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const { page, limit } = pageValidation.data;
    const offset = (page - 1) * limit;

    const supabase = createServerSupabaseClient();

    // Build query
    let query = supabase
      .from('reviews')
      .select(`
        *,
        user:users!reviews_user_id_fkey(full_name, avatar_url),
        business:businesses(name, logo_url),
        replies:review_replies(
          *,
          user:users!review_replies_user_id_fkey(full_name, avatar_url, role)
        )
      `)
      .eq('business_id', businessId)
      .eq('is_approved', true);

    // Apply filters
    const validatedFilters = filterValidation.data;
    
    if (validatedFilters.rating?.length) {
      query = query.in('rating', validatedFilters.rating);
    }
    
    if (validatedFilters.verified_only) {
      query = query.eq('is_verified', true);
    }
    
    if (validatedFilters.with_photos) {
      query = query.not('images', 'is', null);
    }
    
    if (validatedFilters.date_from) {
      query = query.gte('created_at', validatedFilters.date_from);
    }
    
    if (validatedFilters.date_to) {
      query = query.lte('created_at', validatedFilters.date_to);
    }
    
    if (validatedFilters.search) {
      query = query.or(`title.ilike.%${validatedFilters.search}%,content.ilike.%${validatedFilters.search}%`);
    }

    // Apply sorting
    switch (validatedFilters.sort_by) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'rating_high':
        query = query.order('rating', { ascending: false });
        break;
      case 'rating_low':
        query = query.order('rating', { ascending: true });
        break;
      case 'helpful':
        query = query.order('helpful_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reviews, error, count } = await query;

    if (error) {
      console.error('Database error fetching reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Check if there are more reviews
    const hasMore = count ? count > offset + limit : false;

    const response: ReviewsResponse = {
      reviews: reviews || [],
      total: count || 0,
      page,
      limit,
      hasMore
    };

    return NextResponse.json(response);

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
    
    // Validate review data
    const validation = validateCreateReview(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid review data', details: validation.error },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if business exists and is active
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('id, status, verification_status')
      .eq('id', validation.data.business_id)
      .single();

    if (businessError || !business) {
      return NextResponse.json(
        { error: 'Business not found' },
        { status: 404 }
      );
    }

    if (business.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot review inactive business' },
        { status: 400 }
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

    // Check if user owns the business (can't review own business)
    const { data: businessOwner } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', validation.data.business_id)
      .eq('owner_id', user.id)
      .single();

    if (businessOwner) {
      return NextResponse.json(
        { error: 'You cannot review your own business' },
        { status: 400 }
      );
    }

    // Create the review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .insert({
        ...validation.data,
        user_id: user.id,
        is_approved: true, // Auto-approve for verified businesses
        is_verified: false
      })
      .select(`
        *,
        user:users(full_name, avatar_url),
        business:businesses(name, logo_url)
      `)
      .single();

    if (reviewError) {
      console.error('Database error creating review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    // Update business rating and review count (handled by database trigger)
    
    return NextResponse.json(review, { status: 201 });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}