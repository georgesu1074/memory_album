import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body = await request.json();
    const { slug: newSlug } = body;
    const { slug: currentSlug } = await params;
    const supabaseAdmin = createAdminClient();

    if (!newSlug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    const reservedSlugs = ['api', 'admin', 'weddings', 'dashboard', 'config', 'create', 'login', 'signup'];
    
    if (!slugRegex.test(newSlug)) {
      return NextResponse.json({
        available: false,
        error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only (3-50 characters)',
        suggestions: []
      });
    }

    if (reservedSlugs.includes(newSlug)) {
      return NextResponse.json({
        available: false,
        error: 'This URL is reserved',
        suggestions: generateSlugSuggestions(newSlug)
      });
    }

    // Check if slug is already taken (excluding current wedding if updating)
    const query = supabaseAdmin
      .from('weddings')
      .select('id, slug')
      .eq('slug', newSlug);

    // If updating an existing wedding, exclude it from the check
    if (currentSlug !== 'new') {
      const { data: currentWedding } = await supabaseAdmin
        .from('weddings')
        .select('id')
        .eq('slug', currentSlug)
        .single();

      if (currentWedding) {
        query.neq('id', currentWedding.id);
      }
    }

    const { data: existingWedding } = await query.single();

    if (existingWedding) {
      return NextResponse.json({
        available: false,
        error: 'This wedding URL is already taken',
        suggestions: generateSlugSuggestions(newSlug)
      });
    }

    return NextResponse.json({
      available: true,
      slug: newSlug
    });
  } catch (error) {
    console.error('Error validating slug:', error);
    return NextResponse.json(
      { error: 'Failed to validate slug' },
      { status: 500 }
    );
  }
}

function generateSlugSuggestions(baseSlug: string): string[] {
  const suggestions: string[] = [];
  const timestamp = Date.now().toString(36);
  
  // Clean the base slug
  const cleanSlug = baseSlug.replace(/[^a-z0-9-]/g, '');
  
  // Add various suffixes
  suggestions.push(`${cleanSlug}-${timestamp}`);
  suggestions.push(`${cleanSlug}-wedding`);
  suggestions.push(`${cleanSlug}-${new Date().getFullYear()}`);
  suggestions.push(`${cleanSlug}-celebration`);
  suggestions.push(`${cleanSlug}-memories`);
  
  // Return first 3 suggestions
  return suggestions.slice(0, 3);
}