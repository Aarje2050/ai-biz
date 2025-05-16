/**
 * ================================================================
 * FILE: /src/lib/schemas/business-form-schema.ts
 * PURPOSE: Enhanced Zod schema for business form validation (SSR-Safe)
 * STATUS: ✅ Fixed for SSR compatibility
 * ================================================================
 */

import * as z from 'zod'
import { BusinessType } from '@/types/business'

// Business type enum schema
export const businessTypeSchema = z.enum(['service', 'store', 'restaurant', 'professional'])

// Social media URL validators
const facebookUrlSchema = z.string().refine((url) => {
  if (!url) return true
  return url.includes('facebook.com') || url.includes('fb.me')
}, { message: 'Must be a valid Facebook URL' })

const instagramUrlSchema = z.string().refine((url) => {
  if (!url) return true
  return url.includes('instagram.com') || url.includes('instagr.am')
}, { message: 'Must be a valid Instagram URL' })

const twitterUrlSchema = z.string().refine((url) => {
  if (!url) return true
  return url.includes('twitter.com') || url.includes('x.com')
}, { message: 'Must be a valid Twitter/X URL' })

const linkedinUrlSchema = z.string().refine((url) => {
  if (!url) return true
  return url.includes('linkedin.com')
}, { message: 'Must be a valid LinkedIn URL' })

const youtubeUrlSchema = z.string().refine((url) => {
  if (!url) return true
  return url.includes('youtube.com') || url.includes('youtu.be')
}, { message: 'Must be a valid YouTube URL' })

// Phone number validator (simple)
const phoneSchema = z.string().refine((phone) => {
  if (!phone) return true
  // Basic phone validation - allows various formats
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}, { message: 'Please enter a valid phone number' })

// Business hours validator
const hoursSchema = z.string().refine((hours) => {
  if (!hours) return true
  // Allows formats like: 9:00-17:00, 9am-5pm, Closed, 24/7, By Appointment
  const hoursRegex = /^(\d{1,2}:\d{2}(\s?(am|pm))?(\s?-\s?\d{1,2}:\d{2}(\s?(am|pm))?)?|closed|24\/7|by appointment)$/i
  return hoursRegex.test(hours.trim())
}, { message: 'Please use format: 9:00 AM - 5:00 PM, 9:00-17:00, Closed, 24/7, or By Appointment' })

// Enhanced business form schema (SSR-Safe)
export const enhancedBusinessSchema = z.object({
  // Basic Information
  name: z.string()
    .min(1, 'Business name is required')
    .max(100, 'Business name must be under 100 characters'),
  
  business_type: businessTypeSchema,
  
  tagline: z.string()
    .min(1, 'Tagline is required')
    .max(120, 'Tagline must be under 120 characters'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be under 2000 characters'),
  
  short_description: z.string()
    .max(300, 'Short description must be under 300 characters')
    .optional(),
  
  category: z.string()
    .min(1, 'Category is required'),
  
  // Contact Information
  phone: phoneSchema.optional().or(z.literal('')),
  whatsapp_enabled: z.boolean().default(false),
  email: z.string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  
  // Social Media
  facebook: facebookUrlSchema.optional().or(z.literal('')),
  instagram: instagramUrlSchema.optional().or(z.literal('')),
  twitter: twitterUrlSchema.optional().or(z.literal('')),
  linkedin: linkedinUrlSchema.optional().or(z.literal('')),
  youtube: youtubeUrlSchema.optional().or(z.literal('')),
  
  // Location
  address: z.string().optional(),
  address_2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  zipCode: z.string().optional(), // For backward compatibility
  country: z.string().default('India'),
  
  // Business Hours
  mondayHours: hoursSchema.optional(),
  tuesdayHours: hoursSchema.optional(),
  wednesdayHours: hoursSchema.optional(),
  thursdayHours: hoursSchema.optional(),
  fridayHours: hoursSchema.optional(),
  saturdayHours: hoursSchema.optional(),
  sundayHours: hoursSchema.optional(),
  
  // File Uploads - SSR-Safe version
  logoFile: z.any().optional(), // Changed from z.instanceof(FileList)
  images: z.any().optional(),   // Changed from z.instanceof(FileList)
  
  // AI Configuration
  ai_prompt: z.string()
    .max(1000, 'AI prompt must be under 1000 characters')
    .optional(),
  ai_agent_enabled: z.boolean().default(false),
  
  // Section Configuration (dynamic based on business type)
  sections: z.record(z.object({
    enabled: z.boolean(),
    visible: z.boolean(),
    sort_order: z.number()
  })).optional(),
})

// Type inference from schema
export type EnhancedBusinessFormData = z.infer<typeof enhancedBusinessSchema>

// Dynamic schema based on business type
export const createBusinessTypeSchema = (businessType?: BusinessType) => {
    // Return base schema if no specific business type
    if (!businessType) return enhancedBusinessSchema
  
    // Use superRefine for complex multi-condition validation
    return enhancedBusinessSchema.superRefine((data, ctx) => {
      if (businessType === 'restaurant') {
        // Check business hours
        const hasHours = Object.values({
          monday: data.mondayHours,
          tuesday: data.tuesdayHours,
          wednesday: data.wednesdayHours,
          thursday: data.thursdayHours,
          friday: data.fridayHours,
          saturday: data.saturdayHours,
          sunday: data.sundayHours,
        }).some(hours => hours && hours.trim() !== '')
        
        if (!hasHours) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Restaurants should specify business hours for at least one day',
            path: ['mondayHours']
          })
        }
  
        // Check address
        if (!data.address || !data.address.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Restaurants should provide an address',
            path: ['address']
          })
        }
      }
  
      if (businessType === 'service' || businessType === 'professional') {
        if (!(data.phone && data.phone.trim()) && !(data.email && data.email.trim())) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Service businesses should provide either phone or email contact',
            path: ['phone']
          })
        }
      }
  
      if (businessType === 'store') {
        if (!data.address || !data.address.trim() || !data.city || !data.city.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Stores should provide complete address information',
            path: ['address']
          })
        }
  
        const hasHours = Object.values({
          monday: data.mondayHours,
          tuesday: data.tuesdayHours,
          wednesday: data.wednesdayHours,
          thursday: data.thursdayHours,
          friday: data.fridayHours,
          saturday: data.saturdayHours,
          sunday: data.sundayHours,
        }).some(hours => hours && hours.trim() !== '')
        
        if (!hasHours) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Stores should specify business hours for customer visits',
            path: ['mondayHours']
          })
        }
      }
    })
  }

// Export utility functions
export const validateBusinessForm = (data: EnhancedBusinessFormData, businessType?: BusinessType) => {
  const schema = createBusinessTypeSchema(businessType)
  return schema.safeParse(data)
}

// Transform form data to business creation format
export const transformFormToBusinessData = (formData: EnhancedBusinessFormData) => {
    const {
      logoFile,
      images,
      mondayHours,
      tuesdayHours,
      wednesdayHours,
      thursdayHours,
      fridayHours,
      saturdayHours,
      sundayHours,
      whatsapp_enabled,
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      zipCode,
      ...rest
    } = formData
  
    // Change this: business_hours to hours
    const hours = {
      monday: mondayHours || null,
      tuesday: tuesdayHours || null,
      wednesday: wednesdayHours || null,
      thursday: thursdayHours || null,
      friday: fridayHours || null,
      saturday: saturdayHours || null,
      sunday: sundayHours || null,
    }
  
    // Transform social media links
    const social_media = {
      facebook: facebook || null,
      instagram: instagram || null,
      twitter: twitter || null,
      linkedin: linkedin || null,
      youtube: youtube || null,
    }
  
    return {
      ...rest,
      hours, // Change this from business_hours to hours
      social_media,
      postal_code: formData.postal_code || zipCode || null,
      whatsapp_enabled: whatsapp_enabled || false,
    }
  }

export default enhancedBusinessSchema