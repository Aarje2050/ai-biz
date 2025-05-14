/**
 * ================================================================
 * FILE: /src/app/api/reviews/[id]/route.ts
 * PURPOSE: Individual review operations (GET, PATCH, DELETE)
 * STATUS: ✅ Complete
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateUpdateReview } from '@/lib/schemas/review-schema';

// GET /api/reviews/[id] - Get a specific review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: review, error } = await supabase
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
      .eq('id', params.id)
      .eq('is_approved', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      console.error('Database error fetching review:', error);
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }

    return NextResponse.json(review);

  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews/[id] - Update a review
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate update data
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

    // Check if review exists and user owns it
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id, business_id, created_at')
      .eq('id', params.id)
      .single();

    if (reviewError) {
      if (reviewError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }

    // Check ownership
    if (existingReview.user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only edit your own reviews' },
        { status: 403 }
      );
    }

    // Check if review is recent enough to edit (24 hours)
    const reviewDate = new Date(existingReview.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      return NextResponse.json(
        { error: 'Reviews can only be edited within 24 hours of creation' },
        { status: 400 }
      );
    }

    // Update the review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({
        ...validation.data,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        user:users!reviews_user_id_fkey(full_name, avatar_url),
        business:businesses(name, logo_url),
        replies:review_replies(
          *,
          user:users!review_replies_user_id_fkey(full_name, avatar_url, role)
        )
      `)
      .single();

    if (updateError) {
      console.error('Database error updating review:', updateError);
      return NextResponse.json(
        { error: 'Failed to update review' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedReview);

  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if review exists and user owns it or is admin
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('user_id, business_id')
      .eq('id', params.id)
      .single();

    if (reviewError) {
      if (reviewError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Review not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch review' },
        { status: 500 }
      );
    }

    // Check ownership or admin status
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
    const isOwner = existingReview.user_id === user.id;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'You can only delete your own reviews' },
        { status: 403 }
      );
    }

    // Delete the review (this will cascade to replies and votes)
    const { error: deleteError } = await supabase
      .from('reviews')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Database error deleting review:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}