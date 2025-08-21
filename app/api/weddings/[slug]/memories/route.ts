import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params
    
    // Parse the JSON body
    const body = await request.json()
    const {
      memoryType,
      guestId,
      guestName,
      memoryText,
      photos
    } = body

    // Validate required fields
    if (!memoryText || memoryText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Memory text is required' },
        { status: 400 }
      )
    }

    if (!guestName || guestName.trim().length === 0) {
      return NextResponse.json(
        { error: 'Guest name is required' },
        { status: 400 }
      )
    }

    // Get wedding by slug
    const { data: wedding, error: weddingError } = await supabase
      .from('weddings')
      .select('id')
      .eq('slug', slug)
      .single()

    if (weddingError || !wedding) {
      console.error('Wedding not found:', weddingError)
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      )
    }

    // Create the memory record
    const memoryData: any = {
      wedding_id: wedding.id,
      memory_text: memoryText.trim(),
      memory_type: memoryType || 'both',
      guest_name: guestName.trim(),
      is_processed: false // Will be processed by AI later
      // TODO: Change to status: 'pending' after migration
    }

    // If we have a guest ID, link it
    if (guestId) {
      memoryData.guest_id = guestId
    }

    const { data: memory, error: memoryError } = await supabase
      .from('memories')
      .insert(memoryData)
      .select()
      .single()

    if (memoryError) {
      console.error('Error creating memory:', memoryError)
      return NextResponse.json(
        { error: 'Failed to save memory' },
        { status: 500 }
      )
    }

    // TODO: Handle photo uploads to Supabase Storage
    // For now, we'll just log that photos were provided
    if (photos && photos.length > 0) {
      console.log(`Memory ${memory.id} has ${photos.length} photos to upload`)
      // In the next iteration, we'll upload these to Supabase Storage
    }

    return NextResponse.json({
      success: true,
      memoryId: memory.id,
      message: 'Memory saved successfully!'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch memories for a wedding
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

    // Fetch memories with guest information
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select(`
        *,
        wedding_guests (
          id,
          first_name,
          last_name,
          full_name
        )
      `)
      .eq('wedding_id', wedding.id)
      .order('created_at', { ascending: false })

    if (memoriesError) {
      console.error('Error fetching memories:', memoriesError)
      return NextResponse.json(
        { error: 'Failed to fetch memories' },
        { status: 500 }
      )
    }

    return NextResponse.json({ memories: memories || [] })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}