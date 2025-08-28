import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const supabaseAdmin = createAdminClient();

    // Get the wedding ID from slug
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

    if (!query) {
      // Return all guests if no query
      const { data: guests, error } = await supabaseAdmin
        .from('wedding_guests')
        .select('*')
        .eq('wedding_id', wedding.id)
        .order('full_name')
        .limit(limit);

      if (error) {
        throw error;
      }

      return NextResponse.json({ guests: guests || [] });
    }

    // Search for guests with fuzzy matching
    // Using ilike for case-insensitive partial matching
    const { data: guests, error } = await supabaseAdmin
      .from('wedding_guests')
      .select('*')
      .eq('wedding_id', wedding.id)
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,party_name.ilike.%${query}%`)
      .order('full_name')
      .limit(limit);

    if (error) {
      throw error;
    }

    // Sort results by relevance (exact matches first)
    const sortedGuests = guests?.sort((a, b) => {
      const aName = a.full_name?.toLowerCase() || '';
      const bName = b.full_name?.toLowerCase() || '';
      
      // Exact match
      if (aName === query) return -1;
      if (bName === query) return 1;
      
      // Starts with query
      if (aName.startsWith(query)) return -1;
      if (bName.startsWith(query)) return 1;
      
      // Contains query
      return 0;
    }) || [];

    return NextResponse.json({ 
      guests: sortedGuests,
      total: sortedGuests.length 
    });
  } catch (error) {
    console.error('Error searching guests:', error);
    return NextResponse.json(
      { error: 'Failed to search guests' },
      { status: 500 }
    );
  }
}
