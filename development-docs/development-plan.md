# Memory Album MVP Development Plan

## Overview

This is the master development plan for Memory Album MVP. Each epic represents a sprint, and we'll work through them sequentially. Check off tasks as completed and cross out when moved to feature-specific docs.

## Sprint 0: Project Setup & Boilerplate ✅ COMPLETE

**Goal**: Get the basic Next.js app running with all dependencies

### Epic: Initial Setup (COMPLETE - see /development-docs/project-setup/)

- [ ] ~~Initialize Next.js 14 with TypeScript, Tailwind, App Router~~
- [ ] ~~Set up Git repository and .gitignore~~
- [ ] ~~Create .env.local with placeholder variables~~
- [ ] ~~Install core dependencies (supabase-js, qdrant-js, @google/generative-ai)~~
- [ ] ~~Set up project structure (components, lib, types, utils)~~
- [ ] ~~Configure TypeScript paths and aliases~~
- [ ] ~~Set up Tailwind with mobile-first design tokens~~
- [ ] ~~Create basic layout component with responsive design~~
- [ ] ~~Add Framer Motion for animations~~
- [ ] ~~Configure Next.js for API routes~~
- [ ] ~~Set up error boundary and 404 page~~
- [ ] ~~Create loading states and skeleton components~~

## Sprint 1: Database & External Services Setup ✅ COMPLETE

**Goal**: Connect to Supabase, Qdrant, and Gemini

### Epic: Supabase Setup ✅ COMPLETE

- [ ] ~~Create Supabase project (manual)~~
- [ ] ~~Run database migrations from schema~~
- [ ] ~~Set up Row Level Security policies~~
- [ ] ~~Configure storage buckets for photos~~
- [ ] ~~Create database types from schema~~
- [ ] ~~Set up Supabase client singleton~~
- [ ] ~~Test database connection~~
- [ ] ~~Create seed data for development~~

### Epic: External Services Integration ✅ COMPLETE

- ~~[x] Set up Qdrant Cloud account (manual)~~ → external-services
- ~~[x] Create Qdrant client wrapper~~ → external-services
- ~~[x] Set up Google Cloud account for Gemini (manual)~~ → external-services
- ~~[x] Create Gemini client wrapper with error handling~~ → external-services
- ~~[x] Add environment variable validation~~ → external-services
- ~~[x] Create service health check endpoint~~ → external-services

## Sprint 2: Core Memory Submission Flow ✅ COMPLETE

**Goal**: Guests can submit memories with photos

### Epic: Memory Submission UI ✅ COMPLETE

- ~~[ ] Create mobile-first submission form component~~ → memory-submission
- ~~[ ] Add memory type selector (Bride/Groom/Both)~~ → memory-submission
- ~~[ ] Create guest name input with validation~~ → memory-submission
- ~~[ ] Build textarea with character counter~~ → memory-submission
- ~~[ ] Implement photo upload component with preview~~ → memory-submission
- ~~[ ] Add client-side form validation~~ → memory-submission
- ~~[ ] Create submission loading states~~ → memory-submission
- ~~[ ] Build success confirmation screen~~ → memory-submission
- ~~[ ] Add "Share Another" flow~~ → memory-submission
- ~~[ ] Implement error handling UI~~ → memory-submission

### Epic: Memory Submission API ✅ COMPLETE

- ~~[ ] Create GET /api/weddings/[slug]/guests/search endpoint~~ → memory-submission
- ~~[ ] Create POST /api/weddings/[slug]/memories endpoint~~ → memory-submission
- ~~[ ] Implement multipart form data parsing~~ → memory-submission
- ~~[ ] Add server-side validation~~ → memory-submission
- ~~[ ] Upload photos to Supabase Storage~~ → memory-submission
- ~~[ ] Implement photo resizing/optimization~~ → memory-submission
- ~~[ ] Create memory record in database~~ → memory-submission
- ~~[ ] Add rate limiting (10/min per IP)~~ → memory-submission
- ~~[ ] Implement error logging~~ → memory-submission
- ~~[ ] Add success response with memory ID~~ → memory-submission

## Sprint 3: AI Categorization & Embeddings ✅ COMPLETE

**Goal**: AI organizes memories and stores embeddings

### Epic: Event-Based AI Categorization ✅ COMPLETE

- ~~[ ] Add category, confidence, and metadata fields to memories table~~ → ai-categorization
- ~~[ ] Create event-categorizer with Gemini tool calls~~ → ai-categorization
- ~~[ ] Implement get_existing_categories tool function~~ → ai-categorization
- ~~[ ] Implement get_memories_in_category tool function~~ → ai-categorization
- ~~[ ] Add immediate async categorization to submission~~ → ai-categorization
- ~~[ ] Store categorization metadata and confidence~~ → ai-categorization

### Epic: Embedding Pipeline ✅ COMPLETE

- ~~[ ] Generate embeddings after categorization~~ → ai-categorization
- ~~[ ] Store in Qdrant with wedding namespace~~ → ai-categorization
- ~~[ ] Include category in embedding metadata~~ → ai-categorization
- ~~[ ] Handle embedding failures gracefully~~ → ai-categorization

### Epic: Retry System ✅ COMPLETE

- ~~[ ] Create `/api/cron/retry-categorization` endpoint~~ → ai-categorization
- ~~[ ] Implement exponential backoff (1, 2, 4 min)~~ → ai-categorization
- ~~[ ] Add max retry limit (3 attempts)~~ → ai-categorization
- ~~[ ] Monitor failure rates~~ → ai-categorization
- ~~[ ] Auto-stop when no failures~~ → ai-categorization

## Sprint 4: Memory Album Display ✅ COMPLETE

**Goal**: Beautiful display of collected memories

### Epic: Memory Album UI ✅ COMPLETE

- ~~[ ] Create album page with responsive grid~~ → memory-album
- ~~[ ] Build memory card component~~ → memory-album
- ~~[ ] Implement filter buttons (All/Bride/Groom/Both)~~ → memory-album
- ~~[ ] Add memory count displays~~ → memory-album
- ~~[ ] Create smooth animations for cards~~ → memory-album
- ~~[ ] Build infinite scroll or pagination~~ → memory-album
- ~~[ ] Add pull-to-refresh on mobile~~ → memory-album
- ~~[ ] Implement loading skeletons~~ → memory-album

### Epic: Memory Detail View ✅ COMPLETE

- ~~[ ] Create memory detail page/modal~~ → memory-album
- ~~[ ] Build photo carousel component~~ → memory-album
- ~~[ ] Display AI-generated summary~~ → memory-album
- ~~[ ] Show individual journal entries~~ → memory-album
- ~~[ ] Add contributor names and timestamps~~ → memory-album
- ~~[ ] Implement photo lightbox~~ → memory-album
- ~~[ ] Add sharing functionality~~ → memory-album
- ~~[ ] Create back navigation~~ → memory-album

## Sprint 5: Wedding Configuration ✅ COMPLETE

**Goal**: Simple setup for wedding couples

### Epic: Wedding Setup Flow ✅ COMPLETE

- ~~[ ] Create wedding configuration API endpoints~~ → wedding-config
- ~~[ ] Build wedding setup form~~ → wedding-config
- ~~[ ] Implement slug validation and generation~~ → wedding-config
- ~~[ ] Add theme color picker~~ → wedding-config
- ~~[ ] Create QR code generation~~ → wedding-config
- ~~[ ] Build Google Drive connection flow (manual OAuth)~~ → wedding-config
- ~~[ ] Add wedding activation toggle~~ → wedding-config
- ~~[ ] Create setup confirmation page~~ → wedding-config

### Epic: Guest List Management ✅ COMPLETE

- ~~[ ] Create guest list upload endpoint~~ → wedding-config
- ~~[ ] Build CSV parser for Zola format~~ → wedding-config
- ~~[ ] Add guest list management UI~~ → wedding-config
- ~~[ ] Implement bulk guest import~~ → wedding-config
- ~~[ ] Create guest search API endpoint~~ → wedding-config
- ~~[ ] Add manual guest entry form~~ → wedding-config
- ~~[ ] Build guest list export functionality~~ → wedding-config

### Epic: Landing Pages ✅ COMPLETE

- ~~[ ] Create wedding-specific landing page~~ → wedding-config
- ~~[ ] Build welcome message with couple names~~ → wedding-config
- ~~[ ] Add wedding date display~~ → wedding-config
- ~~[ ] Apply custom theme colors~~ → wedding-config
- ~~[ ] Create mobile-optimized layout~~ → wedding-config
- ~~[ ] Add meta tags for sharing~~ → wedding-config
- ~~[ ] Implement Open Graph images~~ → wedding-config

## Sprint 6: Google Drive Backup Implementation

**Goal**: Complete Google Drive integration for automatic photo backups

### Epic: Folder Management
- [ ] Create wedding folder structure on OAuth connection
  - Main folder: "Memory Album - {wedding-slug}"
  - Subfolders: All Photos, Bride Memories, Groom Memories, Together Memories
- [ ] Store folder IDs in database
- [ ] Handle existing folder detection
- [ ] Add folder creation retry logic

### Epic: Photo Upload Integration
- [ ] Implement Google Drive service class
- [ ] Add photo upload functionality
  - Upload to correct category subfolder
  - Handle large files with resumable uploads
  - Add retry logic for failed uploads
- [ ] Create background job for async uploads
- [ ] Queue photos for upload after guest submission
- [ ] Track upload status in database

### Epic: Token Management
- [ ] Implement access token refresh logic
- [ ] Handle expired tokens gracefully
- [ ] Add token encryption for security
- [ ] Create token validation endpoint
- [ ] Add automatic token refresh before expiry

### Epic: UI/UX Improvements
- [ ] Show Google Drive connection status
- [ ] Display connected Google account email
- [ ] Add disconnect/reconnect functionality
- [ ] Show upload progress/status
- [ ] Add manual sync button
- [ ] Create upload history log

### Epic: Error Handling & Recovery
- [ ] Handle Google Drive API quota limits
- [ ] Implement exponential backoff for retries
- [ ] Add fallback for failed uploads
- [ ] Create admin notification for failures
- [ ] Add manual retry mechanism

## Sprint 7: Polish & Production Readiness

**Goal**: Final touches and production deployment

### Epic: Performance Optimization

- [ ] Implement image optimization
- [ ] Add caching strategies
- [ ] Optimize API responses
- [ ] Implement lazy loading
- [ ] Add service worker for offline support
- [ ] Optimize bundle size
- [ ] Add performance monitoring

### Epic: Production Setup

- [ ] Configure production environment variables
- [ ] Set up Vercel deployment
- [ ] Configure custom domain
- [ ] Add SSL certificate
- [ ] Set up error tracking (Sentry free tier)
- [ ] Configure backup strategies
- [ ] Create production seed data

### Epic: Final Testing & Launch

- [ ] Complete end-to-end testing
- [ ] Test on various devices
- [ ] Verify all API endpoints
- [ ] Test error scenarios
- [ ] Validate data backups
- [ ] Create QR code materials
- [ ] Launch for your wedding!

## Definition of Done

Each epic is complete when:

1. All tasks checked off
2. Feature works on mobile devices
3. Error handling implemented
4. Manual testing completed
5. No console errors
6. Data persists correctly

## MVP Success Criteria

- [ ] Guests can submit memories with photos
- [ ] AI categorizes memories automatically
- [ ] Memories display in beautiful album
- [ ] All data backs up to Google Drive
- [ ] Works flawlessly on mobile
- [ ] Loads quickly (< 3s)
- [ ] Zero critical bugs
- [ ] Ready for 200 wedding guests

## Out of Scope for MVP

- User authentication for guests
- Video uploads
- Real-time updates (can add if time)
- Multiple weddings (just yours for now)
- Admin dashboard (use database directly)
- Email notifications
- Advanced analytics
- Payment processing
- Custom themes beyond color

## Sprint 8: Background Jobs & Data Export

**Goal**: Automated processing and data management

### Epic: Background Processing

- [ ] Set up Vercel Cron configuration
- [ ] Create embedding generation cron job
- [ ] Add job monitoring and logging
- [ ] Create retry mechanism for failed jobs
- [ ] Add job status tracking

### Epic: Data Export

- [ ] Generate JSON export of memories
- [ ] Add export status notifications
- [ ] Implement manual export trigger
- [ ] Create downloadable memory book (PDF/ZIP)

## Sprint 9: Security & Authentication (Future)

### Epic: Authentication System
- [ ] Add user accounts (email/password)
- [ ] Implement JWT authentication
- [ ] Add login/signup pages
- [ ] Link weddings to user accounts
- [ ] Add password reset flow

### Epic: Security Hardening
- [ ] Replace admin client usage with proper auth
- [ ] Add Row Level Security policies
- [ ] Implement ownership verification
- [ ] Add rate limiting to APIs
- [ ] Secure inactive wedding access
- [ ] Add audit logging

### Epic: OAuth Integration (Optional)
- [ ] Google Sign-In
- [ ] Link to bride/groom emails
- [ ] Social login options

## Notes

- Focus on mobile experience first
- Keep it simple - no over-engineering
- Test frequently on real devices
- Ask for help with manual setup steps
- Document any design changes
- Celebrate small wins!
- Security improvements planned for Sprint 8 (after MVP features)
