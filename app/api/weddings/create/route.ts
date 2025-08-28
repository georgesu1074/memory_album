import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

interface CreateWeddingRequest {
  bride: {
    name: string;
    email?: string;
    display_name?: string;
  };
  groom: {
    name: string;
    email?: string;
    display_name?: string;
  };
  wedding_date?: string;
  slug?: string;
  theme_color: string;
}

function generateSlug(brideName: string, groomName: string): string {
  const firstName1 = brideName.split(' ')[0].toLowerCase();
  const firstName2 = groomName.split(' ')[0].toLowerCase();
  const timestamp = Date.now().toString(36);
  return `${firstName1}-and-${firstName2}-${timestamp}`;
}

function validateSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9-]{3,50}$/;
  const reservedSlugs = ['api', 'admin', 'weddings', 'dashboard', 'config'];
  
  if (!slugRegex.test(slug)) return false;
  if (reservedSlugs.includes(slug)) return false;
  
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as CreateWeddingRequest;

    // Validate required fields
    if (!body.bride?.name || !body.groom?.name || !body.theme_color) {
      return NextResponse.json(
        { error: 'Missing required fields: bride name, groom name, and theme color are required' },
        { status: 400 }
      );
    }

    // Generate or validate slug
    let weddingSlug = body.slug || generateSlug(body.bride.name, body.groom.name);
    
    if (body.slug && !validateSlug(body.slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only (3-50 characters)' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const { data: existingWedding } = await supabaseAdmin
      .from('weddings')
      .select('id')
      .eq('slug', weddingSlug)
      .single();

    if (existingWedding) {
      // If custom slug was provided and exists, return error
      if (body.slug) {
        return NextResponse.json(
          { error: 'This wedding URL is already taken' },
          { status: 409 }
        );
      }
      // If auto-generated slug exists, regenerate
      weddingSlug = generateSlug(body.bride.name, body.groom.name);
    }

    // Start a transaction by creating all records
    // First, create bride details
    const { data: brideDetails, error: brideError } = await supabaseAdmin
      .from('bride_details')
      .insert({
        name: body.bride.name,
        email: body.bride.email || null,
        display_name: body.bride.display_name || body.bride.name,
        wedding_id: null // Will be updated after wedding creation
      })
      .select()
      .single();

    if (brideError) {
      console.error('Error creating bride details:', brideError);
      return NextResponse.json(
        { error: 'Failed to create bride details' },
        { status: 500 }
      );
    }

    // Create groom details
    const { data: groomDetails, error: groomError } = await supabaseAdmin
      .from('groom_details')
      .insert({
        name: body.groom.name,
        email: body.groom.email || null,
        display_name: body.groom.display_name || body.groom.name,
        wedding_id: null // Will be updated after wedding creation
      })
      .select()
      .single();

    if (groomError) {
      console.error('Error creating groom details:', groomError);
      // Clean up bride details
      await supabaseAdmin
        .from('bride_details')
        .delete()
        .eq('id', brideDetails.id);
      
      return NextResponse.json(
        { error: 'Failed to create groom details' },
        { status: 500 }
      );
    }

    // Create wedding with references to bride and groom
    const { data: wedding, error: weddingError } = await supabaseAdmin
      .from('weddings')
      .insert({
        slug: weddingSlug,
        wedding_date: body.wedding_date || null,
        theme_color: body.theme_color,
        bride_id: brideDetails.id,
        groom_id: groomDetails.id,
        is_active: false // Start inactive until couple confirms setup
      })
      .select(`
        *,
        bride:bride_details!weddings_bride_id_fkey(*),
        groom:groom_details!weddings_groom_id_fkey(*)
      `)
      .single();

    if (weddingError) {
      console.error('Error creating wedding:', weddingError);
      // Clean up both detail records
      await supabaseAdmin
        .from('bride_details')
        .delete()
        .eq('id', brideDetails.id);
      await supabaseAdmin
        .from('groom_details')
        .delete()
        .eq('id', groomDetails.id);
      
      return NextResponse.json(
        { error: 'Failed to create wedding' },
        { status: 500 }
      );
    }

    // Update bride and groom details with wedding_id
    await Promise.all([
      supabaseAdmin
        .from('bride_details')
        .update({ wedding_id: wedding.id })
        .eq('id', brideDetails.id),
      supabaseAdmin
        .from('groom_details')
        .update({ wedding_id: wedding.id })
        .eq('id', groomDetails.id)
    ]);

    return NextResponse.json({
      success: true,
      wedding: {
        ...wedding,
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${weddingSlug}`
      }
    });
  } catch (error) {
    console.error('Error in wedding creation:', error);
    return NextResponse.json(
      { error: 'Failed to create wedding' },
      { status: 500 }
    );
  }
}