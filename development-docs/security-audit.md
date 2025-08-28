# Security Audit - Wedding Configuration System

## Date: 2025-08-28

## Current Security Issues

### 1. Admin Client Overuse
**Issue**: Multiple API endpoints use `createAdminClient()` which bypasses Row Level Security (RLS)
**Risk**: Medium - Exposes data without proper authorization checks
**Affected Files**:
- `/app/[wedding_slug]/page.tsx` - Uses admin client to fetch all wedding data
- `/app/api/weddings/validate-slug/route.ts` - Uses admin unnecessarily for slug checks
- `/app/api/weddings/[slug]/validate-slug/route.ts` - Same issue
- `/app/api/weddings/[slug]/config/route.ts` - No auth check for configuration access
- `/app/api/weddings/[slug]/activate/route.ts` - No ownership verification

### 2. Missing Authentication System
**Issue**: No user authentication or ownership verification
**Risk**: High - Anyone can modify any wedding if they know the slug
**Impact**: 
- Wedding configuration pages are unprotected
- API endpoints lack ownership checks
- No way to verify wedding owners

### 3. Public Access to Inactive Weddings
**Issue**: Using admin client shows inactive weddings to anyone
**Risk**: Low - May expose draft/test weddings
**Current Behavior**: Shows preview banner but still displays content

## Recommendations for Future Security Improvements

### Phase 1: Quick Wins (Before Auth System)
1. **Add temporary owner tokens**
   - Generate unique tokens on wedding creation
   - Store in cookies/localStorage
   - Check tokens for config access
   - Simple but better than nothing

2. **Limit admin client usage**
   - Only use for wedding creation
   - Use regular client for validations
   - Add TODO comments where auth needed

3. **Add rate limiting**
   - Limit wedding creation per IP
   - Limit API calls per session
   - Prevent abuse

### Phase 2: Proper Authentication (Sprint 8+)
1. **Implement user accounts**
   - Email/password authentication
   - Link weddings to user accounts
   - Proper JWT tokens

2. **Add Row Level Security policies**
   - Weddings only visible to owners
   - Guests can view active weddings
   - Memories tied to wedding access

3. **OAuth integration**
   - Google Sign-In for convenience
   - Link to bride/groom emails
   - Social login options

### Phase 3: Advanced Security
1. **Two-factor authentication for owners**
2. **Audit logging for all changes**
3. **Encrypted sensitive data**
4. **GDPR compliance features**

## Security Decision for MVP

**Current Approach**: Keep it simple for MVP development
- Use admin client where needed for functionality
- Document security TODOs in code
- Plan to add auth in later sprint
- Focus on features first, security hardening later

**Rationale**:
- No real users yet (just testing)
- Need to validate product features first
- Security can be added without breaking changes
- Development velocity is priority for MVP

## Code TODOs Added

```typescript
// TODO: Add authentication check before showing inactive weddings
// TODO: Implement proper ownership verification
// TODO: Replace admin client with regular client + auth
```

## Next Steps

1. Continue with feature development
2. Add security sprint after MVP features complete
3. Implement authentication system
4. Audit and harden all endpoints
5. Add monitoring and logging