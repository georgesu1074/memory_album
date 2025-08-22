import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const offset = parseInt(searchParams.get('offset') || '0')
    const limit = parseInt(searchParams.get('limit') || '6')
    const memoryType = searchParams.get('type') || 'all'

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

    // Build query
    let query = supabase
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
      .range(offset, offset + limit - 1)

    // Apply memory type filter if needed
    if (memoryType !== 'all') {
      const filterType = memoryType === 'together' ? 'both' : memoryType
      query = query.eq('memory_type', filterType)
    }

    const { data: categories, error: categoriesError } = await query

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch categories' },
        { status: 500 }
      )
    }

    // Get total count for the filter
    let countQuery = supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('wedding_id', wedding.id)

    if (memoryType !== 'all') {
      const filterType = memoryType === 'together' ? 'both' : memoryType
      countQuery = countQuery.eq('memory_type', filterType)
    }

    const { count } = await countQuery

    return NextResponse.json({ 
      categories: categories || [],
      hasMore: (offset + limit) < (count || 0),
      total: count || 0
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}