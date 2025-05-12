'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Business, BusinessSearchParams } from '@/lib/supabase/types'

export function useBusinesses() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchBusinesses = async (params: BusinessSearchParams = {}) => {
    if (!supabase) {
      setError('Supabase client not available')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .eq('verified', params.verified ?? true)

      // Apply filters
      if (params.query) {
        query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`)
      }

      if (params.category) {
        query = query.eq('category', params.category)
      }

      if (params.city) {
        query = query.eq('city', params.city)
      }

      if (params.state) {
        query = query.eq('state', params.state)
      }

      // Apply sorting
      if (params.sortBy) {
        query = query.order(params.sortBy, { ascending: params.sortOrder === 'asc' })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      if (params.page && params.limit) {
        const from = (params.page - 1) * params.limit
        const to = from + params.limit - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        throw error
      }

      setBusinesses(data || [])
      setTotal(count || 0)
    } catch (err: any) {
      console.error('Error fetching businesses:', err)
      setError(err.message || 'Failed to fetch businesses')
    } finally {
      setLoading(false)
    }
  }

  const createBusiness = async (business: Business) => {
    if (!supabase) {
      setError('Supabase client not available')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('businesses')
        .insert(business)

      if (error) {
        throw error
      }

      // Refresh the list
      fetchBusinesses()
      return true
    } catch (err: any) {
      console.error('Error creating business:', err)
      setError(err.message || 'Failed to create business')
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateBusiness = async (id: string, updates: Partial<Business>) => {
    if (!supabase) {
      setError('Supabase client not available')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', id)

      if (error) {
        throw error
      }

      // Refresh the list
      fetchBusinesses()
      return true
    } catch (err: any) {
      console.error('Error updating business:', err)
      setError(err.message || 'Failed to update business')
      return false
    } finally {
      setLoading(false)
    }
  }

  const deleteBusiness = async (id: string) => {
    if (!supabase) {
      setError('Supabase client not available')
      return false
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      // Refresh the list
      fetchBusinesses()
      return true
    } catch (err: any) {
      console.error('Error deleting business:', err)
      setError(err.message || 'Failed to delete business')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    businesses,
    loading,
    error,
    total,
    fetchBusinesses,
    createBusiness,
    updateBusiness,
    deleteBusiness,
  }
}

// Hook for fetching a single business
export function useBusiness(id: string | null) {
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || !supabase) return

    setLoading(true)
    setError(null)

    const fetchBusiness = async () => {
      try {
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          throw error
        }

        setBusiness(data)
      } catch (err: any) {
        console.error('Error fetching business:', err)
        setError(err.message || 'Failed to fetch business')
        setBusiness(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBusiness()
  }, [id])

  return {
    business,
    loading,
    error,
  }
}