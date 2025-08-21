import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    // First get the wedding by slug
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

    // Search guests by name
    let guestsQuery = supabase
      .from('wedding_guests')
      .select('id, first_name, last_name, full_name, email')
      .eq('wedding_id', wedding.id)
      .order('full_name')

    // If there's a search query, filter by it
    if (query) {
      guestsQuery = guestsQuery.or(
        `first_name.ilike.%${query}%,last_name.ilike.%${query}%,full_name.ilike.%${query}%`
      )
    }

    // Limit to 10 results for autocomplete
    guestsQuery = guestsQuery.limit(10)

    const { data: guests, error: guestsError } = await guestsQuery

    if (guestsError) {
      console.error('Error searching guests:', guestsError)
      return NextResponse.json(
        { error: 'Failed to search guests' },
        { status: 500 }
      )
    }

    return NextResponse.json({ guests: guests || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}