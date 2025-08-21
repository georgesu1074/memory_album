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

## Sprint 1: Database & External Services Setup

**Goal**: Connect to Supabase, Qdrant, and Gemini

### Epic: Supabase Setup (IN PROGRESS - see /development-docs/supabase-setup/)

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

## Sprint 2: Core Memory Submission Flow

**Goal**: Guests can submit memories with photos

### Epic: Memory Submission UI

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

### Epic: Memory Submission API

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

## Sprint 3: AI Categorization & Embeddings

**Goal**: AI organizes memories and stores embeddings

### Epic: Simple AI Categorization (SIMPLIFIED APPROACH)

- ~~[ ] Add category and processing_status fields to memories table~~ → ai-categorization
- ~~[ ] Create simple categorizer with Gemini tool calls~~ → ai-categorization
- ~~[ ] Implement `/api/cron/categorize` endpoint~~ → ai-categorization
- ~~[ ] Add basic retry logic for failures~~ → ai-categorization
- ~~[ ] Test categorization with sample memories~~ → ai-categorization

### Epic: Embedding Storage (Future-Ready)

- ~~[ ] Generate embeddings for categorized memories~~ → ai-categorization
- ~~[ ] Store embeddings in Qdrant with metadata~~ → ai-categorization
- ~~[ ] Add embedding generation to categorization flow~~ → ai-categorization
- ~~[ ] Create simple monitoring endpoint~~ → ai-categorization

## Sprint 4: Memory Album Display

**Goal**: Beautiful display of collected memories

### Epic: Memory Album UI

- [ ] Create album page with responsive grid
- [ ] Build memory card component
- [ ] Implement filter buttons (All/Bride/Groom/Both)
- [ ] Add memory count displays
- [ ] Create smooth animations for cards
- [ ] Build infinite scroll or pagination
- [ ] Add pull-to-refresh on mobile
- [ ] Implement loading skeletons

### Epic: Memory Detail View

- [ ] Create memory detail page/modal
- [ ] Build photo carousel component
- [ ] Display AI-generated summary
- [ ] Show individual journal entries
- [ ] Add contributor names and timestamps
- [ ] Implement photo lightbox
- [ ] Add sharing functionality
- [ ] Create back navigation

## Sprint 5: Wedding Configuration

**Goal**: Simple setup for wedding couples

### Epic: Wedding Setup Flow

- [ ] Create wedding configuration API endpoints
- [ ] Build wedding setup form
- [ ] Implement slug validation and generation
- [ ] Add theme color picker
- [ ] Create QR code generation
- [ ] Build Google Drive connection flow (manual OAuth)
- [ ] Add wedding activation toggle
- [ ] Create setup confirmation page

### Epic: Guest List Management

- [ ] Create guest list upload endpoint
- [ ] Build CSV parser for Zola format
- [ ] Add guest list management UI
- [ ] Implement bulk guest import
- [ ] Create guest search API endpoint
- [ ] Add manual guest entry form
- [ ] Build guest list export functionality

### Epic: Landing Pages

- [ ] Create wedding-specific landing page
- [ ] Build welcome message with couple names
- [ ] Add wedding date display
- [ ] Apply custom theme colors
- [ ] Create mobile-optimized layout
- [ ] Add meta tags for sharing
- [ ] Implement Open Graph images

## Sprint 6: Background Jobs & Data Export

**Goal**: Automated backups and data management

### Epic: Background Processing

- [ ] Set up Vercel Cron configuration
- [ ] Create embedding generation cron job
- [ ] Implement Google Drive backup job
- [ ] Add job monitoring and logging
- [ ] Create retry mechanism for failed jobs
- [ ] Add job status tracking

### Epic: Data Export

- [ ] Create Google Drive integration
- [ ] Implement photo backup to Drive
- [ ] Generate JSON export of memories
- [ ] Create organized folder structure
- [ ] Add export status notifications
- [ ] Implement manual export trigger

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

## Notes

- Focus on mobile experience first
- Keep it simple - no over-engineering
- Test frequently on real devices
- Ask for help with manual setup steps
- Document any design changes
- Celebrate small wins!
