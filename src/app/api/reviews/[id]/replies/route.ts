/**
 * ================================================================
 * FILE: /src/app/api/reviews/[id]/replies/route.ts
 * PURPOSE: Review replies API (business responses to reviews)
 * STATUS: ✅ Complete
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { validateReplyCreate } from '@/lib/schemas/review-schema';

// GET /api/reviews/[id]/replies - Get all replies for a review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    const { data: replies, error } = await supabase
      .from('review_replies')
      .select(`
        *,
        user:users!review_replies_user_id_fkey(full_name, avatar_url, role)
      `)
      .eq('review_id', params.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error fetching replies:', error);
      return NextResponse.json(
        { error: 'Failed to fetch replies' },
        { status: 500 }
      );
    }

    return NextResponse.json(replies);

  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/reviews/[id]/replies - Create a reply to a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate reply data
    const validation = validateReplyCreate({
      review_id: params.id,
      content: body.content
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid reply data', details: validation.error },
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

    // Check if review exists and is approved
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, business_id, is_approved, user_id')
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

    if (!review.is_approved) {
      return NextResponse.json(
        { error: 'Cannot reply to unapproved review' },
        { status: 400 }
      );
    }

    // Check if user can reply to this review
    // Allow: business owner, admin/super_admin, or the review author
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const { data: business } = await supabase
      .from('businesses')
      .select('owner_id')
      .eq('id', review.business_id)
      .single();

    const isBusinessOwner = business?.owner_id === user.id;
    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
    const isReviewAuthor = review.user_id === user.id;

    if (!isBusinessOwner && !isAdmin && !isReviewAuthor) {
      return NextResponse.json(
        { error: 'You are not authorized to reply to this review' },
        { status: 403 }
      );
    }

    // Check if business owner has already replied
    if (isBusinessOwner) {
      const { data: existingReply } = await supabase
        .from('review_replies')
        .select('id')
        .eq('review_id', params.id)
        .eq('is_business_owner', true)
        .single();

      if (existingReply) {
        return NextResponse.json(
          { error: 'Business owner has already replied to this review' },
          { status: 400 }
        );
      }
    }

    // Create the reply
    const { data: reply, error: replyError } = await supabase
      .from('review_replies')
      .insert({
        review_id: params.id,
        user_id: user.id,
        content: validation.data.content,
        is_business_owner: isBusinessOwner
      })
      .select(`
        *,
        user:users!review_replies_user_id_fkey(full_name, avatar_url, role)
      `)
      .single();

    if (replyError) {
      console.error('Database error creating reply:', replyError);
      return NextResponse.json(
        { error: 'Failed to create reply' },
        { status: 500 }
      );
    }

    // Update reply count in review (handled by database trigger)

    return NextResponse.json(reply, { status: 201 });

  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}