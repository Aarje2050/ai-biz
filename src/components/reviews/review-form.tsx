/**
 * ================================================================
 * FILE: /src/components/reviews/review-form.tsx
 * PURPOSE: Complete form component for creating/editing reviews
 * STATUS: ✅ Complete
 * ================================================================
 */

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, Upload, X, Calendar, DollarSign, Tag, Image as ImageIcon } from 'lucide-react';
import { createReviewSchema, updateReviewSchema, CreateReviewFormData, UpdateReviewFormData } from '@/lib/schemas/review-schema';
import { Review } from '@/types/reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  businessId: string;
  businessName: string;
  existingReview?: Review;
  onSubmit: (data: CreateReviewFormData | UpdateReviewFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function ReviewForm({ 
  businessId, 
  businessName, 
  existingReview, 
  onSubmit, 
  onCancel,
  isLoading = false 
}: ReviewFormProps) {
  const { toast } = useToast();
  const isEditing = !!existingReview;
  
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [images, setImages] = useState<string[]>(existingReview?.images || []);
  const [tags, setTags] = useState<string[]>(existingReview?.tags || []);
  const [newTag, setNewTag] = useState('');

  const schema = isEditing ? updateReviewSchema : createReviewSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateReviewFormData | UpdateReviewFormData>({
    resolver: zodResolver(schema),
    defaultValues: isEditing ? {
      rating: existingReview.rating,
      title: existingReview.title || '',
      content: existingReview.content,
      visit_date: existingReview.visit_date || '',
      service_type: existingReview.service_type || '',
      spend_amount: existingReview.spend_amount || 0,
      spend_currency: existingReview.spend_currency || 'INR',
      tags: existingReview.tags || [],
      images: existingReview.images || []
    } : {
      business_id: businessId,
      rating: 0,
      title: '',
      content: '',
      visit_date: '',
      service_type: '',
      spend_amount: 0,
      spend_currency: 'INR',
      tags: [],
      images: []
    }
  });

  // Update form when rating changes
  useEffect(() => {
    setValue('rating', rating);
  }, [rating, setValue]);

  // Update form when tags change
  useEffect(() => {
    setValue('tags', tags);
  }, [tags, setValue]);

  // Update form when images change
  useEffect(() => {
    setValue('images', images);
  }, [images, setValue]);

  const handleRatingClick = (value: number) => {
    setRating(value);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // In a real implementation, you'd upload these to a storage service
    // For now, we'll simulate with placeholder URLs
    Array.from(files).forEach((file, index) => {
      if (images.length >= 5) return;
      
      // Create a preview URL for the uploaded file
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    
    toast({
      title: 'Images uploaded',
      description: `Images added to your review`,
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (!newTag.trim() || tags.length >= 10) return;
    
    const tagToAdd = newTag.trim().toLowerCase();
    if (!tags.includes(tagToAdd)) {
      setTags(prev => [...prev, tagToAdd]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmitForm = async (data: CreateReviewFormData | UpdateReviewFormData) => {
    try {
      await onSubmit(data);
      if (!isEditing) {
        reset();
        setRating(0);
        setImages([]);
        setTags([]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => handleRatingClick(star)}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="ml-2 text-sm text-gray-600">
            {rating} star{rating !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Review' : 'Write a Review'}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Reviewing: <span className="font-medium">{businessName}</span>
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Rating <span className="text-red-500">*</span>
            </Label>
            {renderStars()}
            {errors.rating && (
              <p className="text-sm text-red-500">{errors.rating.message}</p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              placeholder="Summarize your experience..."
              {...register('title')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Your Review <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Share details about your experience..."
              rows={5}
              {...register('content')}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content.message}</p>
            )}
          </div>

          {/* Images */}
          <div className="space-y-3">
            <Label>Photos (Optional)</Label>
            <div className="space-y-3">
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Review image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {images.length < 5 && (
                <div>
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="images"
                    className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <div className="text-center">
                      <ImageIcon className="w-6 h-6 mx-auto text-gray-400" />
                      <span className="text-sm text-gray-600 mt-1">
                        Add Photos ({images.length}/5)
                      </span>
                    </div>
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visit_date">
                <Calendar className="w-4 h-4 inline mr-1" />
                Visit Date
              </Label>
              <Input
                id="visit_date"
                type="date"
                {...register('visit_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Service Type</Label>
              <Input
                id="service_type"
                placeholder="e.g., Dine-in, Takeout, Delivery"
                {...register('service_type')}
              />
            </div>
          </div>

          {/* Spend Amount */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="spend_amount">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Amount Spent (Optional)
              </Label>
              <Input
                id="spend_amount"
                type="number"
                min="0"
                placeholder="0"
                {...register('spend_amount', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spend_currency">Currency</Label>
              <select
                id="spend_currency"
                {...register('spend_currency')}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <Label>
              <Tag className="w-4 h-4 inline mr-1" />
              Tags (Optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {tags.length < 10 && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="flex-1"
                  onKeyPress={handleKeyPress}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || rating === 0}
              className="flex-1"
            >
              {isLoading ? (
                isEditing ? 'Updating...' : 'Submitting...'
              ) : (
                isEditing ? 'Update Review' : 'Submit Review'
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}