/**
 * File: src/components/admin/business-images.tsx
 * 
 * Display component for business images in admin review
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui'
import { 
  ImageIcon, 
  ZoomIn, 
  ExternalLink,
  Eye,
  Download,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'

interface Business {
  id: string
  name: string
  logo_url: string | null
  images: string[]
}

interface BusinessImagesProps {
  business: Business
}

export function BusinessImages({ business }: BusinessImagesProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const allImages = business.images || []
  const hasLogo = !!business.logo_url

  if (!hasLogo && allImages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Business Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No images uploaded</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderImageCard = (imageUrl: string, title: string, isLogo: boolean = false) => (
    <div key={imageUrl} className="relative group">
      <div className="relative aspect-square rounded-lg overflow-hidden border">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        
        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                <ZoomIn className="h-4 w-4 mr-1" />
                View
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <div className="relative w-full h-[80vh]">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            </DialogContent>
          </Dialog>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="bg-white/90 hover:bg-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild>
                <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={imageUrl} download>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Logo badge */}
        {isLogo && (
          <div className="absolute top-2 left-2">
            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
              Logo
            </div>
          </div>
        )}
      </div>
      
      <p className="mt-2 text-sm text-center text-muted-foreground truncate">
        {title}
      </p>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Business Images
          <span className="text-sm text-muted-foreground font-normal ml-2">
            ({(hasLogo ? 1 : 0) + allImages.length} {(hasLogo ? 1 : 0) + allImages.length === 1 ? 'image' : 'images'})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Logo */}
          {hasLogo && renderImageCard(business.logo_url!, `${business.name} Logo`, true)}
          
          {/* Other Images */}
          {allImages.map((imageUrl, index) => 
            renderImageCard(imageUrl, `Business Image ${index + 1}`)
          )}
        </div>
      </CardContent>
    </Card>
  )
}