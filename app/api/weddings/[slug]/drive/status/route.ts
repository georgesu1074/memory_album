import { NextRequest, NextResponse } from 'next/server';
import { GoogleDriveService } from '@/lib/google/drive-service';
import { createAdminClient } from '@/lib/supabase/admin';

interface Params {
  slug: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const { slug } = await context.params;

  try {
    // Get wedding ID from slug
    const supabase = createAdminClient();
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

    // Get Drive configuration
    const { data: driveConfig } = await supabase
      .from('wedding_google_drive')
      .select('*')
      .eq('wedding_id', wedding.id)
      .single();

    if (!driveConfig) {
      return NextResponse.json({
        connected: false,
        configured: false,
        message: 'Google Drive not connected',
      });
    }

    // Check if folders are created
    const foldersCreated = !!(
      driveConfig.root_folder_id &&
      driveConfig.photos_folder_id &&
      driveConfig.bride_folder_id &&
      driveConfig.groom_folder_id &&
      driveConfig.together_folder_id
    );

    // Get upload statistics
    const { data: uploadStats } = await supabase
      .from('memory_drive_uploads')
      .select('upload_status')
      .eq('upload_status', 'completed')
      .in('memory_id', 
        supabase
          .from('memories')
          .select('id')
          .eq('wedding_id', wedding.id)
      );

    const totalUploaded = uploadStats?.length || 0;

    // Check token expiry
    const tokenExpiresAt = new Date(driveConfig.token_expires_at);
    const now = new Date();
    const tokenValid = tokenExpiresAt > now;

    return NextResponse.json({
      connected: true,
      configured: foldersCreated,
      tokenValid,
      tokenExpiresAt: tokenExpiresAt.toISOString(),
      email: driveConfig.google_email,
      name: driveConfig.google_name,
      folders: foldersCreated ? {
        rootFolderId: driveConfig.root_folder_id,
        photosFolderId: driveConfig.photos_folder_id,
        brideFolderId: driveConfig.bride_folder_id,
        groomFolderId: driveConfig.groom_folder_id,
        togetherFolderId: driveConfig.together_folder_id,
      } : null,
      statistics: {
        totalUploaded,
        lastSyncAt: driveConfig.last_sync_at,
      },
    });
  } catch (error) {
    console.error('Error getting Drive status:', error);
    return NextResponse.json(
      { error: 'Failed to get Drive status' },
      { status: 500 }
    );
  }
}