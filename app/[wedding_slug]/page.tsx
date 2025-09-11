import { createAdminClient } from '@/lib/supabase/admin'
import WeddingPageClient from '@/components/WeddingPageClient'
import { Metadata } from 'next'
import { getCoupleNames } from '@/types/wedding'

interface PageProps {
  params: {
    wedding_slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { wedding_slug } = await params
  const supabaseAdmin = createAdminClient()
  
  const { data: wedding } = await supabaseAdmin
    .from('weddings')
    .select(`
      *,
      bride:bride_details!weddings_bride_id_fkey(*),
      groom:groom_details!weddings_groom_id_fkey(*)
    `)
    .eq('slug', wedding_slug)
    .single()

  if (!wedding) {
    return {
      title: 'Wedding Not Found',
    }
  }

  const coupleNames = getCoupleNames(wedding)
  const title = `${coupleNames}'s Wedding Memories`
  const description = wedding.wedding_date 
    ? `Share your favorite memories from ${coupleNames}'s wedding on ${new Date(wedding.wedding_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : `Share your favorite memories from ${coupleNames}'s special day`
  
  const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://memoryalbum.ai'}/${wedding_slug}`
  const themeColor = wedding.theme_color || '#8B5CF6'

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: 'Memory Album',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: `/api/og?wedding=${wedding_slug}`,
          width: 1200,
          height: 630,
          alt: `${coupleNames}'s Wedding`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og?wedding=${wedding_slug}`],
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://memoryalbum.ai'),
    alternates: {
      canonical: url,
    },
    other: {
      'theme-color': themeColor,
    },
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