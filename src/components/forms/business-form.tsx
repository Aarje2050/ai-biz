'use client'

import { useState,useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button, Input, Textarea, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { generateSlug } from '@/lib/utils'
import type { Database } from '@/lib/supabase/client'
import * as Accordion from '@radix-ui/react-accordion';
import { Monitor,Map,Smartphone, Mail, Phone, Globe, Pencil, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'


// Update the businessSchema in business-form.tsx
// Fix 2: Update the form schema to handle FileList properly
const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  tagline: z.string().min(1, 'Tagline is required').max(120, 'Tagline must be under 120 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  phone: z.string().optional(),
  whatsappEnabled: z.boolean().default(false),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  // FileList for file inputs
  logoFile: z.instanceof(FileList).optional(),
  images: z.instanceof(FileList).optional(),
  // Social media links
  facebook: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('facebook.com');
  }, { message: 'Must be a valid Facebook URL' }).optional().or(z.literal('')),
  instagram: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('instagram.com');
  }, { message: 'Must be a valid Instagram URL' }).optional().or(z.literal('')),
  youtube: z.string().refine((url) => {
    if (!url) return true;
    return url.includes('youtube.com');
  }, { message: 'Must be a valid YouTube URL' }).optional().or(z.literal('')),
  // Hours fields...
  mondayHours: z.string().optional(),
  tuesdayHours: z.string().optional(),
  wednesdayHours: z.string().optional(),
  thursdayHours: z.string().optional(),
  fridayHours: z.string().optional(),
  saturdayHours: z.string().optional(),
  sundayHours: z.string().optional(),
  aiPrompt: z.string().optional(),
})

type BusinessFormData = z.infer<typeof businessSchema>

const categories = [
  'Restaurant',
  'Retail',
  'Healthcare',
  'Beauty & Wellness',
  'Automotive',
  'Professional Services',
  'Home & Garden',
  'Entertainment',
  'Fitness & Recreation',
  'Technology',
  'Real Estate',
  'Financial Services',
  'Education',
  'Travel & Hospitality',
  'Other'
]

interface BusinessFormProps {
  business?: Database['public']['Tables']['businesses']['Row']
}

export function BusinessForm({ business }: BusinessFormProps) {
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([])
  const logoFileRef = useRef<HTMLInputElement>(null)
  const imagesFileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const supabase = createClientComponentClient<Database>()

  // Add these missing handlers
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
    }
  }

  const handleImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const previews = Array.from(files).map(file => URL.createObjectURL(file))
      setImagesPreviews(previews)
    }
  }

// Fix 4: Update form defaultValues to handle new fields
const form = useForm<BusinessFormData>({
  resolver: zodResolver(businessSchema),
  defaultValues: {
    name: business?.name || '',
    tagline: business?.tagline || '',  // Add this
    description: business?.description || '',
    category: business?.category || '',
    phone: business?.phone || '',
    whatsappEnabled: business?.whatsapp_enabled || false,  // Add this
    email: business?.email || '',
    website: business?.website || '',
    address: business?.address || '',
    city: business?.city || '',
    state: business?.state || '',
    zipCode: business?.zip_code || '',
    logoFile: undefined,  // Add this
    images: undefined,  // Add this
    // Social media defaults
    facebook: business?.social_media?.facebook || '',  // Add this
    instagram: business?.social_media?.instagram || '',  // Add this
    youtube: business?.social_media?.youtube || '',  // Add this
    // Hours
    mondayHours: business?.hours?.monday || '',
    tuesdayHours: business?.hours?.tuesday || '',
    wednesdayHours: business?.hours?.wednesday || '',
    thursdayHours: business?.hours?.thursday || '',
    fridayHours: business?.hours?.friday || '',
    saturdayHours: business?.hours?.saturday || '',
    sundayHours: business?.hours?.sunday || '',
    aiPrompt: business?.ai_prompt || '',
  },
})
// Watch all form values for live preview
const watchedValues = useWatch({
  control: form.control,
})
// Fix 1: Update the file upload handling in onSubmit
const onSubmit = async (data: BusinessFormData) => {
  setLoading(true)

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('You must be logged in to perform this action')
      return
    }

    // Handle file uploads first
    let logoUrl = business?.logo_url || null
    let imageUrls: string[] = business?.images || []

    // Upload logo if provided
    // Note: data.logoFile contains the FileList, not the file directly
    if (data.logoFile && data.logoFile.length > 0) {
      const logoFile = data.logoFile[0]
      const logoPath = `${user.id}/logo-${Date.now()}-${logoFile.name}`
      
      const { error: logoError } = await supabase.storage
        .from('business-media')
        .upload(logoPath, logoFile)
      
      if (logoError) throw logoError
      
      const { data: logoPublic } = supabase.storage
        .from('business-media')
        .getPublicUrl(logoPath)
      
      logoUrl = logoPublic.publicUrl
    }

    // Upload gallery images if provided
    if (data.images && data.images.length > 0) {
      // Convert FileList to Array
      const filesArray = Array.from(data.images)
      
      const uploadPromises = filesArray.map(async (file, index) => {
        const imagePath = `${user.id}/gallery-${Date.now()}-${index}-${file.name}`
        
        const { error: imageError } = await supabase.storage
          .from('business-media')
          .upload(imagePath, file)
        
        if (imageError) throw imageError
        
        const { data: imagePublic } = supabase.storage
          .from('business-media')
          .getPublicUrl(imagePath)
        
        return imagePublic.publicUrl
      })
      
      imageUrls = await Promise.all(uploadPromises)
    }

    const slug = business?.slug || generateSlug(data.name)
    
    const hours = {
      monday: data.mondayHours,
      tuesday: data.tuesdayHours,
      wednesday: data.wednesdayHours,
      thursday: data.thursdayHours,
      friday: data.fridayHours,
      saturday: data.saturdayHours,
      sunday: data.sundayHours,
    }

    const socialMedia = {
      facebook: data.facebook || null,
      instagram: data.instagram || null,
      youtube: data.youtube || null,
    }

    const businessData = {
      user_id: user.id,
      name: data.name,
      tagline: data.tagline,
      slug,
      description: data.description,
      category: data.category,
      phone: data.phone || null,
      whatsapp_enabled: data.whatsappEnabled || false,
      email: data.email || null,
      website: data.website || null,
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      zip_code: data.zipCode || null,
      hours,
      images: imageUrls,
      logo_url: logoUrl,
      social_media: socialMedia,
      ai_prompt: data.aiPrompt || null,
      // Don't include status here - it's handled by triggers for new records
    }

    if (business) {
      // Update existing business (keep existing status)
      const { error } = await supabase
        .from('businesses')
        .update({
          ...businessData,
          status: business.status, // Keep existing status for edits
        })
        .eq('id', business.id)

      if (error) throw error

      toast.success('Business updated successfully!')
      router.push(`/dashboard/businesses/${business.id}`)
    } else {
      // Create new business (status will be set to 'pending' by trigger)
      const { error } = await supabase
        .from('businesses')
        .insert(businessData)

      if (error) throw error

      toast.success('Your business listing request has been submitted. Under review - you will get notification once it is approved.')
      router.push('/dashboard')
    }
  } catch (error: any) {
    console.error('Error saving business:', error)
    toast.error(error.message || 'An error occurred while saving the business')
  } finally {
    setLoading(false)
  }
}

  // Add this component before the main form return statement
const LivePreview = () => {
  // Transform form data to match business interface
  const previewBusiness = {
    id: 'preview',
    name: watchedValues.name || 'Your Business Name',
    description: watchedValues.description || '',
    category: watchedValues.category || 'Business',
    phone: watchedValues.phone || null,
    email: watchedValues.email || null,
    website: watchedValues.website || null,
    address: watchedValues.address || null,
    
    city: watchedValues.city || '',
    state: watchedValues.state || '',
    zip_code: watchedValues.zipCode || null,
    logo_url: logoPreview || business?.logo_url || null,    
    verified: false,
    ai_enabled: !!watchedValues.aiPrompt,
    hours: {
      monday: watchedValues.mondayHours || null,
      tuesday: watchedValues.tuesdayHours || null,
      wednesday: watchedValues.wednesdayHours || null,
      thursday: watchedValues.thursdayHours || null,
      friday: watchedValues.fridayHours || null,
      saturday: watchedValues.saturdayHours || null,
      sunday: watchedValues.sundayHours || null,
    },
    slug: '',
    user_id: '',
    created_at: '',
    updated_at: '',
    images: [],
    ai_prompt: watchedValues.aiPrompt || null,
  }


  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold">Live Preview</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={previewMode === 'desktop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('desktop')}
          >
            <Monitor className="w-4 h-4 mr-1" />
            Desktop
          </Button>
          <Button
            type="button"
            variant={previewMode === 'mobile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreviewMode('mobile')}
          >
            <Smartphone className="w-4 h-4 mr-1" />
            Mobile
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
        <div className={cn(
          "mx-auto bg-white rounded-lg shadow-sm",
          previewMode === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
        )}>
          {/* Hero Section Preview */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-xl border-2 border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                {previewBusiness.logo_url ? (
                  <img
                    src={previewBusiness.logo_url}
                    alt="Logo preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xl font-bold text-gray-400">
                    {previewBusiness.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {previewBusiness.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
  <Badge variant="outline">{previewBusiness.category}</Badge>
  {previewBusiness.ai_enabled && (
    <Badge className="bg-purple-100 text-purple-700 border-purple-200">
      <Sparkles className="w-3 h-3 mr-1" />
      AI Enabled
    </Badge>
  )}
</div>
              </div>
            </div>
            
            {previewBusiness.description && (
              <p className="text-gray-600 mb-4">{previewBusiness.description}</p>
            )}
            
            <div className="flex gap-3">
              {previewBusiness.phone && (
                <Button size="sm">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Pencil className="w-4 h-4 mr-1" />
                Review
              </Button>
            </div>
          </div>

          {/* Contact Info Preview */}
          <div className="p-6">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            <div className="space-y-2">
              {previewBusiness.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {previewBusiness.phone}
                </div>
              )}
              {previewBusiness.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {previewBusiness.email}
                </div>
              )}
              {previewBusiness.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-gray-400" />
                  {previewBusiness.website}
                </div>
              )}
              {previewBusiness.address && (
                <div className="flex items-center gap-2 text-sm">
                  <Map className="w-4 h-4 text-gray-400" />
                  {[previewBusiness.address, previewBusiness.city, previewBusiness.state].filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

return (
  <div className="container max-w-7xl py-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Column */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {business ? 'Edit Business' : 'Add New Business'}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="lg:hidden"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="Enter business name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              {/* // Add these new form fields after the name field */}
<div>
  <Label htmlFor="tagline">Business Tagline *</Label>
  <Input
    id="tagline"
    {...form.register('tagline')}
    placeholder="Your catchy business tagline (e.g., 'Best Pizza in Town')"
    maxLength={120}
  />
  <div className="flex justify-between mt-1">
    {form.formState.errors.tagline && (
      <p className="text-sm text-destructive">
        {form.formState.errors.tagline.message}
      </p>
    )}
    <p className="text-xs text-muted-foreground text-right">
      {form.watch('tagline')?.length || 0}/120 characters
    </p>
  </div>
</div>

{/* // Update the description field to show character count */}
<div>
  <Label htmlFor="description">Description *</Label>
  <Textarea
    id="description"
    {...form.register('description')}
    placeholder="Describe your business in detail..."
    rows={4}
  />
  <div className="flex justify-between mt-1">
    {form.formState.errors.description && (
      <p className="text-sm text-destructive">
        {form.formState.errors.description.message}
      </p>
    )}
    <p className="text-xs text-muted-foreground text-right">
      {form.watch('description')?.length || 0} characters
    </p>
  </div>
</div>

             

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  {...form.register('category')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.category.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...form.register('phone')}
                    placeholder="(555) 123-4567"
                  />
                </div>
                {/* // Add WhatsApp toggle after phone field */}
<div>
  <Label htmlFor="phone">Phone</Label>
  <Input
    id="phone"
    {...form.register('phone')}
    placeholder="(555) 123-4567"
  />
</div>

<div className="flex items-center space-x-2">
  <input
    type="checkbox"
    id="whatsappEnabled"
    {...form.register('whatsappEnabled')}
    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded"
  />
  <Label htmlFor="whatsappEnabled" className="text-sm font-medium">
    This number is also available on WhatsApp
  </Label>
</div>

{/* // Add social media section */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Social Media Links</h3>
  <p className="text-sm text-muted-foreground">
    Add your social media profiles (optional)
  </p>
  
  <div className="space-y-4">
    <div>
      <Label htmlFor="facebook">Facebook Page</Label>
      <Input
        id="facebook"
        {...form.register('facebook')}
        placeholder="https://facebook.com/yourpage"
      />
      {form.formState.errors.facebook && (
        <p className="text-sm text-destructive mt-1">
          {form.formState.errors.facebook.message}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="instagram">Instagram Profile</Label>
      <Input
        id="instagram"
        {...form.register('instagram')}
        placeholder="https://instagram.com/yourprofile"
      />
      {form.formState.errors.instagram && (
        <p className="text-sm text-destructive mt-1">
          {form.formState.errors.instagram.message}
        </p>
      )}
    </div>

    <div>
      <Label htmlFor="youtube">YouTube Channel</Label>
      <Input
        id="youtube"
        {...form.register('youtube')}
        placeholder="https://youtube.com/yourchannel"
      />
      {form.formState.errors.youtube && (
        <p className="text-sm text-destructive mt-1">
          {form.formState.errors.youtube.message}
        </p>
      )}
    </div>
  </div>
</div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="business@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  {...form.register('website')}
                  placeholder="https://www.example.com"
                />
                {form.formState.errors.website && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.website.message}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Location</h3>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...form.register('address')}
                  placeholder="123 Main Street"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...form.register('city')}
                    placeholder="New York"
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    {...form.register('state')}
                    placeholder="NY"
                  />
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    {...form.register('zipCode')}
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Hours</h3>
              <p className="text-sm text-muted-foreground">
                Enter hours in format: 9:00-17:00 (leave blank for closed)
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day}>
                    <Label htmlFor={`${day.toLowerCase()}Hours`}>
                      {day}
                    </Label>
                    <Input
                      id={`${day.toLowerCase()}Hours`}
                      {...form.register(`${day.toLowerCase()}Hours` as keyof BusinessFormData)}
                      placeholder="9:00-17:00"
                    />
                  </div>
                ))}
              </div>
            </div>


{/* Media */}
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Media</h3>
  
  {/* Business Logo Upload */}
  <div>
    <Label htmlFor="logoFile">Business Logo</Label>
    <div className="mt-1">
      <input
        type="file"
        id="logoFile"
        ref={logoFileRef}
        accept="image/*"
        onChange={handleLogoChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Upload a logo (PNG, JPG, or SVG). Max size: 2MB
    </p>
    {/* Show logo preview */}
    {logoPreview && (
      <div className="mt-2">
        <img 
          src={logoPreview} 
          alt="Logo preview" 
          className="h-20 w-20 object-cover rounded-lg border border-gray-200"
        />
      </div>
    )}
  </div>

  {/* Gallery Images Upload */}
  <div>
    <Label htmlFor="images">Gallery Images</Label>
    <div className="mt-1">
      <input
        type="file"
        id="images"
        ref={imagesFileRef}
        accept="image/*"
        multiple
        onChange={handleImagesChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Upload multiple images for your gallery. Max 10 images, 5MB each.
    </p>
    {/* Show gallery previews */}
    {imagesPreviews.length > 0 && (
      <div className="mt-2 grid grid-cols-4 gap-2">
        {imagesPreviews.map((preview, index) => (
          <img 
            key={index}
            src={preview} 
            alt={`Preview ${index + 1}`} 
            className="h-20 w-20 object-cover rounded-lg border border-gray-200"
          />
        ))}
      </div>
    )}
  </div>
</div>

            {/* AI Assistant */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">AI Assistant Configuration</h3>
              <p className="text-sm text-muted-foreground">
                Customize how your AI assistant responds to customer inquiries
              </p>
              
              <div>
                <Label htmlFor="aiPrompt">AI Assistant Instructions</Label>
                <Textarea
                  id="aiPrompt"
                  {...form.register('aiPrompt')}
                  placeholder="You are a helpful assistant for [Business Name]. You help customers with information about our services, hours, location, and pricing. Be friendly and informative."
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : business ? 'Update Business' : 'Add Business'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
            
          </CardContent>
        </Card>
      </div>
  {/* Preview Column */}
  <div className={cn("lg:block", showPreview ? "block" : "hidden")}>
        <div className="sticky top-6">
          <Card>
            <CardContent className="p-6">
              <LivePreview />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
)
}