-- Cleanup script for Memory Album database
-- Use this to clear test data while preserving structure

-- 1. Clear all test memories and related data
DELETE FROM memories WHERE wedding_id = '16dd6f94-1cd7-4446-b748-367ca94a2c18';
DELETE FROM categories WHERE wedding_id = '16dd6f94-1cd7-4446-b748-367ca94a2c18';

-- 2. Reset category counts (in case of any orphaned categories)
UPDATE categories SET memory_count = 0 WHERE memory_count > 0;

-- 3. Recalculate all category counts for consistency
DO $$
DECLARE
  cat RECORD;
BEGIN
  FOR cat IN SELECT id, wedding_id FROM categories
  LOOP
    PERFORM recalculate_category_count(cat.id);
  END LOOP;
END $$;

-- 4. Verify cleanup
SELECT 'Cleanup complete!' as status;
SELECT 
  (SELECT COUNT(*) FROM memories WHERE wedding_id = '16dd6f94-1cd7-4446-b748-367ca94a2c18') as test_memories,
  (SELECT COUNT(*) FROM categories WHERE wedding_id = '16dd6f94-1cd7-4446-b748-367ca94a2c18') as test_categories,
  (SELECT COUNT(*) FROM memories) as total_memories,
  (SELECT COUNT(*) FROM categories) as total_categories;