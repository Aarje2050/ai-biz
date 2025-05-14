/**
 * ================================================================
 * FILE: /src/types/reviews.ts
 * PURPOSE: TypeScript types for review system
 * STATUS: ✅ Complete
 * ================================================================
 */

export type VerificationMethod = 
  | 'otp'
  | 'gmb_integration'
  | 'email_receipt'
  | 'transaction_id'
  | 'manual';

export interface Review {
  id: string;
  business_id: string;
  user_id: string;
  rating: number; // 1-5
  title?: string;
  content: string;
  images?: string[];
  videos?: string[];
  
  // Verification
  verification_method?: VerificationMethod;
  verification_data?: Record<string, any>;
  is_verified: boolean;
  verified_at?: string;
  
  // Moderation
  is_flagged: boolean;
  flag_reason?: string;
  is_approved: boolean;
  moderated_by?: string;
  moderated_at?: string;
  
  // Engagement
  helpful_count: number;
  not_helpful_count: number;
  reply_count: number;
  
  // Additional data
  visit_date?: string;
  service_type?: string;
  spend_amount?: number;
  spend_currency?: string;
  tags?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Relations (populated via joins)
  user?: {
    full_name: string;
    avatar_url?: string;
  };
  business?: {
    name: string;
    logo_url?: string;
  };
  replies?: ReviewReply[];
  user_vote?: ReviewVote;
}

export interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  is_business_owner: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    full_name: string;
    avatar_url?: string;
    role: string;
  };
}

export interface ReviewVote {
  id: string;
  review_id: string;
  user_id: string;
  is_helpful: boolean;
  created_at: string;
}

// Form types
export interface CreateReviewData {
  business_id: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  videos?: string[];
  visit_date?: string;
  service_type?: string;
  spend_amount?: number;
  spend_currency?: string;
  tags?: string[];
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  content?: string;
  images?: string[];
  videos?: string[];
  visit_date?: string;
  service_type?: string;
  spend_amount?: number;
  spend_currency?: string;
  tags?: string[];
}

export interface CreateReplyData {
  review_id: string;
  content: string;
}

export interface UpdateReplyData {
  content: string;
}

// API Response types
export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    [key: number]: number; // rating -> count
  };
  verified_reviews: number;
  with_photos: number;
  recent_reviews: number; // last 30 days
}

// Filter types
export interface ReviewFilters {
  rating?: number[];
  verified_only?: boolean;
  with_photos?: boolean;
  sort_by?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful';
  date_from?: string;
  date_to?: string;
  search?: string;
}

// Error types
export interface ReviewError {
  code: string;
  message: string;
  field?: string;
}

export class ReviewValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ReviewValidationError';
  }
}