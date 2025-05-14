/**
 * ================================================================
 * FILE: /src/app/api/reviews/my-reviews/route.ts
 * PURPOSE: User's own reviews endpoint
 * STATUS: ✅ Complete
 * ================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// GET /api/reviews/my-reviews - Get current user's reviews
export async function GET(request: NextRequest) {
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

    // Fetch user's reviews
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        business:businesses(name, slug, logo_url),
        replies:review_replies(
          *,
          user:users!review_replies_user_id_fkey(full_name, avatar_url, role)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching user reviews:', error);
      return NextResponse.json(
        { error: 'Failed to fetch your reviews' },
        { status: 500 }
      );
    }

    return NextResponse.json(reviews);

  } catch (error) {
    console.error('Error fetching user reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}