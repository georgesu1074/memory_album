import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

interface GuestData {
  full_name: string;
  email?: string;
  phone?: string;
  table_number?: string;
  party_name?: string;
  party_size?: number;
  rsvp_status?: string;
  dietary_restrictions?: string;
  notes?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
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

    // Parse the CSV data from request body
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const csvText = await file.text();
    const guests = parseCSV(csvText);

    if (guests.length === 0) {
      return NextResponse.json(
        { error: 'No valid guest data found in CSV' },
        { status: 400 }
      );
    }

    // Prepare guest records with wedding_id
    const guestRecords = guests.map(guest => ({
      ...guest,
      wedding_id: wedding.id,
    }));

    // Insert guests in batches to avoid timeout
    const batchSize = 50;
    const results = {
      imported: 0,
      failed: 0,
      duplicates: 0,
      errors: [] as string[],
    };

    for (let i = 0; i < guestRecords.length; i += batchSize) {
      const batch = guestRecords.slice(i, i + batchSize);
      
      // Check for existing guests by name and wedding_id
      const existingNames = batch.map(g => g.full_name);
      const { data: existingGuests } = await supabaseAdmin
        .from('wedding_guests')
        .select('full_name')
        .eq('wedding_id', wedding.id)
        .in('full_name', existingNames);

      const existingNameSet = new Set(existingGuests?.map(g => g.full_name) || []);
      const newGuests = batch.filter(g => !existingNameSet.has(g.full_name));
      const duplicateCount = batch.length - newGuests.length;

      if (newGuests.length > 0) {
        const { data, error } = await supabaseAdmin
          .from('wedding_guests')
          .insert(newGuests)
          .select();

        if (error) {
          results.failed += newGuests.length;
          results.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
        } else {
          results.imported += data?.length || 0;
        }
      }

      results.duplicates += duplicateCount;
    }

    return NextResponse.json({
      success: true,
      summary: {
        total: guests.length,
        imported: results.imported,
        duplicates: results.duplicates,
        failed: results.failed,
        errors: results.errors,
      }
    });
  } catch (error) {
    console.error('Error importing guests:', error);
    return NextResponse.json(
      { error: 'Failed to import guests' },
      { status: 500 }
    );
  }
}

function parseCSV(csvText: string): GuestData[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header to determine column mapping
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Map common header variations to our schema
  const headerMap: Record<string, string> = {
    'name': 'full_name',
    'full name': 'full_name',
    'guest name': 'full_name',
    'guest': 'full_name',
    'email': 'email',
    'email address': 'email',
    'phone': 'phone',
    'phone number': 'phone',
    'table': 'table_number',
    'table number': 'table_number',
    'table #': 'table_number',
    'party': 'party_name',
    'party name': 'party_name',
    'group': 'party_name',
    'party size': 'party_size',
    'group size': 'party_size',
    'rsvp': 'rsvp_status',
    'rsvp status': 'rsvp_status',
    'attending': 'rsvp_status',
    'dietary': 'dietary_restrictions',
    'dietary restrictions': 'dietary_restrictions',
    'allergies': 'dietary_restrictions',
    'notes': 'notes',
    'comments': 'notes',
  };

  // Create column index mapping
  const columnMap: Record<number, string> = {};
  headers.forEach((header, index) => {
    const mappedField = headerMap[header];
    if (mappedField) {
      columnMap[index] = mappedField;
    }
  });

  // Parse data rows
  const guests: GuestData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles basic quoted values)
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));

    const guest: any = {};
    let hasName = false;

    cleanValues.forEach((value, index) => {
      const field = columnMap[index];
      if (field && value) {
        if (field === 'full_name') {
          hasName = true;
          guest[field] = value;
        } else if (field === 'party_size') {
          guest[field] = parseInt(value) || 1;
        } else {
          guest[field] = value;
        }
      }
    });

    // Only add guest if they have at least a name
    if (hasName) {
      guests.push(guest as GuestData);
    }
  }

  return guests;
}