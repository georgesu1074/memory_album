import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface Params {
  slug: string;
}

export async function DELETE(
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

    // Mark the Drive connection as inactive (don't delete - keep for history)
    const { error: updateError } = await supabase
      .from('wedding_google_drive')
      .update({
        is_active: false,
        // Clear sensitive tokens but keep metadata
        access_token: null,
        refresh_token: null,
      })
      .eq('wedding_id', wedding.id);

    if (updateError) {
      console.error('Error disconnecting Drive:', updateError);
      return NextResponse.json(
        { error: 'Failed to disconnect Google Drive' },
        { status: 500 }
      );
    }

    // Note: We keep the folder IDs and upload history for reference
    // Photos already uploaded to Drive will remain there

    return NextResponse.json({
      success: true,
      message: 'Google Drive disconnected successfully',
      note: 'Previously uploaded photos remain in your Google Drive',
    });
  } catch (error) {
    console.error('Error disconnecting Drive:', error);
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to support reconnection
 */
export async function GET(
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

    // Check if there's an inactive connection that can be reactivated
    const { data: driveConfig } = await supabase
      .from('wedding_google_drive')
      .select('*')
      .eq('wedding_id', wedding.id)
      .eq('is_active', false)
      .single();

    if (driveConfig) {
      return NextResponse.json({
        canReconnect: true,
        previousConnection: {
          email: driveConfig.google_email,
          totalUploaded: driveConfig.total_photos_uploaded,
          lastSyncAt: driveConfig.last_sync_at,
        },
        message: 'You can reconnect to continue backing up photos',
      });
    }

    return NextResponse.json({
      canReconnect: false,
      message: 'No previous connection found',
    });
  } catch (error) {
    console.error('Error checking reconnection status:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}