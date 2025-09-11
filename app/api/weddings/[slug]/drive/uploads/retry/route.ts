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

    // Get failed uploads for this wedding
    const { data: failedUploads } = await supabase
      .from('memory_drive_uploads')
      .select(`
        id,
        memory_id,
        photo_url,
        retry_count,
        memories!inner(
          wedding_id,
          memory_type
        )
      `)
      .eq('upload_status', 'failed')
      .eq('memories.wedding_id', wedding.id)
      .lt('retry_count', 3);

    if (!failedUploads || failedUploads.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No failed uploads to retry',
        retried: 0,
      });
    }

    // Group by memory for efficient retry
    const uploadsByMemory = new Map<string, typeof failedUploads>();
    
    for (const upload of failedUploads) {
      const memoryId = upload.memory_id;
      if (!uploadsByMemory.has(memoryId)) {
        uploadsByMemory.set(memoryId, []);
      }
      uploadsByMemory.get(memoryId)!.push(upload);
    }

    // Reset status to pending and increment retry count
    const uploadIds = failedUploads.map(u => u.id);
    await supabase
      .from('memory_drive_uploads')
      .update({
        upload_status: 'pending',
        retry_count: supabase.raw('retry_count + 1'),
        error_message: null,
      })
      .in('id', uploadIds);

    // Queue retries
    let retriedCount = 0;
    
    for (const [memoryId, uploads] of uploadsByMemory) {
      const photoUrls = uploads.map(u => u.photo_url);
      const memoryType = uploads[0].memories.memory_type;
      
      await queueDriveUpload({
        memoryId,
        weddingSlug: slug,
        photoUrls,
        memoryType,
      });
      
      retriedCount += photoUrls.length;
    }

    return NextResponse.json({
      success: true,
      message: `Retrying ${retriedCount} failed uploads`,
      retried: retriedCount,
    });
  } catch (error) {
    console.error('Error retrying uploads:', error);
    return NextResponse.json(
      { error: 'Failed to retry uploads' },
      { status: 500 }
    );
  }
}