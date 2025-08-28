import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
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

    // Validate required fields
    if (!body.full_name?.trim()) {
      return NextResponse.json(
        { error: 'Guest name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate
    const { data: existingGuest } = await supabaseAdmin
      .from('wedding_guests')
      .select('id')
      .eq('wedding_id', wedding.id)
      .eq('full_name', body.full_name.trim())
      .single();

    if (existingGuest) {
      return NextResponse.json(
        { error: 'A guest with this name already exists' },
        { status: 409 }
      );
    }

    // Prepare guest record
    const guestRecord = {
      wedding_id: wedding.id,
      full_name: body.full_name.trim(),
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      table_number: body.table_number?.trim() || null,
      party_name: body.party_name?.trim() || null,
      party_size: body.party_size || null,
      rsvp_status: body.rsvp_status?.trim() || null,
      dietary_restrictions: body.dietary_restrictions?.trim() || null,
      notes: body.notes?.trim() || null,
    };

    // Insert the guest
    const { data: guest, error: insertError } = await supabaseAdmin
      .from('wedding_guests')
      .insert(guestRecord)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting guest:', insertError);
      return NextResponse.json(
        { error: 'Failed to add guest' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      guest
    });
  } catch (error) {
    console.error('Error adding guest:', error);
    return NextResponse.json(
      { error: 'Failed to add guest' },
      { status: 500 }
    );
  }
}