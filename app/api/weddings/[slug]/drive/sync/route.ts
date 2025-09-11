import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { queueDriveUpload } from '@/lib/services/drive-upload-queue';

interface Params {
  slug: string;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { slug } = await context.params;

  try {
    const supabase = createAdminClient();
    
    // Get wedding ID
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!wedding) {
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      );
    }

    // Check if Drive is connected
    const { data: driveConfig } = await supabase
      .from('wedding_google_drive')
      .select('*')
      .eq('wedding_id', wedding.id)
      .eq('is_active', true)
      .single();

    if (!driveConfig) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      );
    }

    // Get all memories with photos that haven't been uploaded
    const { data: memories } = await supabase
      .from('memories')
      .select(`
        id,
        memory_type,
        memory_photos!inner(
          id,
          url
        )
      `)
      .eq('wedding_id', wedding.id);

    if (!memories || memories.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No memories to sync',
        synced: 0,
      });
    }

    // Get already uploaded photos to avoid duplicates
    const { data: uploadedPhotos } = await supabase
      .from('memory_drive_uploads')
      .select('photo_url')
      .eq('upload_status', 'completed');

    const uploadedUrls = new Set(uploadedPhotos?.map(p => p.photo_url) || []);
    
    // Queue uploads for photos not yet uploaded
    let queuedCount = 0;
    
    for (const memory of memories) {
      const photosToUpload = memory.memory_photos
        .filter((photo: any) => !uploadedUrls.has(photo.url))
        .map((photo: any) => photo.url);

      if (photosToUpload.length > 0) {
        await queueDriveUpload({
          memoryId: memory.id,
          weddingSlug: slug,
          photoUrls: photosToUpload,
          memoryType: memory.memory_type as 'bride' | 'groom' | 'both',
        });
        
        queuedCount += photosToUpload.length;
      }
    }

    // Update last sync time
    await supabase
      .from('wedding_google_drive')
      .update({
        last_sync_at: new Date().toISOString(),
      })
      .eq('wedding_id', wedding.id);

    return NextResponse.json({
      success: true,
      message: `Queued ${queuedCount} photos for upload`,
      queued: queuedCount,
    });
  } catch (error) {
    console.error('Error triggering manual sync:', error);
    return NextResponse.json(
      { error: 'Failed to trigger sync' },
      { status: 500 }
    );
  }
}