-- Add memory_type field to categories table to track if category belongs to bride, groom, or both
ALTER TABLE categories 
ADD COLUMN memory_type text CHECK (memory_type IN ('bride', 'groom', 'both'));

-- Create index for better query performance
CREATE INDEX idx_categories_memory_type ON categories(wedding_id, memory_type);

-- Update existing categories based on their memories
UPDATE categories c
SET memory_type = (
  CASE 
    -- If any memory is 'both' or there are both bride and groom memories, category is 'both'
    WHEN EXISTS (
      SELECT 1 FROM memories m 
      WHERE m.category_id = c.id 
      AND m.memory_type = 'both'
    ) OR (
      EXISTS (
        SELECT 1 FROM memories m 
        WHERE m.category_id = c.id 
        AND m.memory_type = 'bride'
      ) AND EXISTS (
        SELECT 1 FROM memories m 
        WHERE m.category_id = c.id 
        AND m.memory_type = 'groom'
      )
    ) THEN 'both'
    -- If all memories are 'bride'
    WHEN EXISTS (
      SELECT 1 FROM memories m 
      WHERE m.category_id = c.id
    ) AND NOT EXISTS (
      SELECT 1 FROM memories m 
      WHERE m.category_id = c.id 
      AND (m.memory_type != 'bride' OR m.memory_type IS NULL)
    ) THEN 'bride'
    -- If all memories are 'groom'
    WHEN EXISTS (
      SELECT 1 FROM memories m 
      WHERE m.category_id = c.id
    ) AND NOT EXISTS (
      SELECT 1 FROM memories m 
      WHERE m.category_id = c.id 
      AND (m.memory_type != 'groom' OR m.memory_type IS NULL)
    ) THEN 'groom'
    -- Default to 'both' if no memories or mixed/unclear
    ELSE 'both'
  END
)
WHERE c.memory_type IS NULL;

-- Create a function to automatically update category memory_type when memories change
CREATE OR REPLACE FUNCTION update_category_memory_type()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the category's memory_type based on all its memories
  UPDATE categories
  SET memory_type = (
    SELECT 
      CASE 
        -- If any memory is 'both' or there are both bride and groom memories, category is 'both'
        WHEN bool_or(m.memory_type = 'both') OR 
             (bool_or(m.memory_type = 'bride') AND bool_or(m.memory_type = 'groom')) 
        THEN 'both'
        -- If all memories are 'bride'
        WHEN bool_and(m.memory_type = 'bride') THEN 'bride'
        -- If all memories are 'groom'
        WHEN bool_and(m.memory_type = 'groom') THEN 'groom'
        -- Default to 'both' if unclear
        ELSE 'both'
      END
    FROM memories m
    WHERE m.category_id = COALESCE(NEW.category_id, OLD.category_id)
  ),
  updated_at = NOW()
  WHERE id = COALESCE(NEW.category_id, OLD.category_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update category memory_type when memories are inserted, updated, or deleted
DROP TRIGGER IF EXISTS update_category_on_memory_change ON memories;
CREATE TRIGGER update_category_on_memory_change
AFTER INSERT OR UPDATE OF memory_type, category_id OR DELETE ON memories
FOR EACH ROW
EXECUTE FUNCTION update_category_memory_type();