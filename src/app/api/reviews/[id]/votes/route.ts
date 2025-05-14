/**
 * ================================================================
 * FILE: /src/app/api/reviews/[id]/votes/route.ts
 * PURPOSE: Review voting functionality (helpful/not helpful)
 * STATUS: ✅ Complete
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { reviewVoteSchema } from '@/lib/schemas/review-schema';

// POST /api/reviews/[id]/votes - Vote on a review
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate vote data
    const validation = reviewVoteSchema.safeParse({
      review_id: params.id,
      is_helpful: body.is_helpful
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: validation.error },
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

    // Check if review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, user_id, is_approved')
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
        { error: 'Cannot vote on unapproved review' },
        { status: 400 }
      );
    }

    // Check if user is trying to vote on their own review
    if (review.user_id === user.id) {
      return NextResponse.json(
        { error: 'You cannot vote on your own review' },
        { status: 400 }
      );
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('review_votes')
      .select('id, is_helpful')
      .eq('review_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existingVote) {
      // Update existing vote if different
      if (existingVote.is_helpful !== validation.data.is_helpful) {
        const { error: updateError } = await supabase
          .from('review_votes')
          .update({ is_helpful: validation.data.is_helpful })
          .eq('id', existingVote.id);

        if (updateError) {
          console.error('Database error updating vote:', updateError);
          return NextResponse.json(
            { error: 'Failed to update vote' },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          action: 'updated',
          is_helpful: validation.data.is_helpful
        });
      } else {
        // Same vote, remove it (toggle)
        const { error: deleteError } = await supabase
          .from('review_votes')
          .delete()
          .eq('id', existingVote.id);

        if (deleteError) {
          console.error('Database error deleting vote:', deleteError);
          return NextResponse.json(
            { error: 'Failed to remove vote' },
            { status: 500 }
          );
        }

        return NextResponse.json({ 
          success: true, 
          action: 'removed'
        });
      }
    } else {
      // Create new vote
      const { error: insertError } = await supabase
        .from('review_votes')
        .insert({
          review_id: params.id,
          user_id: user.id,
          is_helpful: validation.data.is_helpful
        });

      if (insertError) {
        console.error('Database error creating vote:', insertError);
        return NextResponse.json(
          { error: 'Failed to create vote' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        action: 'created',
        is_helpful: validation.data.is_helpful
      });
    }

  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/reviews/[id]/votes - Get vote counts for a review
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient();

    // Get vote counts
    const { data: voteData, error } = await supabase
      .from('review_votes')
      .select('is_helpful')
      .eq('review_id', params.id);

    if (error) {
      console.error('Database error fetching votes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch votes' },
        { status: 500 }
      );
    }

    const counts = voteData.reduce(
      (acc, vote) => {
        if (vote.is_helpful) {
          acc.helpful++;
        } else {
          acc.not_helpful++;
        }
        return acc;
      },
      { helpful: 0, not_helpful: 0 }
    );

    return NextResponse.json(counts);

  } catch (error) {
    console.error('Error fetching vote counts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}