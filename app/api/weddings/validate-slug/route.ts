import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = body;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]{3,50}$/;
    const reservedSlugs = ['api', 'admin', 'weddings', 'dashboard', 'config', 'create', 'login', 'signup'];
    
    if (!slugRegex.test(slug)) {
      return NextResponse.json({
        available: false,
        error: 'Invalid format. Use lowercase letters, numbers, and hyphens only (3-50 characters)',
        suggestions: []
      });
    }

    if (reservedSlugs.includes(slug)) {
      return NextResponse.json({
        available: false,
        error: 'This URL is reserved',
        suggestions: generateSlugSuggestions(slug)
      });
    }

    // Check if slug is already taken
    const { data: existingWedding } = await supabaseAdmin
      .from('weddings')
      .select('id')
      .eq('slug', slug)
      .single();

    if (existingWedding) {
      return NextResponse.json({
        available: false,
        error: 'This wedding URL is already taken',
        suggestions: generateSlugSuggestions(slug)
      });
    }

    return NextResponse.json({
      available: true,
      slug: slug
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
  const year = new Date().getFullYear();
  
  // Clean the base slug
  const cleanSlug = baseSlug.replace(/[^a-z0-9-]/g, '').substring(0, 30);
  
  // Add various suffixes
  suggestions.push(`${cleanSlug}-${timestamp}`);
  suggestions.push(`${cleanSlug}-${year}`);
  suggestions.push(`${cleanSlug}-wedding`);
  suggestions.push(`${cleanSlug}-celebration`);
  suggestions.push(`${cleanSlug}-memories`);
  
  // Return first 3 valid suggestions (checking length)
  return suggestions
    .filter(s => s.length <= 50)
    .slice(0, 3);
}