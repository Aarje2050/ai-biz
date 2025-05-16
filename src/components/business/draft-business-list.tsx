'use client'

import { Card, CardContent } from '@/components/ui'
import { Button, Badge } from '@/components/ui'
import { Edit3, Trash2, Calendar, Building2, Send } from 'lucide-react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface DraftBusiness {
  id: string
  name: string
  business_type: string
  updated_at: string
  category?: string
  city?: string
  state?: string
  description?: string
  status: string
}

interface DraftBusinessListProps {
  businesses: DraftBusiness[]
}

export function DraftBusinessList({ businesses }: DraftBusinessListProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const deleteDraft = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      toast.success('Draft deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting draft:', error)
      toast.error('Failed to delete draft')
    }
  }

  const submitForReview = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('businesses')
        .update({ status: 'pending' })
        .eq('id', id)

      if (error) throw error
      
      toast.success(`${name} submitted for review`)
      router.refresh()
    } catch (error) {
      console.error('Error submitting for review:', error)
      toast.error('Failed to submit for review')
    }
  }

  const drafts = businesses.filter(b => b.status === 'draft')

  if (drafts.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No drafts found</h3>
        <p className="text-muted-foreground mb-4">Start creating your business listing</p>
        <Link href="/dashboard/businesses/new">
          <Button>Create New Business</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {drafts.map((draft) => (
        <Card key={draft.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{draft.name || 'Untitled Business'}</h3>
                  <Badge variant="outline">Draft</Badge>
                </div>
                
                <div className="space-y-1 text-sm text-muted-foreground">
                  {draft.business_type && (
                    <p className="capitalize">{draft.business_type}</p>
                  )}
                  {draft.category && (
                    <p>{draft.category}</p>
                  )}
                  {(draft.city || draft.state) && (
                    <p>{draft.city}{draft.city && draft.state ? ', ' : ''}{draft.state}</p>
                  )}
                  {draft.description && (
                    <p className="line-clamp-2">{draft.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Last edited: {new Date(draft.updated_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Link href={`/dashboard/businesses/${draft.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Edit3 className="w-4 h-4 mr-2" />
                    Continue
                  </Button>
                </Link>
                
                <Button
                  size="sm"
                  onClick={() => submitForReview(draft.id, draft.name)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Submit
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => deleteDraft(draft.id, draft.name)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}