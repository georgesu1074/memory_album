import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabaseAdmin = createAdminClient();

    // Update wedding to inactive
    const { data: wedding, error } = await supabaseAdmin
      .from('weddings')
      .update({ is_active: false })
      .eq('slug', slug)
      .select()
      .single();

    if (error || !wedding) {
      return NextResponse.json(
        { error: 'Failed to deactivate wedding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wedding
    });
  } catch (error) {
    console.error('Error deactivating wedding:', error);
    return NextResponse.json(
      { error: 'Failed to deactivate wedding' },
      { status: 500 }
    );
  }
}