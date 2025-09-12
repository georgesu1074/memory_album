-- Setup Admin Users
-- Run this manually after deployment to grant admin access
-- This is NOT a migration - it's a manual setup script

-- Add your admin users here
UPDATE users SET is_admin = true WHERE email IN (
  'georgesu1074@gmail.com'
  -- Add more admin emails as needed
);

-- Verify admin users
SELECT email, is_admin FROM users WHERE is_admin = true;