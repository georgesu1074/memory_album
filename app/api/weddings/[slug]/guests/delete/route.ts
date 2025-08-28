import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const { guestIds } = body;
    
    if (!guestIds || !Array.isArray(guestIds) || guestIds.length === 0) {
      return NextResponse.json(
        { error: 'No guest IDs provided' },
        { status: 400 }
      );
    }
    
    const supabaseAdmin = createAdminClient();

    // Get the wedding ID from slug to verify ownership
    const { data: wedding, error: weddingError } = await supabaseAdmin
      .from('weddings')
      .select('id')
      .eq('slug', slug)
      .single();

    if (weddingError || !wedding) {
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      );
    }

    // Delete guests that belong to this wedding
    const { error: deleteError, count } = await supabaseAdmin
      .from('wedding_guests')
      .delete()
      .eq('wedding_id', wedding.id)
      .in('id', guestIds);

    if (deleteError) {
      console.error('Error deleting guests:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete guests' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deleted: count || guestIds.length
    });
  } catch (error) {
    console.error('Error in delete guests endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to delete guests' },
      { status: 500 }
    );
  }
}