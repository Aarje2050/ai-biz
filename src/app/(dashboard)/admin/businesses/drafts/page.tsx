import { AdminDraftBusinessesList } from '@/components/admin/admin-draft-businesses-list'

export default function AdminDraftsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Draft Businesses</h1>
        <p className="text-muted-foreground">
          Business listings in draft state
        </p>
      </div>
      
      <AdminDraftBusinessesList />
    </div>
  )
}