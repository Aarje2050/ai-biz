import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Button, Card, CardContent } from '@/components/ui'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui'
import { Badge } from '@/components/ui'
import { 
  Eye, 
  Calendar,
  MapPin,
  Building,
  FileText,
  User
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DraftBusiness {
  id: string
  name: string
  category: string
  city: string
  state: string
  created_at: string
  updated_at: string
  logo_url: string | null
  description: string | null
  business_type: string
  profiles?: {
    full_name: string | null
    email: string
  }
}

export async function AdminDraftBusinessesList() {
  const supabase = createServerSupabaseClient()

  const { data: drafts, error } = await supabase
    .from('businesses')
    .select(`
      id,
      name,
      category,
      city,
      state,
      created_at,
      updated_at,
      logo_url,
      description,
      business_type,
      owner_id
    `)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching draft businesses:', error)
    return (
      <Card>
        <CardContent className="py-8 text-center text-red-600">
          Error loading draft businesses: {error.message}
        </CardContent>
      </Card>
    )
  }

  // Fetch profiles for these businesses
  let businesses: DraftBusiness[] = []
  if (drafts && drafts.length > 0) {
    const userIds = drafts.map(business => business.owner_id)
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .in('id', userIds)
    
    const profileLookup = new Map()
    profiles?.forEach(profile => {
      profileLookup.set(profile.id, profile)
    })
    
    businesses = drafts.map(business => ({
      ...business,
      profiles: profileLookup.get(business.owner_id) || { email: '', full_name: null }
    }))
  }

  if (businesses.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-medium mb-2">No draft businesses</h3>
          <p className="text-muted-foreground">
            All businesses have been submitted for review
          </p>
        </CardContent>
      </Card>
    )
  }
  console.log('Draft businesses:', businesses.length)

  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <Card key={business.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={business.logo_url || ''} alt={business.name} />
                <AvatarFallback className="text-lg">
                  {business.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold">{business.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {business.profiles?.email}
                    </p>
                  </div>
                  
                  <Badge variant="outline" className="ml-4">
                    <FileText className="h-3 w-3 mr-1" />
                    Draft
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-3 w-3" />
                    {business.category} • {business.business_type}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {business.city}, {business.state}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {formatDistanceToNow(new Date(business.created_at), { addSuffix: true })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Updated {formatDistanceToNow(new Date(business.updated_at), { addSuffix: true })}
                  </div>
                  {business.profiles?.full_name && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {business.profiles.full_name}
                    </div>
                  )}
                </div>
                
                {business.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {business.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Link href={`/admin/businesses/${business.id}`}>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}