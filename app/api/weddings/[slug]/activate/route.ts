import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const supabaseAdmin = createAdminClient();

    // Update wedding to active
    const { data: wedding, error } = await supabaseAdmin
      .from('weddings')
      .update({ is_active: true })
      .eq('slug', slug)
      .select()
      .single();

    if (error || !wedding) {
      return NextResponse.json(
        { error: 'Failed to activate wedding' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wedding
    });
  } catch (error) {
    console.error('Error activating wedding:', error);
    return NextResponse.json(
      { error: 'Failed to activate wedding' },
      { status: 500 }
    );
  }
}