-- Add additional configuration fields to weddings table
ALTER TABLE weddings 
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7),
ADD COLUMN IF NOT EXISTS font_family VARCHAR(100),
ADD COLUMN IF NOT EXISTS background_style VARCHAR(20) CHECK (background_style IN ('solid', 'gradient', 'pattern'));

-- Create guests table for guest list management
CREATE TABLE IF NOT EXISTS guests (
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

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_guests_wedding_id ON guests(wedding_id);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);

-- Add update trigger for guests
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for guests table
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can view guests for active weddings
CREATE POLICY "Public can view wedding guests" ON guests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM weddings
      WHERE weddings.id = guests.wedding_id
      AND weddings.is_active = true
    )
  );

-- RLS Policy: Service role can manage all guests
CREATE POLICY "Service role manages guests" ON guests
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE guests IS 'Guest list for weddings, supporting import from various sources';
COMMENT ON COLUMN guests.side IS 'Which side of the wedding party the guest belongs to';
COMMENT ON COLUMN guests.imported_from IS 'Source of the guest data (zola, manual, csv, etc.)';