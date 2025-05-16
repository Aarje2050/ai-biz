import { useState, useEffect, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { debounce } from 'lodash'
import { generateSlug } from '@/lib/utils'
import type { EnhancedBusinessFormData } from '@/lib/schemas/business-form-schema'
import { transformFormToBusinessData } from '@/lib/schemas/business-form-schema'

export function useBusinessDraft(businessId?: string) {
  const [draftSaved, setDraftSaved] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [lastError, setLastError] = useState<string | null>(null)
  const [currentBusinessId, setCurrentBusinessId] = useState(businessId)
  const supabase = createClientComponentClient()

  // Helper function to generate unique draft slug
  const generateDraftSlug = async (userId: string, businessName?: string): Promise<string> => {
    if (businessName && businessName.trim()) {
      // For named businesses, try the normal slug first
      const baseSlug = generateSlug(businessName)
      
      // Check if this slug already exists
      const { data } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', baseSlug)
        .single()
      
      if (!data) {
        return baseSlug
      }
      
      // If exists, append timestamp to make it unique
      return `${baseSlug}-${Date.now()}`
    } else {
      // For drafts without names, use a unique draft slug
      return `draft-${userId}-${Date.now()}`
    }
  }

  const saveDraftToDatabase = useCallback(async (formData: EnhancedBusinessFormData) => {
    try {
      setAutoSaving(true)
      setLastError(null)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const businessData = transformFormToBusinessData(formData)
      
      if (currentBusinessId) {
        // Update existing draft - don't change slug on updates
        const { error } = await supabase
          .from('businesses')
          .update({
            ...businessData,
            status: 'draft',
            updated_at: new Date().toISOString()
          })
          .eq('id', currentBusinessId)
          .eq('owner_id', user.id)
        
        if (error) throw error
        return currentBusinessId
      } else {
        // Create new draft with unique slug
        const slug = await generateDraftSlug(user.id, formData.name)
        
        const draftData = {
          ...businessData,
          owner_id: user.id,
          status: 'draft',
          slug: slug,
          // Ensure required fields have defaults
          name: formData.name || `Draft Business ${Date.now()}`,
          verified: false,
          ai_enabled: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('businesses')
          .insert(draftData)
          .select('id')
          .single()
        
        if (error) {
          // If slug conflict, try again with timestamp
          if (error.code === '23505' && error.message.includes('businesses_slug_key')) {
            draftData.slug = `draft-${user.id}-${Date.now()}-retry`
            const { data: retryData, error: retryError } = await supabase
              .from('businesses')
              .insert(draftData)
              .select('id')
              .single()
            
            if (retryError) throw retryError
            setCurrentBusinessId(retryData.id)
            return retryData.id
          }
          throw error
        }
        
        setCurrentBusinessId(data.id)
        return data.id
      }
    } catch (error: any) {
      console.error('Draft save failed:', error)
      setLastError(error.message)
      return null
    } finally {
      setAutoSaving(false)
    }
  }, [currentBusinessId, supabase])

  // Debounced auto-save (both localStorage and database)
  const debouncedSave = useCallback(
    debounce(async (formData: EnhancedBusinessFormData) => {
      // Don't auto-save if editing an existing business (not a draft)
      if (businessId && !businessId.startsWith('draft-')) {
        return
      }

      // Only save to database if user has started filling meaningful data
      if (!formData.name && !formData.business_type && !formData.description) {
        // Just save to localStorage for very early drafts
        localStorage.setItem('business-form-draft', JSON.stringify(formData))
        return
      }
      
      // Always save to localStorage first (instant)
      localStorage.setItem('business-form-draft', JSON.stringify(formData))
      
      // Then save to database (with network delay)
      const savedId = await saveDraftToDatabase(formData)
      
      if (savedId) {
        setLastSaved(new Date())
        setDraftSaved(true)
        setTimeout(() => setDraftSaved(false), 3000)
      }
    }, 3000),
    [saveDraftToDatabase, businessId]
  )

  const manualSave = useCallback(async (formData: EnhancedBusinessFormData) => {
    // For manual save, always try to save to database
    const savedId = await saveDraftToDatabase(formData)
    if (savedId) {
      setLastSaved(new Date())
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 3000)
    }
    return savedId
  }, [saveDraftToDatabase])

  // Load draft from localStorage on init
  useEffect(() => {
    if (!businessId) {
      const savedDraft = localStorage.getItem('business-form-draft')
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft)
          // You can emit this data to the form if needed
          console.log('Loaded draft from localStorage:', draftData)
        } catch (error) {
          console.error('Failed to parse draft from localStorage:', error)
          localStorage.removeItem('business-form-draft')
        }
      }
    }
  }, [businessId])

  return {
    draftSaved,
    autoSaving,
    lastSaved,
    lastError,
    currentBusinessId,
    debouncedSave,
    manualSave
  }
}