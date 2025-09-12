-- Create users table that extends Supabase auth
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wedding_owners table for multi-owner support
CREATE TABLE IF NOT EXISTS wedding_owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wedding_id, user_id)
);

-- Add created_by to weddings table
ALTER TABLE weddings 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wedding_owners_wedding_id ON wedding_owners(wedding_id);
CREATE INDEX IF NOT EXISTS idx_wedding_owners_user_id ON wedding_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_owners ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM users WHERE id = auth.uid()));

-- RLS Policies for wedding_owners table
CREATE POLICY "Users can view weddings they own" 
  ON wedding_owners FOR SELECT 
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Owners can manage co-owners" 
  ON wedding_owners FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM wedding_owners 
      WHERE wedding_id = wedding_owners.wedding_id 
      AND user_id = auth.uid()
    )
    OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Owners can remove co-owners" 
  ON wedding_owners FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM wedding_owners wo 
      WHERE wo.wedding_id = wedding_owners.wedding_id 
      AND wo.user_id = auth.uid()
    )
    OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Update RLS for weddings table to check ownership
CREATE POLICY "Owners can manage their weddings" 
  ON weddings FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM wedding_owners 
      WHERE wedding_id = weddings.id 
      AND user_id = auth.uid()
    )
    OR 
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Function to automatically add creator as owner
CREATE OR REPLACE FUNCTION add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_by IS NOT NULL THEN
    INSERT INTO wedding_owners (wedding_id, user_id, granted_by)
    VALUES (NEW.id, NEW.created_by, NEW.created_by)
    ON CONFLICT (wedding_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as owner
CREATE TRIGGER add_wedding_creator_as_owner
  AFTER INSERT ON weddings
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_owner();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();