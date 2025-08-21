import { supabase } from '@/lib/supabase/client'
import WeddingPageClient from '@/components/WeddingPageClient'

interface PageProps {
  params: {
    wedding_slug: string
  }
}

export default async function WeddingPage({ params }: PageProps) {
  const { wedding_slug } = await params
  
  // Fetch wedding data
  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('*')
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

  // Fetch guests
  const { data: guests } = await supabase
    .from('wedding_guests')
    .select('*')
    .eq('wedding_id', wedding.id)
    .order('full_name')

  // Fetch memories
  const { data: memories } = await supabase
    .from('memories')
    .select('*, wedding_guests(full_name)')
    .eq('wedding_id', wedding.id)
    .order('created_at', { ascending: false })

  return (
    <WeddingPageClient 
      wedding={wedding}
      guests={guests || []}
      memories={memories || []}
      weddingSlug={wedding_slug}
    />
  )
}