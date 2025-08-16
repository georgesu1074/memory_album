# Memory Album MVP Development Plan

## Overview
This is the master development plan for Memory Album MVP. Each epic represents a sprint, and we'll work through them sequentially. Check off tasks as completed and cross out when moved to feature-specific docs.

## Sprint 0: Project Setup & Boilerplate ✅ COMPLETE
**Goal**: Get the basic Next.js app running with all dependencies

### Epic: Initial Setup (COMPLETE - see /development-docs/project-setup/)
- [x] ~~Initialize Next.js 14 with TypeScript, Tailwind, App Router~~
- [x] ~~Set up Git repository and .gitignore~~
- [x] ~~Create .env.local with placeholder variables~~
- [x] ~~Install core dependencies (supabase-js, qdrant-js, @google/generative-ai)~~
- [x] ~~Set up project structure (components, lib, types, utils)~~
- [x] ~~Configure TypeScript paths and aliases~~
- [ ] ~~Set up Tailwind with mobile-first design tokens~~
- [ ] ~~Create basic layout component with responsive design~~
- [ ] ~~Add Framer Motion for animations~~
- [ ] ~~Configure Next.js for API routes~~
- [ ] ~~Set up error boundary and 404 page~~
- [ ] ~~Create loading states and skeleton components~~

## Sprint 1: Database & External Services Setup
**Goal**: Connect to Supabase, Qdrant, and Gemini

### Epic: Supabase Setup
- [ ] Create Supabase project (manual)
- [ ] Run database migrations from schema
- [ ] Set up Row Level Security policies
- [ ] Configure storage buckets for photos
- [ ] Create database types from schema
- [ ] Set up Supabase client singleton
- [ ] Test database connection
- [ ] Create seed data for development

### Epic: External Services Integration
- [ ] Set up Qdrant Cloud account (manual)
- [ ] Create Qdrant client wrapper
- [ ] Set up Google Cloud account for Gemini (manual)
- [ ] Create Gemini client wrapper with error handling
- [ ] Add environment variable validation
- [ ] Create service health check endpoint

## Sprint 2: Core Memory Submission Flow
**Goal**: Guests can submit memories with photos

### Epic: Memory Submission UI
- [ ] Create mobile-first submission form component
- [ ] Add memory type selector (Bride/Groom/Both)
- [ ] Create guest name input with validation
- [ ] Build textarea with character counter
- [ ] Implement photo upload component with preview
- [ ] Add client-side form validation
- [ ] Create submission loading states
- [ ] Build success confirmation screen
- [ ] Add "Share Another" flow
- [ ] Implement error handling UI

### Epic: Memory Submission API
- [ ] Create POST /api/weddings/[slug]/memories endpoint
- [ ] Implement multipart form data parsing
- [ ] Add server-side validation
- [ ] Upload photos to Supabase Storage
- [ ] Implement photo resizing/optimization
- [ ] Create memory record in database
- [ ] Add rate limiting (10/min per IP)
- [ ] Implement error logging
- [ ] Add success response with memory ID

## Sprint 3: AI Categorization & Embeddings
**Goal**: AI organizes memories and stores embeddings

### Epic: AI Categorization
- [ ] Implement Gemini function calling for categorization
- [ ] Create memory matching logic
- [ ] Build memory grouping system
- [ ] Generate dynamic titles for groups
- [ ] Create summary generation for grouped memories
- [ ] Add retry logic for AI failures
- [ ] Implement fallback categorization
- [ ] Add profanity/safety filtering

### Epic: Embedding Storage (Future-Ready)
- [ ] Generate embeddings for new memories
- [ ] Store embeddings in Qdrant with metadata
- [ ] Create background job for embedding generation
- [ ] Add embedding generation to submission flow
- [ ] Implement error handling for embedding failures
- [ ] Create monitoring for embedding pipeline

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