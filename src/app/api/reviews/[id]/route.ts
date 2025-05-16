/**
 * ================================================================
 * FILE: /src/app/api/reviews/[id]/route.ts
 * PURPOSE: Fix update review API to use profiles
 * STATUS: ✅ Fixed
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateUpdateReview } from '@/lib/schemas/review-schema';

// PATCH /api/reviews/[id] - Update a review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const validation = validateUpdateReview(body);
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

    // Update review
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.id) // Only allow users to update their own reviews
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url),
        business:businesses(name, logo_url)
      `)
      .single();

    if (reviewError) {
      console.error('Database error updating review:', reviewError);
      return NextResponse.json(
        { error: 'Failed to update review', details: reviewError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(review);

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}