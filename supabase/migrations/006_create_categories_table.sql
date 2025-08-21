-- Create categories table to properly track event categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  summary TEXT,
  memory_count INTEGER DEFAULT 0,
  keywords TEXT[], -- Array of keywords from all memories
  theme VARCHAR(100), -- Theme like 'heartwarming', 'humorous', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique category names per wedding
  UNIQUE(wedding_id, name)
);

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_categories_wedding_id ON categories(wedding_id);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);

-- Add category_id to memories table
ALTER TABLE memories 
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Create index for category lookups
CREATE INDEX IF NOT EXISTS idx_memories_category_id ON memories(category_id);

-- Add trigger to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at 
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment for documentation
COMMENT ON TABLE categories IS 'Event-based categories for grouping related memories';
COMMENT ON COLUMN categories.summary IS 'AI-generated summary combining all memories in this category';
COMMENT ON COLUMN categories.memory_count IS 'Cached count of memories in this category';