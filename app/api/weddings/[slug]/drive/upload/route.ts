import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/google/drive-service';
import { createAdminClient } from '@/lib/supabase/admin';

interface Params {
  slug: string;
}

interface UploadRequest {
  memoryId: string;
  photoUrls: string[];
  memoryType: 'bride' | 'groom' | 'both';
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { slug } = await context.params;

  try {
    const body: UploadRequest = await request.json();
    const { memoryId, photoUrls, memoryType } = body;

    if (!memoryId || !photoUrls || photoUrls.length === 0) {
      return NextResponse.json(
        { error: 'Memory ID and photo URLs required' },
        { status: 400 }
      );
    }

    // Create Drive service
    const driveService = await GoogleDriveService.fromWeddingSlug(slug);
    
    if (!driveService) {
      return NextResponse.json(
        { error: 'Google Drive not connected' },
        { status: 400 }
      );
    }

    // Check if configured
    const isConfigured = await driveService.isConfigured();
    if (!isConfigured) {
      return NextResponse.json(
        { error: 'Google Drive folders not set up' },
        { status: 400 }
      );
    }

    // Get the appropriate folder ID
    const folderId = await driveService.getUploadFolderId(memoryType);
    if (!folderId) {
      return NextResponse.json(
        { error: 'Upload folder not found' },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();
    const uploadResults = [];

    // Upload each photo
    for (let i = 0; i < photoUrls.length; i++) {
      const photoUrl = photoUrls[i];
      
      // Create tracking record
      const { data: uploadRecord } = await supabase
        .from('memory_drive_uploads')
        .insert({
          memory_id: memoryId,
          photo_url: photoUrl,
          drive_folder_id: folderId,
          upload_status: 'uploading',
        })
        .select()
        .single();

      if (!uploadRecord) {
        console.error('Failed to create upload record for photo:', photoUrl);
        continue;
      }

      try {
        // Generate filename
        const timestamp = Date.now();
        const fileName = `memory_${memoryId}_photo_${i + 1}_${timestamp}.jpg`;

        // Upload to Drive
        const result = await driveService.uploadPhotoFromUrl(
          photoUrl,
          fileName,
          folderId
        );

        if (result.success && result.fileId) {
          // Update record with success
          await supabase
            .from('memory_drive_uploads')
            .update({
              drive_file_id: result.fileId,
              upload_status: 'completed',
              uploaded_at: new Date().toISOString(),
            })
            .eq('id', uploadRecord.id);

          uploadResults.push({
            photoUrl,
            success: true,
            fileId: result.fileId,
          });
        } else {
          // Update record with failure
          await supabase
            .from('memory_drive_uploads')
            .update({
              upload_status: 'failed',
              error_message: result.error || 'Unknown error',
              retry_count: 1,
            })
            .eq('id', uploadRecord.id);

          uploadResults.push({
            photoUrl,
            success: false,
            error: result.error,
          });
        }
      } catch (error) {
        // Update record with error
        await supabase
          .from('memory_drive_uploads')
          .update({
            upload_status: 'failed',
            error_message: error instanceof Error ? error.message : 'Upload failed',
            retry_count: 1,
          })
          .eq('id', uploadRecord.id);

        uploadResults.push({
          photoUrl,
          success: false,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    // Update upload count
    const successCount = uploadResults.filter(r => r.success).length;
    if (successCount > 0) {
      const { data: wedding } = await supabase
        .from('weddings')
        .select('id')
        .eq('slug', slug)
        .single();

      if (wedding) {
        // First fetch current count
        const { data: currentDrive } = await supabase
          .from('wedding_google_drive')
          .select('total_photos_uploaded')
          .eq('wedding_id', wedding.id)
          .single();

        const currentCount = currentDrive?.total_photos_uploaded || 0;

        // Update with incremented count
        await supabase
          .from('wedding_google_drive')
          .update({
            total_photos_uploaded: currentCount + successCount,
            last_sync_at: new Date().toISOString(),
          })
          .eq('wedding_id', wedding.id);
      }
    }

    return NextResponse.json({
      success: true,
      uploaded: successCount,
      failed: uploadResults.length - successCount,
      results: uploadResults,
    });
  } catch (error) {
    console.error('Error uploading to Drive:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}