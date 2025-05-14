/**
 * ================================================================
 * FILE: /src/components/reviews/review-modal.tsx
 * PURPOSE: Modal component for writing/editing reviews
 * STATUS: ✅ Complete
 * ================================================================
 */

import React from 'react';
import { Review } from '@/types/reviews';
import { useReviewOperations } from '@/hooks/use-reviews';
import { ReviewForm } from './review-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  existingReview?: Review;
  onSuccess?: (review: Review) => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  businessId,
  businessName,
  existingReview,
  onSuccess
}: ReviewModalProps) {
  const { createReview, updateReview, loading } = useReviewOperations();
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    try {
      let review: Review | null = null;

      if (existingReview) {
        // Update existing review
        review = await updateReview(existingReview.id, data);
      } else {
        // Create new review
        review = await createReview(data);
      }

      if (review) {
        toast({
          title: 'Success',
          description: existingReview 
            ? 'Review updated successfully!'
            : 'Review submitted successfully!',
        });
        onSuccess?.(review);
        onClose();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </DialogTitle>
        </DialogHeader>
        <ReviewForm
          businessId={businessId}
          businessName={businessName}
          existingReview={existingReview}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}