-- Update test wedding to use Alex and Jordan as couple names
UPDATE weddings 
SET couple_names = 'Alex and Jordan'
WHERE slug = 'test-wedding-2024';

-- Verify the update
SELECT id, slug, couple_names 
FROM weddings 
WHERE slug = 'test-wedding-2024';