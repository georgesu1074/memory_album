import { supabase } from '@/lib/supabase/client'

interface PageProps {
  params: {
    wedding_slug: string
  }
}

export default async function WeddingPage({ params }: PageProps) {
  // Fetch wedding data
  const { data: wedding, error: weddingError } = await supabase
    .from('weddings')
    .select('*')
    .eq('slug', params.wedding_slug)
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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2" style={{ color: wedding.theme_color }}>
            {wedding.couple_names}
          </h1>
          <p className="text-gray-600">Wedding Date: {wedding.wedding_date || 'TBD'}</p>
          <p className="text-sm text-gray-500 mt-2">Slug: {wedding.slug}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Guest List ({guests?.length || 0})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {guests?.map((guest) => (
              <div key={guest.id} className="text-sm p-2 bg-gray-50 rounded">
                {guest.full_name}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Memories ({memories?.length || 0})</h2>
          <div className="space-y-4">
            {memories?.map((memory) => (
              <div key={memory.id} className="border-l-4 border-purple-500 pl-4">
                <p className="text-gray-800 mb-2">{memory.memory_text}</p>
                <p className="text-sm text-gray-500">
                  - {memory.wedding_guests?.full_name || memory.guest_name || 'Anonymous'}
                  {memory.ai_category && ` • ${memory.ai_category}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>This is a test page showing database connection.</p>
          <p>The actual memory submission UI will be built in Sprint 2.</p>
        </div>
      </div>
    </div>
  )
}