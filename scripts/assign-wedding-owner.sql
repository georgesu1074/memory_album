-- Assign ownership of a wedding to a user
-- Replace the email and slug with actual values

-- First, get the user ID and wedding ID
WITH user_info AS (
  SELECT id FROM users WHERE email = 'georgesu1074@gmail.com'
),
wedding_info AS (
  SELECT id FROM weddings WHERE slug = 'helen-and-george'
)
-- Insert ownership record
INSERT INTO wedding_owners (wedding_id, user_id, granted_by)
SELECT 
  wedding_info.id,
  user_info.id,
  user_info.id  -- Self-granted for initial setup
FROM user_info, wedding_info
ON CONFLICT (wedding_id, user_id) DO NOTHING;

-- Verify the ownership was created
SELECT 
  w.slug,
  u.email,
  wo.created_at
FROM wedding_owners wo
JOIN weddings w ON w.id = wo.wedding_id
JOIN users u ON u.id = wo.user_id
WHERE w.slug = 'helen-and-george';