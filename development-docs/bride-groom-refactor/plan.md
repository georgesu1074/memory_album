# Bride & Groom Refactor Plan

## Overview
Refactor the weddings table to create separate detail tables for bride and groom, enabling individual dashboards, privacy settings, and extensive customization options.

## Current State Analysis

### Existing Structure
- **weddings table**: Has a single `couple_names` VARCHAR(200) field (e.g., "Alex & Jordan")
- **Memory categorization**: Already uses `memory_type` enum ('bride', 'groom', 'both')
- **UI Components**: Display tabs for Bride/Groom/Together memories
- **AI Processing**: Parses couple names to identify bride and groom

### Current Usage
1. `couple_names` is displayed on the wedding page header
2. Memory submission modal has hardcoded "Bride" and "Groom" labels
3. Categories are filtered by memory_type
4. No current personalization based on individual preferences
5. No privacy controls per person
6. No individual dashboards or admin areas

## Chosen Architecture: Separate Detail Tables

Create dedicated tables for bride and groom details to support future dashboard and privacy features:

```sql
CREATE TABLE groom_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),  -- Nickname or preferred display
  email VARCHAR(255) UNIQUE,  -- For future dashboard login
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE bride_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),  -- Nickname or preferred display  
  email VARCHAR(255) UNIQUE,  -- For future dashboard login
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for performance
CREATE INDEX idx_groom_details_wedding_id ON groom_details(wedding_id);
CREATE INDEX idx_groom_details_email ON groom_details(email);
CREATE INDEX idx_bride_details_wedding_id ON bride_details(wedding_id);
CREATE INDEX idx_bride_details_email ON bride_details(email);

-- Update weddings table to reference detail tables
ALTER TABLE weddings 
  ADD COLUMN groom_id UUID REFERENCES groom_details(id),
  ADD COLUMN bride_id UUID REFERENCES bride_details(id);
```

**Benefits of This Simplified Approach:**
- **Clean Start**: Only essential columns, add features as needed
- **Dashboard Ready**: Email field enables future authentication
- **Flexible Names**: display_name allows personalization without changing core data
- **Future-proof**: Can add columns as features are built
- **Performance**: Minimal data with proper indexing
- **Maintainable**: Simple schema is easier to understand and work with

## Implementation Strategy

### Phase 1: Database Setup
1. Create bride_details and groom_details tables
2. Add foreign key references in weddings table
3. Migrate existing couple_names data to new structure
4. Set up Row Level Security (RLS) policies

### Phase 2: API Layer
1. Create endpoints for managing bride/groom details
2. Update wedding creation to create detail records
3. Add authentication endpoints for dashboard access
4. Implement privacy setting checks in queries

### Phase 3: UI Updates
1. Update wedding page to use detail tables
2. Personalize all labels with actual names
3. Apply individual theme colors where appropriate
4. Add profile sections if data exists

### Phase 4: Dashboard Features
1. Create login system for bride/groom
2. Build dashboard UI for each person
3. Implement privacy controls
4. Add memory moderation features

## Migration Script

```sql
-- Step 1: Create detail tables
CREATE TABLE groom_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE bride_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 2: Add indexes
CREATE INDEX idx_groom_details_wedding_id ON groom_details(wedding_id);
CREATE INDEX idx_groom_details_email ON groom_details(email);
CREATE INDEX idx_bride_details_wedding_id ON bride_details(wedding_id);
CREATE INDEX idx_bride_details_email ON bride_details(email);

-- Step 3: Add references to weddings table
ALTER TABLE weddings 
  ADD COLUMN groom_id UUID REFERENCES groom_details(id),
  ADD COLUMN bride_id UUID REFERENCES bride_details(id);

-- Step 4: Migrate existing data
DO $$
DECLARE
  wedding_record RECORD;
  groom_name_parsed VARCHAR(100);
  bride_name_parsed VARCHAR(100);
  new_groom_id UUID;
  new_bride_id UUID;
BEGIN
  FOR wedding_record IN SELECT id, couple_names FROM weddings LOOP
    -- Parse names (handle '&' and 'and' separators)
    IF wedding_record.couple_names LIKE '%&%' THEN
      groom_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, '&', 1));
      bride_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, '&', 2));
    ELSIF wedding_record.couple_names LIKE '% and %' THEN
      groom_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, ' and ', 1));
      bride_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, ' and ', 2));
    ELSE
      -- Fallback: assume space-separated
      groom_name_parsed := SPLIT_PART(wedding_record.couple_names, ' ', 1);
      bride_name_parsed := SPLIT_PART(wedding_record.couple_names, ' ', -1);
    END IF;
    
    -- Create groom details
    INSERT INTO groom_details (wedding_id, name, display_name)
    VALUES (wedding_record.id, groom_name_parsed, groom_name_parsed)
    RETURNING id INTO new_groom_id;
    
    -- Create bride details
    INSERT INTO bride_details (wedding_id, name, display_name)
    VALUES (wedding_record.id, bride_name_parsed, bride_name_parsed)
    RETURNING id INTO new_bride_id;
    
    -- Update wedding with references
    UPDATE weddings 
    SET groom_id = new_groom_id, bride_id = new_bride_id
    WHERE id = wedding_record.id;
  END LOOP;
END $$;

-- Step 5: Add update triggers
CREATE TRIGGER update_groom_details_updated_at BEFORE UPDATE ON groom_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bride_details_updated_at BEFORE UPDATE ON bride_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Set up RLS policies
ALTER TABLE groom_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE bride_details ENABLE ROW LEVEL SECURITY;

-- Public can view details for active weddings
CREATE POLICY "Public can view groom details" ON groom_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.groom_id = groom_details.id
      AND weddings.is_active = true
    )
  );

CREATE POLICY "Public can view bride details" ON bride_details
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.bride_id = bride_details.id
      AND weddings.is_active = true
    )
  );

-- Service role and authenticated users can manage
CREATE POLICY "Service role manages groom details" ON groom_details
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages bride details" ON bride_details
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Individuals can update their own details (future enhancement)
-- This will be activated when authentication is implemented
-- CREATE POLICY "Groom can update own details" ON groom_details
--   FOR UPDATE USING (auth.jwt() ->> 'email' = email);
-- CREATE POLICY "Bride can update own details" ON bride_details
--   FOR UPDATE USING (auth.jwt() ->> 'email' = email);
```

## TypeScript Interface Design

```typescript
// Simplified Types - Add fields as features are built
interface GroomDetails {
  id: string;
  wedding_id: string;
  name: string;
  display_name?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

interface BrideDetails {
  id: string;
  wedding_id: string;
  name: string;
  display_name?: string | null;
  email?: string | null;
  created_at: string;
  updated_at: string;
}

// Updated Wedding Interface
interface Wedding {
  id: string;
  slug: string;
  groom_id?: string;
  bride_id?: string;
  groom?: GroomDetails;
  bride?: BrideDetails;
  wedding_date?: string;
  theme_color: string;
  is_active: boolean;
  // Computed property for backward compatibility
  get couple_names(): string {
    const groomName = this.groom?.display_name || this.groom?.name || 'Groom';
    const brideName = this.bride?.display_name || this.bride?.name || 'Bride';
    return `${groomName} & ${brideName}`;
  }
}
```

## Dashboard Features Specification

### Bride/Groom Individual Dashboards

Each person gets their own dashboard accessible via:
- `/dashboard/groom/{wedding_slug}` 
- `/dashboard/bride/{wedding_slug}`

**Dashboard Sections:**

1. **Overview**
   - Memory count statistics
   - Recent submissions
   - Pending moderation (if enabled)
   - Quick actions

2. **Profile Management**
   - Edit display name, bio, photo
   - Theme color customization
   - Contact information

3. **Privacy Controls**
   - Toggle profile visibility
   - Control memory submissions
   - Enable/disable moderation
   - Set viewing permissions

4. **Memory Management**
   - View all memories about them
   - Moderate pending memories
   - Hide/show specific memories
   - Export memories

5. **Notifications**
   - Configure email preferences
   - View notification history
   - Set digest frequency

### Authentication Flow

1. **Initial Setup**: During wedding creation, bride/groom emails are captured
2. **Magic Link Login**: Email-based authentication (no passwords)
3. **Session Management**: JWT tokens with refresh capability
4. **Role-Based Access**: Separate permissions for bride/groom vs guests

## UI Customization Opportunities

With detail tables, we enable:

1. **Personalized Headers**: 
   - Use display_name if set, otherwise name
   - Individual profile photos in header

2. **Dynamic Tab Labels**: 
   - "Bride" → Actual bride's name
   - "Groom" → Actual groom's name
   - Custom colors per tab

3. **Themed Sections**: 
   - Apply individual theme_colors throughout UI
   - Gradient backgrounds using both colors
   - Personalized memory cards

4. **Profile Cards**:
   - Display bio and photo on wedding page
   - Show/hide based on privacy settings
   - Link to individual galleries

5. **Privacy-Aware Display**:
   - Respect show_profile settings
   - Hide memories if show_memories is false
   - Show submission form only if allow_submissions is true

## Considerations & Decisions

### Cultural Sensitivity
- Current implementation assumes traditional "bride/groom" structure
- Consider future support for:
  - Same-sex marriages (Partner 1/Partner 2)
  - Non-binary individuals
  - Cultural variations in naming conventions
- Potential solution: Make labels configurable per wedding

### Backward Compatibility
- Keep couple_names as a computed field initially
- Gradual migration to avoid breaking changes
- Test thoroughly with existing data

### Performance Impact
- Simple column split: No performance impact
- Detail tables: Minimal impact with proper indexing
- Consider caching strategies for frequently accessed data

## Risk Assessment

### Low Risk
- Database migration (reversible)
- TypeScript type updates
- API endpoint modifications

### Medium Risk
- Data migration accuracy (names with special characters)
- UI component updates (multiple files)
- Testing all affected flows

### Mitigation Strategies
1. Test migration script on sample data first
2. Keep old column temporarily for rollback
3. Deploy in stages (database → API → UI)
4. Have manual correction process for edge cases

## Success Criteria

1. All existing weddings have names properly split
2. New weddings can be created with individual names
3. UI displays personalized names throughout the app
4. Memory submission uses actual names instead of "Bride/Groom"
5. No breaking changes to existing functionality
6. Performance remains unchanged or improves

## Future Enhancements

Once basic refactor is complete:
1. Individual profile pages
2. Separate theme customization
3. Personal memory counters
4. Individual photo galleries
5. Separate invitation links
6. Personal preference settings
7. Individual timeline views