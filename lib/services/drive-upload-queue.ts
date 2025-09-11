import { createAdminClient } from '@/lib/supabase/admin';

export interface QueuedUpload {
  memoryId: string;
  weddingSlug: string;
  photoUrls: string[];
  memoryType: 'bride' | 'groom' | 'both';
}

/**
 * Queue photos for Google Drive upload after memory submission
 */
export async function queueDriveUpload(upload: QueuedUpload): Promise<void> {
  try {
    // Check if Drive is connected for this wedding
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/weddings/${upload.weddingSlug}/drive/status`
    );
    
    if (!response.ok) {
      console.log('Drive not connected for wedding:', upload.weddingSlug);
      return;
    }

    const status = await response.json();
    
    if (!status.connected || !status.configured) {
      console.log('Drive not configured for wedding:', upload.weddingSlug);
      return;
    }

    // Trigger upload in background (fire and forget)
    // In production, this would be a queue service like BullMQ or AWS SQS
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/weddings/${upload.weddingSlug}/drive/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memoryId: upload.memoryId,
          photoUrls: upload.photoUrls,
          memoryType: upload.memoryType,
        }),
      }
    ).catch(error => {
      console.error('Failed to trigger Drive upload:', error);
    });

  } catch (error) {
    console.error('Error queuing Drive upload:', error);
  }
}

/**
 * Process pending uploads (called by cron job)
 */
export async function processPendingUploads(): Promise<void> {
  const supabase = createAdminClient();
  
  try {
    // Get all pending uploads
    const { data: pendingUploads } = await supabase
      .from('memory_drive_uploads')
      .select(`
        id,
        memory_id,
        photo_url,
        retry_count,
        memories!inner(
          wedding_id,
          memory_type,
          weddings!inner(
            slug
          )
        )
      `)
      .eq('upload_status', 'pending')
      .lt('retry_count', 3)
      .limit(10);

    if (!pendingUploads || pendingUploads.length === 0) {
      return;
    }

    // Group by wedding for batch processing
    const uploadsByWedding = new Map<string, typeof pendingUploads>();
    
    for (const upload of pendingUploads) {
      const weddingSlug = upload.memories.weddings.slug;
      if (!uploadsByWedding.has(weddingSlug)) {
        uploadsByWedding.set(weddingSlug, []);
      }
      uploadsByWedding.get(weddingSlug)!.push(upload);
    }

    // Process each wedding's uploads
    for (const [weddingSlug, uploads] of uploadsByWedding) {
      // Group by memory for efficient processing
      const uploadsByMemory = new Map<string, typeof uploads>();
      
      for (const upload of uploads) {
        const memoryId = upload.memory_id;
        if (!uploadsByMemory.has(memoryId)) {
          uploadsByMemory.set(memoryId, []);
        }
        uploadsByMemory.get(memoryId)!.push(upload);
      }

      // Process each memory's photos
      for (const [memoryId, memoryUploads] of uploadsByMemory) {
        const photoUrls = memoryUploads.map(u => u.photo_url);
        const memoryType = memoryUploads[0].memories.memory_type;
        
        await queueDriveUpload({
          memoryId,
          weddingSlug,
          photoUrls,
          memoryType,
        });
      }
    }
  } catch (error) {
    console.error('Error processing pending uploads:', error);
  }
}

/**
 * Retry failed uploads
 */
export async function retryFailedUploads(): Promise<void> {
  const supabase = createAdminClient();
  
  try {
    // Get failed uploads that haven't exceeded retry limit
    const { data: failedUploads } = await supabase
      .from('memory_drive_uploads')
      .select('*')
      .eq('upload_status', 'failed')
      .lt('retry_count', 3)
      .limit(5);

    if (!failedUploads || failedUploads.length === 0) {
      return;
    }

    // Mark as pending to retry
    const uploadIds = failedUploads.map(u => u.id);
    await supabase
      .from('memory_drive_uploads')
      .update({
        upload_status: 'pending',
        retry_count: supabase.raw('retry_count + 1'),
      })
      .in('id', uploadIds);

    // Process will pick them up in next run
  } catch (error) {
    console.error('Error retrying failed uploads:', error);
  }
}