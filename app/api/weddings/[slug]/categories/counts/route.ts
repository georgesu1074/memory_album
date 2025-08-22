import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params

    // Get wedding by slug
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id')
      .eq('slug', slug)
      .single()

    if (weddingError || !wedding) {
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      )
    }

    // Get total count for all categories
    const { count: allCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id)

    // Get count for bride categories
    const { count: brideCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id)
      .eq('memory_type', 'bride')

    // Get count for groom categories
    const { count: groomCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id)
      .eq('memory_type', 'groom')

    // Get count for both/together categories
    const { count: togetherCount } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id)
      .eq('memory_type', 'both')

    return NextResponse.json({
      all: allCount || 0,
      bride: brideCount || 0,
      groom: groomCount || 0,
      together: togetherCount || 0
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}