-- Create table for storing Google Drive OAuth tokens
CREATE TABLE IF NOT EXISTS wedding_google_drive (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
    google_email TEXT NOT NULL,
    google_name TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMPTZ NOT NULL,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    connected_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    folder_id TEXT,
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(wedding_id)
);

-- Create indexes
CREATE INDEX idx_wedding_google_drive_wedding_id ON wedding_google_drive(wedding_id);
CREATE INDEX idx_wedding_google_drive_active ON wedding_google_drive(is_active);

-- Enable RLS
ALTER TABLE wedding_google_drive ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Users can manage their wedding's Google Drive connection" 
ON wedding_google_drive
FOR ALL 
USING (true);  -- We'll handle auth in the API for now

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_wedding_google_drive_updated_at
    BEFORE UPDATE ON wedding_google_drive
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();