import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { uploadPhoto, STORAGE_BUCKETS } from '@/lib/supabase/storage'
import { processMemory } from '@/lib/ai/event-categorizer'
import { updateCategoryMemoryType } from '@/lib/categories/update-memory-type'
import { queueDriveUpload } from '@/lib/services/drive-upload-queue'

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = await params
    
    // Parse FormData instead of JSON
    const formData = await request.formData()
    
    const memoryType = formData.get('memoryType') as string
    const guestId = formData.get('guestId') as string
    const guestName = formData.get('guestName') as string
    const memoryText = formData.get('memoryText') as string

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
      status: 'pending' // Will be processed by AI async
    }

    // If we have a guest ID, link it
    if (guestId && guestId !== '') {
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

    // Handle photo uploads
    const photoUrls: string[] = []
    const photoErrors: string[] = []
    
    // Get all photos from FormData
    const photos: File[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('photo_') && value instanceof File) {
        photos.push(value)
      }
    }

    // Upload each photo
    for (const photo of photos) {
      const result = await uploadPhoto(
        supabase,
        photo,
        wedding.id,
        'MEMORY_PHOTOS'
      )

      if ('error' in result) {
        console.error('Photo upload error:', result.error)
        photoErrors.push(result.error)
      } else {
        // Save photo record in database
        const { error: photoDbError } = await supabase
          .from('memory_photos')
          .insert({
            memory_id: memory.id,
            storage_path: result.path,
            url: result.publicUrl,
            size_bytes: photo.size,
            mime_type: photo.type,
            display_order: photoUrls.length
          })

        if (photoDbError) {
          console.error('Error saving photo record:', photoDbError)
          photoErrors.push('Failed to save photo record')
        } else {
          photoUrls.push(result.publicUrl)
        }
      }
    }

    // Queue Google Drive upload if photos were uploaded
    if (photoUrls.length > 0) {
      console.log(`[DRIVE] Queuing ${photoUrls.length} photos for Drive upload`)
      queueDriveUpload({
        memoryId: memory.id,
        weddingSlug: slug,
        photoUrls,
        memoryType: memoryType as 'bride' | 'groom' | 'both',
      }).catch(error => {
        console.error('[DRIVE] Failed to queue upload:', error)
        // Don't fail the request if Drive queue fails
      })
    }

    // Trigger async categorization (don't wait for it)
    console.log(`[CATEGORIZATION] Starting async categorization for memory ${memory.id}`)
    processMemory(memory.id, wedding.id)
      .then(success => {
        console.log(`[CATEGORIZATION] Memory ${memory.id} categorization ${success ? 'succeeded' : 'failed'}`)
      })
      .catch(error => {
        console.error('[CATEGORIZATION] Background categorization failed:', error)
        // Don't fail the request - categorization will be retried by cron
      })

    return NextResponse.json({
      success: true,
      memoryId: memory.id,
      message: 'Memory saved successfully!',
      photoUrls,
      photoErrors: photoErrors.length > 0 ? photoErrors : undefined
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

    // Fetch memories with guest information and photos
    const { data: memories, error: memoriesError } = await supabase
      .from('memories')
      .select(`
        *,
        wedding_guests (
          id,
          first_name,
          last_name,
          full_name
        ),
        memory_photos (
          id,
          url,
          thumbnail_url,
          display_order
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