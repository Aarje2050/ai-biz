'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button, Input, Textarea, Label, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from 'react-hot-toast'
import { generateSlug } from '@/lib/utils'
import type { Database } from '@/lib/supabase/client'
import * as Accordion from '@radix-ui/react-accordion';


const businessSchema = z.object({
  name: z.string().min(1, 'Business name is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  logoUrl: z.string().url('Invalid logo URL').optional().or(z.literal('')),
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
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || '',
      description: business?.description || '',
      category: business?.category || '',
      phone: business?.phone || '',
      email: business?.email || '',
      website: business?.website || '',
      address: business?.address || '',
      city: business?.city || '',
      state: business?.state || '',
      zipCode: business?.zip_code || '',
      logoUrl: business?.logo_url || '',
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

  const onSubmit = async (data: BusinessFormData) => {
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('You must be logged in to perform this action')
        return
      }

      const slug = business?.slug || generateSlug(data.name)
      
      // Check if slug is unique (for new businesses)
      if (!business) {
        const { data: existingBusiness } = await supabase
          .from('businesses')
          .select('id')
          .eq('slug', slug)
          .single()

        if (existingBusiness) {
          toast.error('A business with this name already exists')
          return
        }
      }

      const hours = {
        monday: data.mondayHours,
        tuesday: data.tuesdayHours,
        wednesday: data.wednesdayHours,
        thursday: data.thursdayHours,
        friday: data.fridayHours,
        saturday: data.saturdayHours,
        sunday: data.sundayHours,
      }

      const businessData = {
        user_id: user.id,
        name: data.name,
        slug,
        description: data.description,
        category: data.category,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        hours,
        logo_url: data.logoUrl || null,
        ai_prompt: data.aiPrompt || null,
      }

      if (business) {
        // Update existing business
        const { error } = await supabase
          .from('businesses')
          .update(businessData)
          .eq('id', business.id)

        if (error) throw error

        toast.success('Business updated successfully!')
        router.push(`/dashboard/businesses/${business.id}`)
      } else {
        // Create new business
        const { error } = await supabase
          .from('businesses')
          .insert(businessData)

        if (error) throw error

        toast.success('Business created successfully!')
        router.push('/dashboard')
      }
    } catch (error: any) {
      console.error('Error saving business:', error)
      toast.error(error.message || 'An error occurred while saving the business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>
            {business ? 'Edit Business' : 'Add New Business'}
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

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Describe your business..."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.description.message}
                  </p>
                )}
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
              
              <div>
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  {...form.register('logoUrl')}
                  placeholder="https://example.com/logo.png"
                />
                {form.formState.errors.logoUrl && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.logoUrl.message}
                  </p>
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
  )
}