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
    const parseResult = parseCSV(csvText);

    if (parseResult.guests.length === 0) {
      return NextResponse.json(
        { error: 'No attending guests found in CSV. All guests were either declined or had no valid names.' },
        { status: 400 }
      );
    }
    
    const guests = parseResult.guests;

    // Prepare guest records with wedding_id and split names
    const guestRecords = guests.map(guest => {
      // Split full_name into first and last for the database
      const nameParts = (guest.full_name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Remove full_name from the record since it's generated
      const { full_name, ...guestData } = guest;
      
      return {
        ...guestData,
        first_name: firstName,
        last_name: lastName,
        wedding_id: wedding.id,
      };
    });

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
      
      // Check for existing guests by first and last name combination
      const guestNames = batch.map(g => `${g.first_name} ${g.last_name}`.trim());
      const { data: existingGuests } = await supabaseAdmin
        .from('wedding_guests')
        .select('first_name, last_name')
        .eq('wedding_id', wedding.id);

      const existingNameSet = new Set(
        existingGuests?.map(g => `${g.first_name} ${g.last_name}`.trim()) || []
      );
      const newGuests = batch.filter(g => 
        !existingNameSet.has(`${g.first_name} ${g.last_name}`.trim())
      );
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
        total: parseResult.stats.total,
        attending: guests.length,
        declined: parseResult.stats.declined,
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

function parseCSV(csvText: string): { guests: GuestData[], stats: { total: number, declined: number, filtered: number } } {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return { guests: [], stats: { total: 0, declined: 0, filtered: 0 } };

  // Parse header to determine column mapping
  const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
  
  // Map common header variations to our schema
  const headerMap: Record<string, string> = {
    'name': 'full_name',
    'full name': 'full_name',
    'guest name': 'full_name',
    'guest': 'full_name',
    'first name': 'first_name',  // Zola format
    'last name': 'last_name',     // Zola format
    'title': 'title',             // Zola format
    'suffix': 'suffix',           // Zola format
    'wedding': 'rsvp_status',     // Zola format (Attending/Declined/No Response)
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

  // Check if we have Zola format (separate first/last name columns)
  const hasFirstNameCol = headers.includes('first name');
  const hasLastNameCol = headers.includes('last name');
  const isZolaFormat = hasFirstNameCol && hasLastNameCol;

  // Parse data rows
  const guests: GuestData[] = [];
  const stats = { total: 0, declined: 0, filtered: 0 };
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (handles basic quoted values)
    const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
    const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));

    const guest: any = {};
    let hasName = false;
    let firstName = '';
    let lastName = '';
    let title = '';
    let suffix = '';

    cleanValues.forEach((value, index) => {
      const field = columnMap[index];
      if (field && value) {
        if (field === 'full_name') {
          hasName = true;
          guest.full_name = value;
        } else if (field === 'first_name') {
          firstName = value;
        } else if (field === 'last_name') {
          lastName = value;
        } else if (field === 'title') {
          title = value;
        } else if (field === 'suffix') {
          suffix = value;
        } else if (field === 'party_size') {
          guest[field] = parseInt(value) || 1;
        } else {
          guest[field] = value;
        }
      }
    });

    // For Zola format, combine first and last names
    if (isZolaFormat && (firstName || lastName)) {
      const nameParts = [];
      if (title) nameParts.push(title);
      if (firstName) nameParts.push(firstName);
      if (lastName) nameParts.push(lastName);
      if (suffix) nameParts.push(suffix);
      
      const fullName = nameParts.join(' ').trim();
      if (fullName && fullName !== 'Guest') { // Skip generic "Guest" entries
        guest.full_name = fullName;
        hasName = true;
      }
    }

    // Count total valid names
    if (hasName && guest.full_name) {
      stats.total++;
      
      // Check RSVP status - only include guests who are attending
      // If rsvp_status exists and is "Declined" or "No Response", skip this guest
      if (guest.rsvp_status) {
        const status = guest.rsvp_status.toLowerCase().trim();
        if (status === 'declined' || status === 'no response' || status === 'not attending') {
          stats.declined++;
          continue; // Skip this guest
        }
        // If status is "Attending", keep them and clear the rsvp_status
        if (status === 'attending' || status === 'yes' || status === 'accepted') {
          delete guest.rsvp_status; // Don't store "Attending" in the database
        }
      }
      
      guests.push(guest as GuestData);
    } else {
      stats.filtered++; // Count guests with no valid name
    }
  }

  return { guests, stats };
}