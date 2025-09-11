-- Create function to atomically increment category memory count
CREATE OR REPLACE FUNCTION increment_category_count(category_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE categories
  SET 
    memory_count = memory_count + 1,
    updated_at = NOW()
  WHERE id = category_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to recount memories in a category (for fixing inconsistencies)
CREATE OR REPLACE FUNCTION recalculate_category_count(category_id UUID)
RETURNS void AS $$
DECLARE
  count_val INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_val
  FROM memories
  WHERE category_id = recalculate_category_count.category_id
    AND status = 'completed';
  
  UPDATE categories
  SET 
    memory_count = count_val,
    updated_at = NOW()
  WHERE id = recalculate_category_count.category_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to recalculate all category counts for a wedding
CREATE OR REPLACE FUNCTION recalculate_all_category_counts(wedding_id UUID)
RETURNS void AS $$
DECLARE
  cat RECORD;
BEGIN
  FOR cat IN 
    SELECT id FROM categories WHERE wedding_id = recalculate_all_category_counts.wedding_id
  LOOP
    PERFORM recalculate_category_count(cat.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql;