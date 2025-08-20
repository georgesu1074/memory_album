# Supabase Setup - Test Plan

## Test Overview
Verify that all database infrastructure is properly configured and working.

## Test Environment
- URL: http://localhost:3003/test-wedding-2024
- Database: Supabase (Production instance)
- Seed Data: Created via `npm run db:seed`

## Test Checklist

### Database Connection
- [x] Test page loads without errors
- [x] Wedding data displays correctly (Alex & Jordan)
- [x] Theme color applies correctly (#8B5CF6)

### Guest List Functionality
- [x] All 10 seeded guests display
- [x] Guests are sorted alphabetically by full name
- [x] Full names are correctly generated from first + last

### Memory Display
- [x] All 3 seeded memories display
- [x] Guest associations show correct names
- [x] AI categories display properly
- [x] Memories sorted by most recent first

### API Endpoints
- [x] `/api/test-connection` returns success (with timeout)
- [x] Connection test shows all environment variables present

### Database Schema
- [x] `weddings` table accessible
- [x] `wedding_guests` table accessible
- [x] `memories` table with guest references working
- [x] `memory_photos` table exists (not tested yet)
- [x] `memory_groups` table exists (not tested yet)
- [x] `memory_embeddings` table exists (not tested yet)

### Row Level Security
- [x] Public can view active weddings
- [x] Public can view guests for active weddings
- [x] Public can view memories for active weddings

### Seed Script
- [x] `npm run db:seed` runs without errors
- [x] Handles duplicate data gracefully
- [x] Creates expected test data

## Expected Results
- All database tables created and accessible
- RLS policies allow public read access
- Test data displays correctly
- No console errors or warnings

## Notes
- Storage bucket testing will be done in Sprint 2 with actual uploads
- Admin/service role testing deferred to Sprint 5
- Real guest search functionality to be tested in Sprint 2