-- Seed script for Memory Album database
-- Creates test wedding and guests for development

-- 1. Create test wedding
INSERT INTO weddings (
  id,
  slug,
  couple_names,
  wedding_date,
  theme_color,
  is_active
) VALUES (
  '16dd6f94-1cd7-4446-b748-367ca94a2c18',
  'test-wedding-2024',
  'Alex and Jordan',
  '2024-12-31',
  '#rose-gold',
  true
) ON CONFLICT (id) DO NOTHING;

-- 2. Add test guests
INSERT INTO wedding_guests (wedding_id, first_name, last_name, email) VALUES
  ('16dd6f94-1cd7-4446-b748-367ca94a2c18', 'John', 'Smith', 'john@example.com'),
  ('16dd6f94-1cd7-4446-b748-367ca94a2c18', 'Sarah', 'Jones', 'sarah@example.com'),
  ('16dd6f94-1cd7-4446-b748-367ca94a2c18', 'Mike', 'Wilson', 'mike@example.com'),
  ('16dd6f94-1cd7-4446-b748-367ca94a2c18', 'Alex', 'Chen', 'alex@example.com'),
  ('16dd6f94-1cd7-4446-b748-367ca94a2c18', 'Emma', 'Davis', 'emma@example.com'),
  ('16dd6f94-1cd7-4446-b748-367ca94a2c18', 'James', 'Brown', 'james@example.com')
ON CONFLICT (wedding_id, email) DO NOTHING;

-- 3. Verify
SELECT 'Seed data loaded!' as status;
SELECT COUNT(*) as wedding_count FROM weddings WHERE slug = 'test-wedding-2024';
SELECT COUNT(*) as guest_count FROM wedding_guests WHERE wedding_id = '16dd6f94-1cd7-4446-b748-367ca94a2c18';