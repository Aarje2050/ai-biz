/**
 * ================================================================
 * FILE: /src/app/business/[slug]/business-reviews-section.tsx
 * PURPOSE: Reviews section for business profile pages
 * STATUS: ✅ Complete
 * ================================================================
 */

'use client';

import React, { useState } from 'react';
import { Star, Edit, Plus } from 'lucide-react';
import { Business } from '@/types/business';
import { Review } from '@/types/reviews';
import { useAuth } from '@/hooks/use-auth';
import { useUserReviews } from '@/hooks/use-reviews';
import { ReviewList, ReviewModal } from '@/components/reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BusinessReviewsSectionProps {
  business: {
    id: string;
    user_id: string; // owner_id equivalent
    name: string;
    slug: string;
    description: string | null;
    category: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip_code: string | null;
    hours: any | null;
    images: string[];
    logo_url: string | null;
    verified: boolean;
    ai_enabled: boolean;
    ai_prompt: string | null;
    created_at: string;
    updated_at: string;
    rating?: number; // Make optional
    review_count?: number; // Make optional
    verification_status?: string;
  }
}

export function BusinessReviewsSection({ business }: BusinessReviewsSectionProps) {
  const { user } = useAuth();
  const { reviews: userReviews, refresh: refreshUserReviews } = useUserReviews();
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | undefined>();

  // Check if current user has already reviewed this business
  const userReviewForBusiness = userReviews.find(
    review => review.business_id === business.id
  );

  // Check if user owns this business (can't review own business)
  const isBusinessOwner = user?.id === business.user_id;

  const handleWriteReview = () => {
    setEditingReview(undefined);
    setIsReviewModalOpen(true);
  };

  const handleEditReview = () => {
    setEditingReview(userReviewForBusiness);
    setIsReviewModalOpen(true);
  };

  const handleReviewSuccess = (review: Review) => {
    // Refresh user reviews to update the button state
    refreshUserReviews();
    // The business reviews will be refreshed by the ReviewList component
  };

  const handleReviewUpdate = (review: Review) => {
    handleReviewSuccess(review);
  };

  const handleReviewDelete = (reviewId: string) => {
    refreshUserReviews();
  };

  const renderRatingOverview = () => {
    if (!business.rating || (business.review_count || 0) === 0) {
      return (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <h3 className="font-medium">No reviews yet</h3>
              <p className="text-sm text-gray-600">
                Be the first to review {business.name}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              <span className="text-3xl font-bold">{business.rating || 0}</span>
              <span className="text-gray-600">out of 5</span>
            </div>
            <p className="text-sm text-gray-600">
              Based on {business.review_count || 0} review{(business.review_count || 0) !== 1 ? 's' : ''}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderActionButton = () => {
    // Don't show button for business owners
    if (isBusinessOwner) {
      return (
        <div className="text-center mb-6">
          <Badge variant="outline">
            You cannot review your own business
          </Badge>
        </div>
      );
    }

    // Don't show button for non-authenticated users
    if (!user) {
      return (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            Please sign in to write a review
          </p>
        </div>
      );
    }

    // Show edit button if user has already reviewed
    if (userReviewForBusiness) {
      return (
        <div className="text-center mb-6">
          <Button onClick={handleEditReview} variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Your Review
          </Button>
        </div>
      );
    }

    // Show write review button
    return (
      <div className="text-center mb-6">
        <Button onClick={handleWriteReview}>
          <Plus className="w-4 h-4 mr-2" />
          Write a Review
        </Button>
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews</h2>
        {business.verified && (
          <Badge variant="secondary">
            <Star className="w-3 h-3 mr-1" />
            Verified Business
          </Badge>
        )}
      </div>

      {renderRatingOverview()}
      {renderActionButton()}

      {/* Reviews List */}
      <ReviewList
        businessId={business.id}
        businessName={business.name}
        showFilters={true}
        onReviewUpdate={handleReviewUpdate}
        onReviewDelete={() => refreshUserReviews()}
        isBusinessOwner={isBusinessOwner}
      />

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        businessId={business.id}
        businessName={business.name}
        existingReview={editingReview}
        onSuccess={handleReviewSuccess}
      />
    </section>
  );
}