# Authentication & Authorization Implementation Plan

## Overview
Implement user authentication with Google OAuth and Magic Links, along with a comprehensive authorization system including admin capabilities and multi-owner support for weddings.

## Core Requirements

### Authentication Methods
1. **Google OAuth** - Primary social login
2. **Magic Links** - Email-based passwordless auth
3. **No username/password** - Keeping it simple and secure

### User Roles
1. **Public Users** - Can view wedding pages only
2. **Authenticated Users** - Can create weddings and access dashboard
3. **Wedding Owners** - Full control over their weddings
4. **Admins** - System-wide access and user management

### Access Control
- Wedding pages (`/[wedding-slug]`) - Public
- Wedding config/guests - Owners and Admins only
- Dashboard - Authenticated users
- Admin panel - Admins only

## Technical Architecture

### Database Schema
```sql
-- Users table extending Supabase auth
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Many-to-many wedding ownership
wedding_owners (
  id UUID PRIMARY KEY,
  wedding_id UUID REFERENCES weddings,
  user_id UUID REFERENCES users,
  granted_by UUID REFERENCES users,
  granted_at TIMESTAMPTZ,
  UNIQUE(wedding_id, user_id)
)

-- Update weddings table
ALTER TABLE weddings ADD created_by UUID REFERENCES users
```

### Route Structure
```
/app
├── (public)                    # No auth required
│   ├── /[wedding_slug]/page    # Public wedding pages
│   └── page.tsx                # Landing page
├── (auth)                      # Auth required
│   ├── /dashboard              # User dashboard
│   ├── /[wedding_slug]/config # Owner/Admin only
│   ├── /[wedding_slug]/guests # Owner/Admin only
│   └── /admin                  # Admin dashboard
└── /auth                       # Auth flows
    ├── /login                  # Login page
    ├── /callback               # OAuth callback
    └── /signout                # Sign out
```

### Middleware Protection
- Public routes: No checks
- Protected routes: Check authentication
- Owner routes: Verify ownership or admin
- Admin routes: Verify admin flag

## Implementation Phases

### Phase 1: Basic Authentication
- [ ] Set up Supabase Auth with SSR
- [ ] Configure Google OAuth
- [ ] Implement Magic Links
- [ ] Create login/signup page
- [ ] Session management with cookies

### Phase 2: User System
- [ ] Create users table and sync with auth
- [ ] User profile creation on signup
- [ ] Basic dashboard layout
- [ ] User settings page

### Phase 3: Authorization & Ownership
- [ ] Create wedding_owners table
- [ ] Update wedding creation to assign ownership
- [ ] Implement ownership checks
- [ ] Co-owner management UI
- [ ] Protect config/guests routes

### Phase 4: Admin System
- [ ] Add admin flag to users
- [ ] Create admin dashboard
- [ ] User management interface
- [ ] Wedding overview for admins
- [ ] Grant/revoke ownership tools

### Phase 5: Polish & Security
- [ ] Row Level Security policies
- [ ] Error handling and edge cases
- [ ] Loading states and optimistic updates
- [ ] Email notifications for ownership changes
- [ ] Audit logging for admin actions

## Security Considerations

### Authentication
- JWT tokens in httpOnly cookies
- PKCE flow for OAuth
- Rate limiting on magic links
- Session refresh handling

### Authorization
- RLS policies at database level
- Middleware checks at route level
- API endpoint validation
- Admin action logging

### Data Protection
- No client-side admin checks
- Server-side ownership validation
- Secure cookie configuration
- CSRF protection

## Success Criteria
1. Users can sign up/login with Google or email
2. Wedding pages remain publicly accessible
3. Config/guests pages properly protected
4. Multi-owner support working
5. Admin can manage all users and weddings
6. Smooth UX with proper loading states
7. Security best practices implemented

## Future Enhancements
- Two-factor authentication
- Social sharing from dashboard
- Bulk owner management
- Analytics dashboard
- Email verification requirements
- Password-based auth (if needed)