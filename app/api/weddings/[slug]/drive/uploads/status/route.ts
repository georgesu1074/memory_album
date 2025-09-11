import { NextRequest, NextResponse } from 'next/server';
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

    // Get memory IDs for this wedding
    const { data: memories } = await supabase
      .from('memories')
      .select('id')
      .eq('wedding_id', wedding.id);
    
    const memoryIds = memories?.map(m => m.id) || [];
    
    // Get upload counts by status
    let statusCounts: any[] = [];
    if (memoryIds.length > 0) {
      const { data } = await supabase
        .from('memory_drive_uploads')
        .select('upload_status')
        .in('memory_id', memoryIds);
      
      statusCounts = data || [];
    }

    const counts = {
      pending: 0,
      uploading: 0,
      completed: 0,
      failed: 0,
    };

    statusCounts?.forEach(row => {
      const status = row.upload_status as keyof typeof counts;
      if (status in counts) {
        counts[status]++;
      }
    });

    // Get recent uploads (last 10)
    const { data: recentUploads } = await supabase
      .from('memory_drive_uploads')
      .select(`
        id,
        photo_url,
        upload_status,
        uploaded_at,
        error_message,
        created_at,
        memories!inner(
          wedding_id
        )
      `)
      .eq('memories.wedding_id', wedding.id)
      .order('created_at', { ascending: false })
      .limit(10);

    const formattedUploads = recentUploads?.map(upload => ({
      id: upload.id,
      photoUrl: upload.photo_url,
      status: upload.upload_status,
      uploadedAt: upload.uploaded_at,
      errorMessage: upload.error_message,
    })) || [];

    return NextResponse.json({
      ...counts,
      recentUploads: formattedUploads,
    });
  } catch (error) {
    console.error('Error fetching upload status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch upload status' },
      { status: 500 }
    );
  }
}