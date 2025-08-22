-- Enable Row Level Security on categories table
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view categories for any wedding
-- This allows guests to see all categories without authentication
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT
  USING (true);

-- Policy: Anyone can insert categories
-- Categories are created automatically by the API when memories are categorized
-- The API enforces the wedding_id constraint
CREATE POLICY "Anyone can insert categories" ON categories
  FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can update categories
-- The API needs to update category summaries and memory counts
CREATE POLICY "Anyone can update categories" ON categories
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Add comment explaining the RLS approach
COMMENT ON POLICY "Anyone can view categories" ON categories IS 
  'Public read access - guests can view all categories without authentication';
COMMENT ON POLICY "Anyone can insert categories" ON categories IS 
  'Public insert - API creates categories when processing memories';
COMMENT ON POLICY "Anyone can update categories" ON categories IS 
  'Public update - API updates summaries and counts when memories are added';