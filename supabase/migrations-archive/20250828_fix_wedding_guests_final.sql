-- Delete the old confusing migration file first
-- Then run this single migration

-- Add missing columns to wedding_guests table
ALTER TABLE wedding_guests 
ADD COLUMN IF NOT EXISTS phone VARCHAR,
ADD COLUMN IF NOT EXISTS table_number VARCHAR,
ADD COLUMN IF NOT EXISTS party_name VARCHAR,
ADD COLUMN IF NOT EXISTS party_size INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS rsvp_status VARCHAR,
ADD COLUMN IF NOT EXISTS dietary_restrictions TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Make first_name and last_name nullable with defaults
ALTER TABLE wedding_guests 
ALTER COLUMN first_name DROP NOT NULL,
ALTER COLUMN last_name DROP NOT NULL,
ALTER COLUMN first_name SET DEFAULT '',
ALTER COLUMN last_name SET DEFAULT '';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wedding_guests_wedding_id ON wedding_guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_guests_rsvp ON wedding_guests(rsvp_status);