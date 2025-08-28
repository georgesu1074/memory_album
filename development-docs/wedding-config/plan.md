# Wedding Configuration Implementation Plan

## Overview
Sprint 5 focuses on creating a comprehensive wedding configuration system that leverages the new bride/groom detail tables. This will enable couples to set up their memory collection page with personalized information, theme customization, and guest management.

## Architecture Decisions

### 1. Multi-Step Form Approach
- Use a wizard-style form for wedding setup
- Steps: Basic Info → Bride Details → Groom Details → Theme → Guests → Confirmation
- Persist form state in localStorage for recovery
- Server-side validation at each step

### 2. Slug Generation Strategy
```typescript
// Auto-generate from names
const generateSlug = (brideName: string, groomName: string) => {
  const firstName1 = brideName.split(' ')[0].toLowerCase();
  const firstName2 = groomName.split(' ')[0].toLowerCase();
  return `${firstName1}-and-${firstName2}-${Date.now().toString(36)}`;
};
```

### 3. Theme System
```typescript
interface WeddingTheme {
  primaryColor: string;     // Main theme color
  secondaryColor?: string;   // Optional accent color
  fontFamily?: string;       // Custom font choice
  backgroundStyle?: 'solid' | 'gradient' | 'pattern';
}
```

### 4. Guest List Schema
```typescript
interface Guest {
  id: string;
  wedding_id: string;
  name: string;
  email?: string;
  phone?: string;
  side: 'bride' | 'groom' | 'both';
  table_number?: string;
  rsvp_status?: 'pending' | 'yes' | 'no';
  imported_from?: 'zola' | 'manual' | 'csv';
}
```

## Component Structure

### Configuration Pages
```
/app/weddings/
├── create/
│   └── page.tsx              # Multi-step wedding creation
├── [slug]/
│   ├── config/
│   │   └── page.tsx          # Edit configuration
│   ├── guests/
│   │   └── page.tsx          # Guest management
│   └── preview/
│       └── page.tsx          # Preview before activation
```

### Components
```
/components/wedding-config/
├── WeddingSetupWizard.tsx    # Main multi-step form
├── BrideDetailsForm.tsx      # Bride information step
├── GroomDetailsForm.tsx      # Groom information step
├── ThemeSelector.tsx         # Color and style picker
├── SlugValidator.tsx         # Real-time slug validation
├── QRCodeGenerator.tsx       # QR code creation
├── GuestListUploader.tsx     # CSV import component
├── GuestTable.tsx            # Guest list display
└── SetupConfirmation.tsx     # Final confirmation view
```

## API Endpoints

### Wedding Configuration
```typescript
// POST /api/weddings/create
{
  bride: {
    name: string;
    email?: string;
    display_name?: string;
  },
  groom: {
    name: string;
    email?: string;
    display_name?: string;
  },
  wedding_date?: string;
  slug?: string;  // Optional, auto-generated if not provided
  theme_color: string;
}

// PATCH /api/weddings/[slug]/config
{
  wedding_date?: string;
  theme_color?: string;
  is_active?: boolean;
  bride?: Partial<BrideDetails>;
  groom?: Partial<GroomDetails>;
}

// POST /api/weddings/[slug]/validate-slug
{
  slug: string;
}
// Returns: { available: boolean, suggestions?: string[] }
```

### Guest Management
```typescript
// POST /api/weddings/[slug]/guests/import
FormData with CSV file

// GET /api/weddings/[slug]/guests
Query params: ?search=john&side=bride&limit=50&offset=0

// POST /api/weddings/[slug]/guests
{
  name: string;
  email?: string;
  side: 'bride' | 'groom' | 'both';
}
```

## Database Updates

### New Tables Needed
```sql
-- Guests table (if not already created)
CREATE TABLE guests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  side VARCHAR(10) CHECK (side IN ('bride', 'groom', 'both')),
  table_number VARCHAR(20),
  rsvp_status VARCHAR(10) CHECK (rsvp_status IN ('pending', 'yes', 'no')),
  imported_from VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX idx_guests_wedding_id ON guests(wedding_id);
CREATE INDEX idx_guests_name ON guests(name);
CREATE INDEX idx_guests_email ON guests(email);
```

### Updates to Existing Tables
```sql
-- Add theme configuration to weddings
ALTER TABLE weddings 
ADD COLUMN secondary_color VARCHAR(7),
ADD COLUMN font_family VARCHAR(100),
ADD COLUMN background_style VARCHAR(20);
```

## UI/UX Flow

### Wedding Creation Flow
1. **Welcome Screen**
   - Explain the process
   - Show example wedding page
   - Start button

2. **Basic Information**
   - Bride name & email
   - Groom name & email  
   - Wedding date
   - Auto-generated slug preview

3. **Theme Selection**
   - Color picker or preset themes
   - Preview of theme application
   - Font selection (optional)

4. **Guest List** (Optional)
   - Upload CSV or skip
   - Show import preview
   - Manual add option

5. **Review & Confirm**
   - Show all details
   - Generate QR code
   - Activation toggle
   - Create wedding button

### Guest Import Flow
1. Upload CSV file
2. Preview parsed data with column mapping
3. Confirm or adjust mappings
4. Import with progress bar
5. Show results summary
6. Option to fix errors

## Zola CSV Format Support

Expected format:
```csv
Name,Email,Party,Table
"John Doe","john@email.com","Bride",5
"Jane Smith","jane@email.com","Groom",3
```

Mapping:
- Name → guests.name
- Email → guests.email  
- Party → guests.side (map "Bride"→"bride", "Groom"→"groom")
- Table → guests.table_number

## Mobile Considerations

### Touch-Optimized Forms
- Large touch targets (min 44px)
- Clear visual feedback
- Auto-advance on completion
- Persistent bottom CTAs

### Progressive Disclosure
- Show only essential fields first
- Optional fields in expandable sections
- Clear step indicators
- Back navigation always available

## Security & Validation

### Slug Validation Rules
- Lowercase letters, numbers, hyphens only
- 3-50 characters length
- Must be unique
- Cannot be reserved words (api, admin, etc.)

### Email Validation
- Valid email format
- Optional but recommended
- Used for future dashboard access
- Not publicly displayed

### File Upload Security
- Max file size: 5MB
- Accepted formats: .csv, .xlsx
- Virus scanning if available
- Sanitize all input data

## Error Handling

### Common Error Cases
1. Duplicate slug → Suggest alternatives
2. Invalid CSV format → Show parsing guide
3. Large guest list → Process in batches
4. Network errors → Retry with exponential backoff

### User-Friendly Messages
- "This wedding URL is already taken. Try: [suggestions]"
- "We couldn't read your guest list. Please check the format."
- "Large guest list detected. This might take a moment..."

## Testing Checklist

- [ ] Create wedding with various name formats
- [ ] Test slug generation and validation
- [ ] Upload guest lists of different sizes
- [ ] Test theme color application
- [ ] Verify QR code generation
- [ ] Test on mobile devices
- [ ] Check form validation
- [ ] Test error scenarios
- [ ] Verify data persistence
- [ ] Check accessibility

## Success Metrics

- Wedding creation completed in < 5 minutes
- 90% successful guest imports on first try
- QR codes scan correctly on all devices
- Theme colors apply consistently
- Zero data loss during setup
- Mobile completion rate > 80%