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
  const [currentBusinessId, setCurrentBusinessId] = useState(businessId)
  const supabase = createClientComponentClient()

  const saveDraftToDatabase = useCallback(async (formData: EnhancedBusinessFormData) => {
    try {
      setAutoSaving(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const businessData = transformFormToBusinessData(formData)
      
      // Generate slug if name exists, otherwise use a draft slug
      let slug = ''
      if (formData.name && formData.name.trim()) {
        slug = generateSlug(formData.name)
      } else {
        // Generate a temporary slug for drafts without names
        slug = `draft-${user.id}-${Date.now()}`
      }

      const draftData = {
        ...businessData,
        owner_id: user.id,
        status: 'draft',
        slug: slug,
        // Ensure all required fields have defaults
        name: formData.name || `Draft Business ${Date.now()}`,
        // Add other required fields with defaults if they're missing
        verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      if (currentBusinessId) {
        // Update existing draft
        const { error } = await supabase
          .from('businesses')
          .update(draftData)
          .eq('id', currentBusinessId)
          .eq('owner_id', user.id)
        
        if (error) throw error
        return currentBusinessId
      } else {
        // Create new draft
        const { data, error } = await supabase
          .from('businesses')
          .insert(draftData)
          .select('id')
          .single()
        
        if (error) throw error
        setCurrentBusinessId(data.id)
        return data.id
      }
    } catch (error) {
      console.error('Draft save failed:', error)
      return null
    } finally {
      setAutoSaving(false)
    }
  }, [currentBusinessId, supabase])

  // Debounced auto-save (both localStorage and database)
  const debouncedSave = useCallback(
    debounce(async (formData: EnhancedBusinessFormData) => {
      // Only save to database if user has started filling the form
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
        setTimeout(() => setDraftSaved(false), 2000)
      }
    }, 3000),
    [saveDraftToDatabase]
  )

  const manualSave = useCallback(async (formData: EnhancedBusinessFormData) => {
    // For manual save, always try to save to database
    const savedId = await saveDraftToDatabase(formData)
    if (savedId) {
      setLastSaved(new Date())
      setDraftSaved(true)
      setTimeout(() => setDraftSaved(false), 2000)
    }
    return savedId
  }, [saveDraftToDatabase])

  return {
    draftSaved,
    autoSaving,
    lastSaved,
    currentBusinessId,
    debouncedSave,
    manualSave
  }
}