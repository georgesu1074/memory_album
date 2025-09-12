# Authentication & Authorization Tasks

## Phase 1: Basic Authentication Setup

### Supabase Auth Configuration
- [ ] Install @supabase/ssr package for Next.js 15
- [ ] Create server and client Supabase utilities
- [ ] Set up middleware for session handling
- [ ] Configure auth cookies settings
- [ ] Update environment variables

### Google OAuth Setup
- [ ] Enable Google provider in Supabase dashboard
- [ ] Configure redirect URLs for dev and production
- [ ] Add Google client ID to env variables
- [ ] Test OAuth flow end-to-end

### Magic Links Implementation
- [ ] Configure email templates in Supabase
- [ ] Set up magic link endpoint
- [ ] Create email input component
- [ ] Handle magic link callbacks
- [ ] Add rate limiting

### Login/Signup Page
- [ ] Create /auth/login page layout
- [ ] Add Google sign-in button
- [ ] Add magic link email form
- [ ] Implement loading states
- [ ] Add error handling
- [ ] Create success redirect logic

## Phase 2: User System

### Database Setup
- [ ] Create users table migration
- [ ] Add RLS policies for users table
- [ ] Create user profile sync trigger
- [ ] Test user creation flow

### User Profile Management
- [ ] Auto-create profile on signup
- [ ] Sync Google profile data
- [ ] Handle avatar URLs
- [ ] Update user names

### Dashboard Implementation
- [ ] Create /dashboard route group
- [ ] Build dashboard layout component
- [ ] Add user profile section
- [ ] Create "My Weddings" list
- [ ] Add "Create Wedding" button
- [ ] Implement loading skeleton

## Phase 3: Authorization & Ownership

### Database Updates
- [ ] Create wedding_owners table migration
- [ ] Add created_by to weddings table
- [ ] Create ownership RLS policies
- [ ] Add indexes for performance

### Ownership Logic
- [ ] Update wedding creation to assign owner
- [ ] Create ownership check utilities
- [ ] Add co-owner grant functionality
- [ ] Implement ownership revoke
- [ ] Build ownership transfer

### Route Protection
- [ ] Create auth middleware
- [ ] Protect /config routes
- [ ] Protect /guests routes
- [ ] Handle unauthorized access
- [ ] Add redirect logic

### Co-owner Management UI
- [ ] Add "Share Ownership" button to dashboard
- [ ] Create owner management modal
- [ ] Build email invitation flow
- [ ] Show current owners list
- [ ] Add remove owner functionality

## Phase 4: Admin System

### Admin Infrastructure
- [ ] Add is_admin field to users
- [ ] Create admin check utilities
- [ ] Set up admin middleware
- [ ] Build admin API routes

### Admin Dashboard
- [ ] Create /admin route group
- [ ] Build admin layout
- [ ] Add statistics overview
- [ ] Create navigation menu

### User Management
- [ ] Build users list table
- [ ] Add search functionality
- [ ] Create user detail view
- [ ] Add admin toggle
- [ ] Implement user impersonation

### Wedding Management
- [ ] Create weddings overview
- [ ] Add filtering options
- [ ] Build quick actions menu
- [ ] Add ownership management
- [ ] Create bulk operations

## Phase 5: Polish & Security

### Security Hardening
- [ ] Implement all RLS policies
- [ ] Add CSRF protection
- [ ] Set secure cookie flags
- [ ] Add rate limiting to APIs
- [ ] Implement audit logging

### UX Improvements
- [ ] Add loading spinners
- [ ] Create error boundaries
- [ ] Implement toast notifications
- [ ] Add confirmation dialogs
- [ ] Create empty states

### Email Notifications
- [ ] Set up email service
- [ ] Create ownership invite template
- [ ] Add welcome email
- [ ] Build notification preferences

### Testing & Validation
- [ ] Test auth flows
- [ ] Verify ownership checks
- [ ] Test admin capabilities
- [ ] Check edge cases
- [ ] Validate security measures

## Post-Launch Tasks
- [ ] Make George admin in database
- [ ] Document admin procedures
- [ ] Create user guide
- [ ] Set up monitoring
- [ ] Plan future enhancements