-- Drop couple_names column from weddings table
-- Now using groom_details and bride_details tables exclusively

-- Ensure all weddings have bride and groom details before dropping the column
DO $$
DECLARE
  wedding_without_details INTEGER;
BEGIN
  SELECT COUNT(*) INTO wedding_without_details 
  FROM weddings 
  WHERE groom_id IS NULL OR bride_id IS NULL;
  
  IF wedding_without_details > 0 THEN
    RAISE WARNING 'Found % weddings without bride/groom details. Creating default details...', wedding_without_details;
    
    -- Create default details for any weddings missing them
    INSERT INTO groom_details (wedding_id, name, display_name)
    SELECT id, 'Groom', 'Groom' 
    FROM weddings 
    WHERE groom_id IS NULL;
    
    INSERT INTO bride_details (wedding_id, name, display_name)  
    SELECT id, 'Bride', 'Bride'
    FROM weddings
    WHERE bride_id IS NULL;
    
    -- Update weddings with the new detail IDs
    UPDATE weddings w
    SET groom_id = gd.id
    FROM groom_details gd  
    WHERE w.id = gd.wedding_id AND w.groom_id IS NULL;
    
    UPDATE weddings w
    SET bride_id = bd.id
    FROM bride_details bd
    WHERE w.id = bd.wedding_id AND w.bride_id IS NULL;
  END IF;
END $$;

-- Now safe to drop the column
ALTER TABLE weddings DROP COLUMN IF EXISTS couple_names;

-- Make detail references required going forward (optional, but recommended)
-- ALTER TABLE weddings ALTER COLUMN groom_id SET NOT NULL;
-- ALTER TABLE weddings ALTER COLUMN bride_id SET NOT NULL;