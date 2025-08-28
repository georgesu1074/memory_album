import { createAdminClient } from '@/lib/supabase/admin'
import WeddingPageClient from '@/components/WeddingPageClient'

interface PageProps {
  params: {
    wedding_slug: string
  }
}

export default async function WeddingPage({ params }: PageProps) {
  const { wedding_slug } = await params
  const supabaseAdmin = createAdminClient()
  
  // Fetch wedding data with admin client (bypasses RLS to show inactive weddings too)
  const { data: wedding, error: weddingError } = await supabaseAdmin
    .from('weddings')
    .select(`
      *,
      bride:bride_details!weddings_bride_id_fkey(*),
      groom:groom_details!weddings_groom_id_fkey(*)
    `)
    .eq('slug', wedding_slug)
    .single()

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

  // Fetch guests using admin client
  const { data: guests } = await supabaseAdmin
    .from('wedding_guests')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('full_name')

  // Fetch initial categories with their memories and photos (first 6 for initial load)
  const { data: categories } = await supabaseAdmin
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

  // Add preview mode banner if wedding is inactive
  if (!wedding.is_active) {
    return (
      <>
        <div className="bg-yellow-50 border-b border-yellow-200 p-3 text-center">
          <p className="text-yellow-800">
            <span className="font-semibold">⚠️ Preview Mode:</span> This wedding page is currently inactive. 
            <a 
              href={`/${wedding_slug}/config`}
              className="underline ml-2 hover:text-yellow-900"
            >
              Activate in Settings
            </a>
          </p>
        </div>
        <WeddingPageClient 
          wedding={wedding}
          guests={guests || []}
          categories={categories || []}
          weddingSlug={wedding_slug}
        />
      </>
    )
  }

  return (
    <WeddingPageClient 
      wedding={wedding}
      guests={guests || []}
      categories={categories || []}
      weddingSlug={wedding_slug}
    />
  )
}