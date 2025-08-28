-- Add bride and groom detail tables for individual dashboards and customization

-- Step 1: Create groom_details table
CREATE TABLE IF NOT EXISTS groom_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 2: Create bride_details table
CREATE TABLE IF NOT EXISTS bride_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Step 3: Add indexes for performance
CREATE INDEX idx_groom_details_wedding_id ON groom_details(wedding_id);
CREATE INDEX idx_groom_details_email ON groom_details(email);
CREATE INDEX idx_bride_details_wedding_id ON bride_details(wedding_id);
CREATE INDEX idx_bride_details_email ON bride_details(email);

-- Step 4: Add foreign key references to weddings table
ALTER TABLE weddings 
  ADD COLUMN IF NOT EXISTS groom_id UUID REFERENCES groom_details(id),
  ADD COLUMN IF NOT EXISTS bride_id UUID REFERENCES bride_details(id);

-- Step 5: Create indexes on wedding foreign keys
CREATE INDEX idx_weddings_groom_id ON weddings(groom_id);
CREATE INDEX idx_weddings_bride_id ON weddings(bride_id);

-- Step 6: Migrate existing data from couple_names
DO $$
DECLARE
  wedding_record RECORD;
  groom_name_parsed VARCHAR(100);
  bride_name_parsed VARCHAR(100);
  new_groom_id UUID;
  new_bride_id UUID;
BEGIN
  -- Only process weddings that don't have detail records yet
  FOR wedding_record IN 
    SELECT id, couple_names 
    FROM weddings 
    WHERE groom_id IS NULL 
      AND bride_id IS NULL 
      AND couple_names IS NOT NULL 
  LOOP
    -- Parse names (handle '&' and 'and' separators)
    IF wedding_record.couple_names LIKE '%&%' THEN
      groom_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, '&', 1));
      bride_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, '&', 2));
    ELSIF wedding_record.couple_names LIKE '% and %' THEN
      groom_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, ' and ', 1));
      bride_name_parsed := TRIM(SPLIT_PART(wedding_record.couple_names, ' and ', 2));
    ELSE
      -- Fallback: assume space-separated or use whole string
      groom_name_parsed := COALESCE(SPLIT_PART(wedding_record.couple_names, ' ', 1), 'Groom');
      bride_name_parsed := COALESCE(NULLIF(SPLIT_PART(wedding_record.couple_names, ' ', 2), ''), 'Bride');
    END IF;
    
    -- Ensure names are not empty
    groom_name_parsed := COALESCE(NULLIF(groom_name_parsed, ''), 'Groom');
    bride_name_parsed := COALESCE(NULLIF(bride_name_parsed, ''), 'Bride');
    
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
    SET groom_id = new_groom_id, 
        bride_id = new_bride_id,
        updated_at = NOW()
    WHERE id = wedding_record.id;
  END LOOP;
END $$;

-- Step 7: Add update triggers for timestamps
CREATE TRIGGER update_groom_details_updated_at 
  BEFORE UPDATE ON groom_details
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bride_details_updated_at 
  BEFORE UPDATE ON bride_details
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Set up Row Level Security (RLS)
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

-- Service role can manage all details
CREATE POLICY "Service role manages groom details" ON groom_details
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role manages bride details" ON bride_details
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Future: Allow individuals to update their own details when auth is implemented
-- CREATE POLICY "Groom can update own details" ON groom_details
--   FOR UPDATE USING (auth.uid()::text = email);
-- CREATE POLICY "Bride can update own details" ON bride_details  
--   FOR UPDATE USING (auth.uid()::text = email);

-- Note: The couple_names column is intentionally kept for backward compatibility
-- It can be removed in a future migration once all code is updated