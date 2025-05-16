/**
 * ================================================================
 * FILE: /src/lib/schemas/review-schema.ts
 * PURPOSE: SIMPLIFIED validation schemas for review forms using Zod
 * STATUS: ✅ Complete - Simplified Version
 * ================================================================
 */

import { z } from 'zod';

// Review creation schema - SIMPLIFIED
export const createReviewSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  title: z.string()
    .max(100, 'Title cannot exceed 100 characters')
    .optional()
    .or(z.literal('')), // Allow empty string
  content: z.string()
    .min(10, 'Review content must be at least 10 characters')
    .max(1000, 'Review content cannot exceed 1000 characters'), // Reduced from 2000
  images: z.array(z.string())
    .max(3, 'Maximum 3 images allowed') // Reduced from 5
    .optional()
    .default([])
});

// Review update schema - SIMPLIFIED
export const updateReviewSchema = z.object({
  rating: z.number()
    .int('Rating must be a whole number')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5')
    .optional(),
  title: z.string()
    .max(100, 'Title cannot exceed 100 characters')
    .optional()
    .or(z.literal('')), // Allow empty string
  content: z.string()
    .min(10, 'Review content must be at least 10 characters')
    .max(1000, 'Review content cannot exceed 1000 characters')
    .optional(),
  images: z.array(z.string())
    .max(3, 'Maximum 3 images allowed')
    .optional()
});

// Keep other schemas as they are
export const createReplySchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  content: z.string()
    .min(5, 'Reply must be at least 5 characters')
    .max(1000, 'Reply cannot exceed 1000 characters')
});

export const updateReplySchema = z.object({
  content: z.string()
    .min(5, 'Reply must be at least 5 characters')
    .max(1000, 'Reply cannot exceed 1000 characters')
});

export const reviewVoteSchema = z.object({
  review_id: z.string().uuid('Invalid review ID'),
  is_helpful: z.boolean()
});

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

// Type exports for use in components
export type CreateReviewFormData = z.infer<typeof createReviewSchema>;
export type UpdateReviewFormData = z.infer<typeof updateReviewSchema>;
export type CreateReplyFormData = z.infer<typeof createReplySchema>;
export type UpdateReplyFormData = z.infer<typeof updateReplySchema>;
export type ReviewFiltersFormData = z.infer<typeof reviewFiltersSchema>;

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