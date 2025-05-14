/**
 * ================================================================
 * FILE: /src/lib/schemas/review-schema.ts
 * PURPOSE: Validation schemas for review forms using Zod
 * STATUS: ✅ Complete
 * ================================================================
 */

import { z } from 'zod';

// Review creation schema
export const createReviewSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: z.string()
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  content: z.string()
    .min(10, 'Review content must be at least 10 characters')
    .max(2000, 'Review content cannot exceed 2000 characters'),
  images: z.array(z.string().url('Invalid image URL'))
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  videos: z.array(z.string().url('Invalid video URL'))
    .max(2, 'Maximum 2 videos allowed')
    .optional(),
  visit_date: z.string()
    .datetime('Invalid visit date')
    .optional(),
  service_type: z.string()
    .max(50, 'Service type cannot exceed 50 characters')
    .optional(),
  spend_amount: z.number()
    .min(0, 'Spend amount cannot be negative')
    .optional(),
  spend_currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .optional(),
  tags: z.array(z.string().max(30, 'Tag cannot exceed 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
});

// Review update schema (all fields optional except non-changeable ones)
export const updateReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  title: z.string()
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  content: z.string()
    .min(10, 'Review content must be at least 10 characters')
    .max(2000, 'Review content cannot exceed 2000 characters')
    .optional(),
  images: z.array(z.string().url('Invalid image URL'))
    .max(5, 'Maximum 5 images allowed')
    .optional(),
  videos: z.array(z.string().url('Invalid video URL'))
    .max(2, 'Maximum 2 videos allowed')
    .optional(),
  visit_date: z.string()
    .datetime('Invalid visit date')
    .optional(),
  service_type: z.string()
    .max(50, 'Service type cannot exceed 50 characters')
    .optional(),
  spend_amount: z.number()
    .min(0, 'Spend amount cannot be negative')
    .optional(),
  spend_currency: z.string()
    .length(3, 'Currency must be 3 characters')
    .optional(),
  tags: z.array(z.string().max(30, 'Tag cannot exceed 30 characters'))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
});

// Review reply schema
export const createReplySchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  content: z.string()
    .min(5, 'Reply must be at least 5 characters')
    .max(1000, 'Reply cannot exceed 1000 characters')
});

// Review reply update schema
export const updateReplySchema = z.object({
  content: z.string()
    .min(5, 'Reply must be at least 5 characters')
    .max(1000, 'Reply cannot exceed 1000 characters')
});

// Review vote schema
export const reviewVoteSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  is_helpful: z.boolean()
});

// Review filter schema
export const reviewFiltersSchema = z.object({
  rating: z.array(z.number().int().min(1).max(5))
    .optional(),
  verified_only: z.boolean()
    .optional(),
  with_photos: z.boolean()
    .optional(),
  sort_by: z.enum(['newest', 'oldest', 'rating_high', 'rating_low', 'helpful'])
    .optional(),
  date_from: z.string()
    .datetime()
    .optional(),
  date_to: z.string()
    .datetime()
    .optional(),
  search: z.string()
    .max(100, 'Search query cannot exceed 100 characters')
    .optional()
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.number()
    .int()
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z.number()
    .int()
    .min(1, 'Limit must be at least 1')
    .max(100, 'Limit cannot exceed 100')
    .default(20)
});

// Review moderation schema (admin only)
export const moderateReviewSchema = z.object({
  is_approved: z.boolean(),
  moderation_notes: z.string()
    .max(500, 'Moderation notes cannot exceed 500 characters')
    .optional(),
  flag_reason: z.string()
    .max(100, 'Flag reason cannot exceed 100 characters')
    .optional()
});

// Review verification schema (admin only)
export const verifyReviewSchema = z.object({
  is_verified: z.boolean(),
  verification_method: z.enum(['otp', 'gmb_integration', 'email_receipt', 'transaction_id', 'manual']),
  verification_data: z.record(z.any())
    .optional()
});

// Type exports for use in components
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>;
export type CreateReplyFormData = z.infer<typeof createReplySchema>;
export type UpdateReplyFormData = z.infer<typeof updateReplySchema>;
export type ReviewFiltersFormData = z.infer<typeof reviewFiltersSchema>;
export type ReviewModerationFormData = z.infer<typeof moderateReviewSchema>;
export type ReviewVerificationFormData = z.infer<typeof verifyReviewSchema>;

// Validation helpers
export function validateCreateReview(data: unknown) {
  return createReviewSchema.safeParse(data);
}

export function validateUpdateReview(data: unknown) {
  return updateReviewSchema.safeParse(data);
}

export function validateReplyCreate(data: unknown) {
  return createReplySchema.safeParse(data);
}

export function validateReplyUpdate(data: unknown) {
  return updateReplySchema.safeParse(data);
}

export function validateReviewFilters(data: unknown) {
  return reviewFiltersSchema.safeParse(data);
}

export function validateReviewModeration(data: unknown) {
  return moderateReviewSchema.safeParse(data);
}

export function validateReviewVerification(data: unknown) {
  return verifyReviewSchema.safeParse(data);
}