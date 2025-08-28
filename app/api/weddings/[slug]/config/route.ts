import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch wedding with bride and groom details
    const supabaseAdmin = createAdminClient();
    const { data: wedding, error } = await supabaseAdmin
      .from('weddings')
      .select(`
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      `)
      .eq('slug', slug)
      .single();

    if (error || !wedding) {
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      );
    }

    // Return configuration data
    return NextResponse.json({
      wedding: {
        id: wedding.id,
        slug: wedding.slug,
        wedding_date: wedding.wedding_date,
        theme_color: wedding.theme_color,
        secondary_color: wedding.secondary_color,
        is_active: wedding.is_active,
        bride: wedding.bride,
        groom: wedding.groom,
        created_at: wedding.created_at,
        updated_at: wedding.updated_at
      }
    });
  } catch (error) {
    console.error('Error fetching wedding config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wedding configuration' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const body = await request.json();
    const supabaseAdmin = createAdminClient();

    // First, fetch the wedding to get bride_id and groom_id
    const { data: wedding, error: fetchError } = await supabaseAdmin
      .from('weddings')
      .select('id, bride_id, groom_id')
      .eq('slug', slug)
      .single();

    if (fetchError || !wedding) {
      return NextResponse.json(
        { error: 'Wedding not found' },
        { status: 404 }
      );
    }

    // Prepare wedding updates
    const weddingUpdates: any = {};
    if (body.wedding_date !== undefined) weddingUpdates.wedding_date = body.wedding_date;
    if (body.theme_color !== undefined) weddingUpdates.theme_color = body.theme_color;
    if (body.secondary_color !== undefined) weddingUpdates.secondary_color = body.secondary_color;
    if (body.is_active !== undefined) weddingUpdates.is_active = body.is_active;

    // Update wedding if there are changes
    if (Object.keys(weddingUpdates).length > 0) {
      const { error: weddingUpdateError } = await supabaseAdmin
        .from('weddings')
        .update(weddingUpdates)
        .eq('id', wedding.id);

      if (weddingUpdateError) {
        console.error('Error updating wedding:', weddingUpdateError);
        return NextResponse.json(
          { error: 'Failed to update wedding' },
          { status: 500 }
        );
      }
    }

    // Update bride details if provided
    if (body.bride && wedding.bride_id) {
      const brideUpdates: any = {};
      if (body.bride.name !== undefined) brideUpdates.name = body.bride.name;
      if (body.bride.email !== undefined) brideUpdates.email = body.bride.email;
      if (body.bride.display_name !== undefined) brideUpdates.display_name = body.bride.display_name;

      if (Object.keys(brideUpdates).length > 0) {
        const { error: brideUpdateError } = await supabaseAdmin
          .from('bride_details')
          .update(brideUpdates)
          .eq('id', wedding.bride_id);

        if (brideUpdateError) {
          console.error('Error updating bride details:', brideUpdateError);
          return NextResponse.json(
            { error: 'Failed to update bride details' },
            { status: 500 }
          );
        }
      }
    }

    // Update groom details if provided
    if (body.groom && wedding.groom_id) {
      const groomUpdates: any = {};
      if (body.groom.name !== undefined) groomUpdates.name = body.groom.name;
      if (body.groom.email !== undefined) groomUpdates.email = body.groom.email;
      if (body.groom.display_name !== undefined) groomUpdates.display_name = body.groom.display_name;

      if (Object.keys(groomUpdates).length > 0) {
        const { error: groomUpdateError } = await supabaseAdmin
          .from('groom_details')
          .update(groomUpdates)
          .eq('id', wedding.groom_id);

        if (groomUpdateError) {
          console.error('Error updating groom details:', groomUpdateError);
          return NextResponse.json(
            { error: 'Failed to update groom details' },
            { status: 500 }
          );
        }
      }
    }

    // Fetch and return updated wedding
    const { data: updatedWedding, error: finalFetchError } = await supabaseAdmin
      .from('weddings')
      .select(`
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      `)
      .eq('id', wedding.id)
      .single();

    if (finalFetchError) {
      console.error('Error fetching updated wedding:', finalFetchError);
      return NextResponse.json(
        { error: 'Wedding updated but failed to fetch updated data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      wedding: updatedWedding
    });
  } catch (error) {
    console.error('Error updating wedding config:', error);
    return NextResponse.json(
      { error: 'Failed to update wedding configuration' },
      { status: 500 }
    );
  }
}