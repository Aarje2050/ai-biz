/**
 * ================================================================
 * FILE: /src/components/reviews/review-card.tsx
 * PURPOSE: Individual review display component
 * STATUS: ✅ Complete - Fixed business owner check
 * ================================================================
 */

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, ThumbsUp, ThumbsDown, MessageCircle, Calendar, DollarSign, Flag, Edit, Trash2, Reply } from 'lucide-react';
import { Review } from '@/types/reviews';
import { useAuth } from '@/hooks/use-auth';
import { useReviewOperations, useReviewReplies } from '@/hooks/use-reviews';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ReviewCardProps {
  review: Review;
  onUpdate?: (updatedReview: Review) => void;
  onDelete?: (reviewId: string) => void;
  showBusinessInfo?: boolean;
  businessId?: string;
  isBusinessOwner?: boolean;
}

export function ReviewCard({ 
  review, 
  onUpdate, 
  onDelete, 
  showBusinessInfo = false,
  businessId,
  isBusinessOwner = false
}: ReviewCardProps) {
  const { user } = useAuth();
  const { voteOnReview } = useReviewOperations();
  const { createReply } = useReviewReplies(review.id);
  const { toast } = useToast();
  
  const [isVoting, setIsVoting] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [expandedContent, setExpandedContent] = useState(false);

  const isOwner = user?.id === review.user_id;
  const hasVoted = review.user_vote !== undefined;
  const userHelpfulVote = review.user_vote?.is_helpful;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-500 fill-yellow-500'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleVote = async (isHelpful: boolean) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to vote on reviews',
        variant: 'destructive'
      });
      return;
    }

    if (isOwner) {
      toast({
        title: 'Cannot vote',
        description: 'You cannot vote on your own review',
        variant: 'destructive'
      });
      return;
    }

    setIsVoting(true);
    const success = await voteOnReview(review.id, isHelpful);
    
    if (success) {
      // Update the review with new vote
      if (onUpdate) {
        onUpdate({
          ...review,
          user_vote: { 
            id: 'temp', 
            review_id: review.id, 
            user_id: user.id, 
            is_helpful: isHelpful,
            created_at: new Date().toISOString()
          }
        });
      }
      toast({
        title: 'Vote recorded',
        description: `Review marked as ${isHelpful ? 'helpful' : 'not helpful'}`,
      });
    }
    setIsVoting(false);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsReplying(true);
    const reply = await createReply({
      review_id: review.id,
      content: replyContent.trim()
    });

    if (reply) {
      toast({
        title: 'Reply posted',
        description: 'Your reply has been posted successfully',
      });
      setReplyContent('');
      setIsReplyDialogOpen(false);
      // Refresh the review to show the new reply
      window.location.reload();
    }
    setIsReplying(false);
  };

  const contentPreview = review.content.length > 200 
    ? review.content.substring(0, 200) + '...'
    : review.content;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.user?.avatar_url} />
              <AvatarFallback>
                {review.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">{review.user?.full_name || 'Anonymous'}</h4>
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                {renderStars(review.rating)}
                <span>({review.rating}/5)</span>
                <span>•</span>
                <span>{formatDate(review.created_at)}</span>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Edit className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete?.(review.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {review.title && (
          <h3 className="font-semibold text-lg">{review.title}</h3>
        )}
      </CardHeader>

      <CardContent>
        {/* Business info if needed */}
        {showBusinessInfo && review.business && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
            {review.business.logo_url && (
              <Image
                src={review.business.logo_url}
                alt={review.business.name}
                width={24}
                height={24}
                className="rounded"
              />
            )}
            <span className="text-sm font-medium">{review.business.name}</span>
          </div>
        )}

        {/* Review content */}
        <div className="space-y-3">
          <p className="text-gray-700">
            {expandedContent ? review.content : contentPreview}
            {review.content.length > 200 && (
              <button
                onClick={() => setExpandedContent(!expandedContent)}
                className="text-blue-600 hover:text-blue-800 ml-2 text-sm"
              >
                {expandedContent ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>

          {/* Review images */}
          {review.images && review.images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {review.images.slice(0, 6).map((image, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={image}
                    alt={`Review image ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Review metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {review.visit_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Visited {formatDate(review.visit_date)}</span>
              </div>
            )}
            {review.spend_amount && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                <span>
                  {review.spend_currency || 'INR'} {review.spend_amount}
                </span>
              </div>
            )}
            {review.service_type && (
              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                {review.service_type}
              </span>
            )}
          </div>

          {/* Tags */}
          {review.tags && review.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {review.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center gap-4">
            {/* Helpful votes */}
            <div className="flex items-center gap-2">
              <Button
                variant={userHelpfulVote === true ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVote(true)}
                disabled={isVoting || isOwner}
                className="flex items-center gap-1"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{review.helpful_count}</span>
              </Button>
              <Button
                variant={userHelpfulVote === false ? "default" : "ghost"}
                size="sm"
                onClick={() => handleVote(false)}
                disabled={isVoting || isOwner}
                className="flex items-center gap-1"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{review.not_helpful_count}</span>
              </Button>
            </div>

            {/* Reply button */}
            {(isBusinessOwner || user?.role === 'admin') && (
              <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reply to Review</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsReplyDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleReply}
                        disabled={isReplying || !replyContent.trim()}
                      >
                        {isReplying ? 'Posting...' : 'Post Reply'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}

            {/* Flag button */}
            {!isOwner && (
              <Button variant="ghost" size="sm">
                <Flag className="w-4 h-4 mr-1" />
                Report
              </Button>
            )}
          </div>

          {/* Reply count */}
          {review.reply_count > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MessageCircle className="w-4 h-4" />
              <span>{review.reply_count} replies</span>
            </div>
          )}
        </div>

        {/* Replies */}
        {review.replies && review.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {review.replies.map((reply) => (
              <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={reply.user?.avatar_url} />
                    <AvatarFallback>
                      {reply.user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">
                    {reply.user?.full_name || 'Anonymous'}
                  </span>
                  {reply.is_business_owner && (
                    <Badge variant="outline" className="text-xs">
                      Business Owner
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    {formatDate(reply.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}