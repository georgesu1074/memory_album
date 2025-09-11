import { NextRequest, NextResponse } from 'next/server';
import { processPendingUploads, retryFailedUploads } from '@/lib/services/drive-upload-queue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (in production)
  const authHeader = request.headers.get('authorization');
  
  if (process.env.NODE_ENV === 'production') {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  try {
    console.log('Starting Drive upload cron job...');
    
    // Process pending uploads
    await processPendingUploads();
    
    // Retry failed uploads
    await retryFailedUploads();
    
    console.log('Drive upload cron job completed');
    
    return NextResponse.json({
      success: true,
      message: 'Drive uploads processed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process uploads',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}