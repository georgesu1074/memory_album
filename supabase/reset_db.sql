-- Reset Database Script
-- WARNING: This will delete ALL data!
-- Run this to reset to a clean state with the latest schema

-- Drop all tables (CASCADE will handle foreign keys)
DROP TABLE IF EXISTS memory_embeddings CASCADE;
DROP TABLE IF EXISTS memories CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS wedding_guests CASCADE;
DROP TABLE IF EXISTS weddings CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_category_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS recalculate_category_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS recalculate_all_category_counts(UUID) CASCADE;

-- Now run the schema.sql to recreate everything
-- In Supabase Dashboard, run this file first, then schema.sql