'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Phone,
  Clock,
  MapPin,
  ExternalLink,
  CheckCircle,
  Sparkles,
  Navigation,
  Heart,
  Share,
  MoreHorizontal
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Business {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  images?: string[];
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  verified?: boolean;
  ai_enabled?: boolean;
  social_media?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  // Sample data for reviews/ratings (you can replace later)
  rating?: number;
  review_count?: number;
}

interface GMBBusinessCardProps {
  business: Business;
  onClick?: () => void;
  showDistance?: boolean;
  distance?: string;
}

export function GMBBusinessCard({ 
  business, 
  onClick,
  showDistance = false,
  distance = "1.2 km"
}: GMBBusinessCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Sample data for ratings - you can replace with real data
  const rating = business.rating || 4.2;
  const reviewCount = business.review_count || Math.floor(Math.random() * 500) + 10;

  const isCurrentlyOpen = () => {
    if (!business.hours) return null;
  
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(); // 'monday', etc.
  
    const todayHours = business.hours[currentDay as keyof typeof business.hours];
    if (!todayHours || todayHours === 'Closed') return false;
  
    const currentHour = now.getHours();
    return currentHour >= 9 && currentHour <= 18; // Simplified opening hours
  };
  

  const openStatus = isCurrentlyOpen();

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.phone) {
      window.open(`tel:${business.phone}`, '_self');
    }
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const address = `${business.address}, ${business.city}, ${business.state}`;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(address)}`, '_blank');
  };

  const handleWebsite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: business.name,
        text: business.tagline || business.description,
        url: `/business/${business.slug}`
      });
    }
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Hero Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {business.images && business.images.length > 0 && !imageError ? (
          <Image
            src={business.images[0]}
            alt={business.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="text-6xl text-blue-300">📍</div>
          </div>
        )}
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {business.verified && (
            <Badge className="bg-blue-600 text-white text-xs">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          {business.ai_enabled && (
            <Badge className="bg-purple-600 text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              AI
            </Badge>
          )}
        </div>

        {/* Distance badge */}
        {showDistance && (
          <div className="absolute top-3 right-3">
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {distance}
            </Badge>
          </div>
        )}

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/50"
            onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
          >
            <Heart className={cn("w-4 h-4", isLiked ? "text-red-500 fill-red-500" : "text-gray-600")} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-8 h-8 p-0 bg-white/90 backdrop-blur-sm border-white/50"
            onClick={handleShare}
          >
            <Share className="w-4 h-4 text-gray-600" />
          </Button>
        </div>

        {/* Logo overlay */}
        <div className="absolute bottom-3 left-3">
          <div className="w-16 h-16 rounded-lg border-2 border-white bg-white shadow-lg overflow-hidden">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={`${business.name} logo`}
                width={64}
                height={64}
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Business Info */}
        <div className="space-y-3">
          {/* Name and Category */}
          <div>
            <Link href={`/business/${business.slug}`}>
              <h3 className="font-semibold text-lg text-gray-900 hover:text-blue-600 transition-colors line-clamp-1">
                {business.name}
              </h3>
            </Link>
            <div className="flex items-center gap-2 mt-1">
              {business.category && (
                <Badge variant="outline" className="text-xs">
                  {business.category}
                </Badge>
              )}
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-600">{business.tagline || 'Local Business'}</span>
            </div>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-4 h-4",
                      star <= Math.floor(rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : star <= rating
                        ? "text-yellow-400 fill-yellow-400/50"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-900">{rating}</span>
              <span className="text-sm text-gray-500">({reviewCount})</span>
            </div>
            
            {/* Open/Closed Status */}
            {openStatus !== null && (
              <div className="flex items-center gap-1">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  openStatus ? "bg-green-500" : "bg-red-500"
                )} />
                <span className={cn(
                  "text-sm font-medium",
                  openStatus ? "text-green-600" : "text-red-600"
                )}>
                  {openStatus ? "Open" : "Closed"}
                </span>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600 line-clamp-1">
              {[business.address, business.city, business.state].filter(Boolean).join(', ')}
            </span>
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {business.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {business.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCall}
                className="flex items-center justify-center gap-1 text-xs"
              >
                <Phone className="w-3 h-3" />
                Call
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleDirections}
              className="flex items-center justify-center gap-1 text-xs"
            >
              <Navigation className="w-3 h-3" />
              Directions
            </Button>

            {business.website ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleWebsite}
                className="flex items-center justify-center gap-1 text-xs"
              >
                <ExternalLink className="w-3 h-3" />
                Website
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={onClick}
                className="flex items-center justify-center gap-1 text-xs"
              >
                <MoreHorizontal className="w-3 h-3" />
                More
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}