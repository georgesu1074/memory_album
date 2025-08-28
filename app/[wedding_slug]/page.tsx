import { supabase } from '@/lib/supabase/client'
import WeddingPageClient from '@/components/WeddingPageClient'

interface PageProps {
  params: {
    wedding_slug: string
  }
}

export default async function WeddingPage({ params }: PageProps) {
  const { wedding_slug } = await params
  
  // Fetch wedding data first (separate queries for now due to Supabase join limitations)
  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', wedding_slug)
    .single()

  // Fetch related detail records if they exist
  if (wedding?.groom_id) {
    const { data: groomDetails } = await supabase
      .from('groom_details')
      .select('*')
      .eq('id', wedding.groom_id)
      .single()
    
    if (groomDetails) {
      wedding.groom = groomDetails
    }
  }

  if (wedding?.bride_id) {
    const { data: brideDetails } = await supabase
      .from('bride_details')
      .select('*')
      .eq('id', wedding.bride_id)
      .single()
    
    if (brideDetails) {
      wedding.bride = brideDetails
    }
  }

  if (weddingError || !wedding) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Wedding Not Found</h1>
          <p className="text-gray-600">This wedding page doesn't exist.</p>
        </div>
      </div>
    )
  }

  // Fetch guests
  const { data: guests } = await supabase
    .from('wedding_guests')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('full_name')

  // Fetch initial categories with their memories and photos (first 6 for initial load)
  const { data: categories } = await supabase
    .from('categories')
    .select(`
      *,
      memories:memories(
        id,
        memory_text,
        guest_name,
        memory_type,
        created_at,
        wedding_guests(full_name),
        memory_photos(
          id,
          url,
          thumbnail_url
        )
      )
    `)
    .eq('wedding_id', wedding.id)
    .order('memory_count', { ascending: false })
    .range(0, 5) // Load first 6 categories initially

  return (
    <WeddingPageClient 
      wedding={wedding}
      guests={guests || []}
      categories={categories || []}
      weddingSlug={wedding_slug}
    />
  )
}