# Bride & Groom Detail Tables - Implementation Tasks

## Phase 1: Database Schema Changes

### 1. Create Migration File for Detail Tables
- [ ] Create new migration file: `supabase/migrations/[timestamp]_add_bride_groom_details.sql`
- [ ] Create groom_details table with essential columns
- [ ] Create bride_details table with essential columns
- [ ] Add indexes for performance
- [ ] Set up Row Level Security policies

### 2. Update Weddings Table
- [ ] Add groom_id foreign key reference to weddings
- [ ] Add bride_id foreign key reference to weddings
- [ ] Create update triggers for timestamps

### 3. Migrate Existing Data
- [ ] Parse existing couple_names to extract individual names
- [ ] Create detail records for existing weddings
- [ ] Link weddings to new detail records via foreign keys
- [ ] Verify migration success with sample queries

### 4. Test Migration Locally
- [ ] Run migration on local Supabase instance
- [ ] Test with various name formats ("&", "and", special chars)
- [ ] Verify RLS policies work correctly
- [ ] Document any edge cases found

## Phase 2: TypeScript Type Updates

### 5. Create New Type Definitions
- [ ] Add GroomDetails interface in `types/database.ts`
- [ ] Add BrideDetails interface in `types/database.ts`
- [ ] Update Wedding interface to include foreign keys
- [ ] Add relation types for joined queries

### 6. Update Supabase Type Generation
- [ ] Run Supabase type generation if using auto-gen
- [ ] Manually verify generated types match schema
- [ ] Update any custom type extensions

### 7. Create Helper Functions
- [ ] Function to get full wedding data with details
- [ ] Function to get display names (with fallback to name)
- [ ] Function to format couple names for display
- [ ] Function to get individual by role (bride/groom)

## Phase 3: API Endpoint Updates

### 8. Update Wedding Creation
- [ ] Modify POST `/api/weddings` to create detail records
- [ ] Accept groom_name, groom_email, bride_name, bride_email
- [ ] Create wedding and details in transaction
- [ ] Return complete wedding object with details

### 9. Update Wedding Fetching
- [ ] Modify wedding queries to JOIN with detail tables
- [ ] Update `/api/weddings/[slug]` to include details
- [ ] Add helper endpoint to get individual details
- [ ] Ensure backward compatibility

### 10. Create Detail Management Endpoints
- [ ] GET `/api/weddings/[slug]/groom` - fetch groom details
- [ ] GET `/api/weddings/[slug]/bride` - fetch bride details
- [ ] PATCH endpoints for updating details (future)
- [ ] Add authentication checks for updates

### 11. Update Memory Submission API
- [ ] Pass actual names to Gemini AI for categorization
- [ ] Use display names in response messages
- [ ] Update memory type detection logic

## Phase 4: Frontend Component Updates

### 12. Update Wedding Page Header
- [ ] File: `components/WeddingPageClient.tsx`
- [ ] Fetch and display individual names
- [ ] Use display_name if available, fallback to name
- [ ] Show formatted couple names

### 13. Personalize Memory Submission Modal
- [ ] File: `components/MemorySubmissionModal.tsx`
- [ ] Replace "Bride" button with actual bride name
- [ ] Replace "Groom" button with actual groom name
- [ ] Update "Both" to show both names
- [ ] Pass names to form submission

### 14. Update Category Tab Labels
- [ ] File: `components/WeddingPageClient.tsx`
- [ ] Replace "Bride" tab with bride's name
- [ ] Replace "Groom" tab with groom's name
- [ ] Update "Together" tab label if needed
- [ ] Maintain tab functionality

### 15. Update Memory Display Components
- [ ] File: `components/memories/MemoryDetailModal.tsx`
- [ ] Show actual names in memory type badges
- [ ] File: `components/memories/CategoryCard.tsx`
- [ ] Display personalized type indicators
- [ ] File: `components/memories/MemoryFilters.tsx`
- [ ] Use actual names in filter buttons

### 16. Update Memory Grid
- [ ] File: `components/memories/MemoryGrid.tsx`
- [ ] Pass names through props
- [ ] Update filter display with actual names
- [ ] Ensure proper type handling

## Phase 5: Data Updates

### 17. Update Seed Data Script
- [ ] File: `scripts/seed-data.ts`
- [ ] Create detail records when seeding
- [ ] Use new schema structure
- [ ] Test seed script thoroughly

### 18. Update Category Generation
- [ ] File: `lib/db/categories.ts`
- [ ] Use actual names in prompts
- [ ] Update category descriptions
- [ ] Pass names to AI service

### 19. Update AI Integration
- [ ] File: `lib/ai/gemini.ts`
- [ ] Accept individual names as parameters
- [ ] Improve categorization with explicit names
- [ ] Update prompt templates

## Phase 6: Testing & Validation

### 20. Unit Tests
- [ ] Test name parsing logic
- [ ] Test detail record creation
- [ ] Test display name fallbacks
- [ ] Test data migration functions

### 21. Integration Tests
- [ ] Test complete wedding creation flow
- [ ] Test memory submission with names
- [ ] Test category generation
- [ ] Test all API endpoints

### 22. Manual Testing Checklist
- [ ] Create new wedding with details
- [ ] Submit memories for each person
- [ ] Verify names appear correctly everywhere
- [ ] Test with various name formats
- [ ] Check mobile responsiveness
- [ ] Test with missing optional fields

### 23. Edge Case Testing
- [ ] Names with apostrophes (O'Brien)
- [ ] Names with hyphens (Smith-Jones)
- [ ] Single word names
- [ ] Very long names
- [ ] Unicode characters in names

## Phase 7: Documentation

### 24. Update Database Documentation
- [ ] Update `/docs/database-schema.md`
- [ ] Document new tables and relationships
- [ ] Add migration notes
- [ ] Update ER diagram if exists

### 25. Update API Documentation
- [ ] Document new endpoints
- [ ] Update existing endpoint docs
- [ ] Add example requests/responses
- [ ] Note breaking changes

### 26. Update README
- [ ] Note schema changes
- [ ] Update setup instructions
- [ ] Add migration guide
- [ ] Update environment variables if needed

## Phase 8: Deployment

### 27. Pre-deployment Preparation
- [ ] Backup production database
- [ ] Test migration on staging
- [ ] Prepare rollback plan
- [ ] Schedule maintenance window if needed

### 28. Deploy Database Changes
- [ ] Run migration on Supabase production
- [ ] Verify tables created correctly
- [ ] Check data migration success
- [ ] Test sample queries

### 29. Deploy Application
- [ ] Deploy to Vercel
- [ ] Verify environment variables
- [ ] Test critical paths
- [ ] Monitor error logs

### 30. Post-deployment Validation
- [ ] Test existing weddings still work
- [ ] Create test wedding with details
- [ ] Submit test memories
- [ ] Verify all UI shows correct names
- [ ] Check performance metrics

## Phase 9: Cleanup

### 31. Remove Old Code (After Stability)
- [ ] Remove couple_names references
- [ ] Clean up deprecated functions
- [ ] Remove backward compatibility code
- [ ] Update all documentation

### 32. Optimize Queries
- [ ] Review query performance
- [ ] Add indexes if needed
- [ ] Optimize JOINs
- [ ] Cache frequently accessed data

## Success Criteria

Before marking complete:
- [ ] All existing weddings migrated successfully
- [ ] New weddings created with detail records
- [ ] Names displayed correctly throughout app
- [ ] No console errors
- [ ] No API errors
- [ ] Performance unchanged or improved
- [ ] All tests passing

## Future Enhancement Opportunities

After basic implementation:
- [ ] Add profile photo upload
- [ ] Implement email authentication
- [ ] Build individual dashboards
- [ ] Add privacy controls
- [ ] Create notification system
- [ ] Add theme customization
- [ ] Implement memory moderation

## Estimated Timeline

- Database & Migration: 3-4 hours
- API Updates: 3-4 hours
- Frontend Updates: 4-5 hours
- Testing: 2-3 hours
- Documentation: 1-2 hours
- Deployment: 1-2 hours

**Total: 14-20 hours**

## Notes

- Start with essential columns only
- Add features incrementally
- Test thoroughly at each phase
- Keep migrations reversible
- Document all changes